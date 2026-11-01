import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterRequestDto {
    @IsString({ message: 'name must be string' })
    @IsNotEmpty({ message: 'name must be not empty string' })
    @MaxLength(100, { message: 'name must be less 100 characters' })
    name: string;
    @IsString({ message: 'email must be string' })
    @IsNotEmpty({ message: 'email must be not empty string' })
    @IsEmail({}, { message: 'email must be an email' })
    email: string;

    @IsString({ message: 'password must be string' })
    @IsNotEmpty({ message: 'password must be not empty string' })
    @MinLength(6, { message: 'password must be longer 6 characters' })
    @MaxLength(255, { message: 'password must be less 255 characters' })
    password: string;
}