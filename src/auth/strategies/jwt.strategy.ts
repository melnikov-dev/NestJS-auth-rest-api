import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "../auth.service.js";
import { ConfigService } from "@nestjs/config";
import { JwtPayload } from "../interfaces/jwt.interface.js";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService
    ) {
        super({ // вызов конструктора родительского класса PassportStrategy
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
            algorithms: ['HS256'],
        })
    }

    // NestJS ожидает метод с названием validate, чтобы под капотом в Passport вызвать verify callback
    // Passport под капотом кладет в req.user результат вызова validate
    async validate(payload: JwtPayload) {
        return await this.authService.validate(payload.id);
    }
}