import { AuthGuard } from "@nestjs/passport";

export class JwtGuard extends AuthGuard('jwt') {} // jwt - стандартное имя стратегии в passport-jwt