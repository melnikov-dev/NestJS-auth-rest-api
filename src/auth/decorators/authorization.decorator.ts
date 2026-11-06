import { applyDecorators, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../guards/jwt.guard.js";

export function Authorization() {
    return applyDecorators(UseGuards(JwtGuard));
}