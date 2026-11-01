import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterRequestDto } from './dto/register.dto.js';
import { hash, verify } from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt.interface.js';
import { LoginRequestDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
    private readonly JWT_SECRET: string;
    private readonly JWT_ACCESS_TOKEN_TTL: string;
    private readonly JWT_REFRESH_TOKEN_TTL: string;

    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) {
        this.JWT_SECRET = configService.getOrThrow<string>('JWT_SECRET')
        this.JWT_ACCESS_TOKEN_TTL = configService.getOrThrow<string>('JWT_ACCESS_TOKEN_TTL')
        this.JWT_REFRESH_TOKEN_TTL = configService.getOrThrow<string>('JWT_REFRESH_TOKEN_TTL')
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

    async register(dto: RegisterRequestDto) {
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

        return this.generateTokens(user.id)
    }

    async login(dto: LoginRequestDto) {
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

        return this.generateTokens(user.id);
    }
}
