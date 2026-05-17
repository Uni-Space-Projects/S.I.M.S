import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {

    @IsString()
    @MinLength(2)
    name: string;

    @IsString()
    @MinLength(2)
    apellido: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @MinLength(7)
    telefono: string;

    rol: "usuario";

}