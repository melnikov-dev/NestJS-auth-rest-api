import { AuthGuard } from "@nestjs/passport";

export class JwtGuard extends AuthGuard('jwt') {} // ??? откуда взялось jwt название гварда?