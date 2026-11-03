import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterRequestDto } from './dto/register.dto.js';
import { hash, verify } from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt.interface.js';
import { LoginRequestDto } from './dto/login.dto.js';
import { Request, Response } from 'express';
import { isDev } from '../utils/is-dev.util.js';
import { ttlToMs } from '../utils/ttl-to-ms.util.js';

@Injectable()
export class AuthService {
    private readonly JWT_ACCESS_TOKEN_TTL: string;
    private readonly JWT_REFRESH_TOKEN_TTL: string;
    private readonly COOKIE_DOMAIN: string;
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) {
        this.JWT_ACCESS_TOKEN_TTL = configService.getOrThrow<string>('JWT_ACCESS_TOKEN_TTL')
        this.JWT_REFRESH_TOKEN_TTL = configService.getOrThrow<string>('JWT_REFRESH_TOKEN_TTL')
        this.COOKIE_DOMAIN = configService.getOrThrow<string>('COOKIE_DOMAIN')
    }

    private generateTokens(id: string) {
        const payload: JwtPayload = { id };

        const accessToken = this.jwtService.sign(
            payload,
            { expiresIn: this.JWT_ACCESS_TOKEN_TTL as JwtSignOptions['expiresIn'] }
        )

        const refreshToken = this.jwtService.sign(
            payload,
            { expiresIn: this.JWT_REFRESH_TOKEN_TTL as JwtSignOptions['expiresIn'] }
        )

        return { accessToken, refreshToken }
    }

    private setCookie(res: Response, cookieName: string, value: string, maxAge: number) {
        res.cookie(cookieName, value, {
            httpOnly: true,
            domain: this.COOKIE_DOMAIN,
            maxAge: maxAge,
            secure: !isDev(this.configService),
            sameSite: isDev(this.configService) ? 'none' : 'lax'
        })
    }

    private clearCookie(res: Response, name: string) {
        res.clearCookie(name, {
            httpOnly: true,
            domain: this.COOKIE_DOMAIN,
            secure: !isDev(this.configService),
            sameSite: isDev(this.configService) ? 'none' : 'lax',
        });
    }

    private auth(res: Response, id: string) {
        const { accessToken, refreshToken } = this.generateTokens(id);
        const maxAge: number = ttlToMs(this.JWT_REFRESH_TOKEN_TTL);
        const cookieName: string = 'refreshToken';

        this.setCookie(
            res,
            cookieName,
            refreshToken,
            maxAge,
        )

        return { accessToken };
    }

    async register(res: Response, dto: RegisterRequestDto) {
        const { name, email, password } = dto;

        const existUser = await this.prismaService.user.findUnique({
            where: { email }
        })

        if (existUser) {
            throw new ConflictException('User with this email exist')
        }

        const user = await this.prismaService.user.create({
            data: {
                name,
                email,
                password: await hash(password),
            },
        });

        return this.auth(res, user.id)
    }

    async login(res: Response, dto: LoginRequestDto) {
        const { email, password } = dto;

        const user = await this.prismaService.user.findUnique({
            where: { email },
            select: { id: true, password: true }
        })

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const isValidPassword: boolean = await verify(user.password, password);
        if (!isValidPassword) {
            throw new UnauthorizedException('Invalid email or password');
        }

        return this.auth(res, user.id)
    }

    async logout(res: Response) {
        this.clearCookie(res, 'refreshToken');
        return true
    }

    async validate(id: string) {
        const user = await this.prismaService.user.findUnique({ where: { id } })

        if (!user) {
            throw new NotFoundException('User not found')
        }

        return user
    }

    async refresh(req: Request, res: Response) {
        const refreshToken = req.cookies['refreshToken'];

        if (!refreshToken) {
            throw new UnauthorizedException('Invalid refresh token')
        }

        const payload: JwtPayload = await this.jwtService.verifyAsync(refreshToken);

        if (!payload) {
            throw new UnauthorizedException('Invalid payload in refresh token')
        }

        const user = await this.prismaService.user.findUnique({
            where: {
                id: payload.id
            },
            select: {
                id: true
            }
        })

        if (!user) {
            throw new NotFoundException('User not found')
        }

        return this.auth(res, user.id)
    }
}
