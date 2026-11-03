import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class LoginRequestDto {
    @ApiProperty({
        description: 'Почтовый адрес пользователя',
        example: 'user@gmail.com',
    })
    @IsString({ message: 'email must be string' })
    @IsNotEmpty({ message: 'email must be not empty string' })
    @IsEmail({}, { message: 'email must be an email' })
    email: string;

    @ApiProperty({
        description: 'Пароль от аккаунта',
        example: 'qwerty123456',
        minLength: 6,
        maxLength: 255,
    })
    @IsString({ message: 'password must be string' })
    @IsNotEmpty({ message: 'password must be not empty string' })
    @MinLength(6, { message: 'password must be longer 6 characters' })
    @MaxLength(255, { message: 'password must be less 255 characters' })
    password: string;
}