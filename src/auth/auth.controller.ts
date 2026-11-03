import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterRequestDto } from './dto/register.dto.js';
import { LoginRequestDto } from './dto/login.dto.js';
import type { Request, Response } from 'express';
import { ApiBadRequestResponse, ApiConflictResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto.js';
import { Authorization } from './decorators/authorization.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiOperation({
    summary: 'Регистрация аккаунта',
    description: 'Создает новый аккаунт для пользователя',
  })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректное тело запроса' })
  @ApiConflictResponse({ description: 'Такой пользователь уже существует' })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Res({ passthrough: true }) res: Response, @Body() dto: RegisterRequestDto) {
    return await this.authService.register(res, dto);
  }

  @ApiOperation({
    summary: 'Вход в личный кабинет',
    description: 'Авторизует пользователя и выдает токены доступа',
  })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректное тело запроса' })
  @ApiNotFoundResponse({ description: 'Неверный email или пароль' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Res({ passthrough: true }) res: Response, @Body() dto: LoginRequestDto) {
    return await this.authService.login(res, dto);
  }

  @ApiOperation({
    summary: 'Обновление токенов',
    description: 'Генерация и выдача новых токенов доступа',
  })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Недействительный токен доступа' })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return await this.authService.refresh(req, res);
  }

  @ApiOperation({
    summary: 'Выход из личного кабинета',
    description: 'Сброс сессии пользователя и очистка токенов доступа',
  })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    return await this.authService.logout(res);
  }

  @Authorization()
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async me(@Req() req: Request) {
    return req.user; // ??? откуда он в req взялся?
  }
}
