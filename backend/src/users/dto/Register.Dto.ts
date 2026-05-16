import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {

    @IsString()
    @MinLength(2)
    name: string;

    @IsString()
    @MinLength(2)
    apellido: string;

    @IsEmail()
    correo: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @MinLength(7)
    telefono: string;

    @IsString()
    email: string;
}