import { Injectable } from '@nestjs/common';
import {Usuario} from "./Usuario";
import {LoginDto} from "./dto/Login.Dto";
import {RegisterDto} from "./dto/Register.Dto";

//Injectable significa que puedes usar esta clase en otras clases
@Injectable()
export class UsersService {
    login(loginDto: LoginDto) {
    //TODO:Logica para comprobar datos del login.

        // Simulación de usuario (fake DB por ahora)
        if (loginDto.email === 'test@test.com' && loginDto.password === '1234') {
            return {
                success: true,
                message: 'Login correcto',
                user: {
                    email: loginDto.email
                }
            };
        }

        return {
            success: false,
            message: 'Credenciales incorrectas'
        };
    }

    register (registerDto: RegisterDto) {
        // TODO:Aquí iría la lógica para guardar el usuario en la base de datos
        //regex \w:Matches word characters (a-z, A-Z, 0-9, _)
        // +: al menos 1 o mas elementos del previo
        //\.: pones la barra ya que es un elemento reservado para que valide que haya un punto.
        const emailPattern = /\w+@\w+\.\w+/
        const verificarEmail = emailPattern.test(registerDto.email);
        if (!verificarEmail) {
            return {
                success: false,
                message: 'Correo electrónico no válido'
            };
        }
        const newUser = new Usuario(0,
            registerDto.name,
            registerDto.apellido,
            registerDto.email,
            registerDto.password,
            registerDto.telefono);

        return {
            success: true,
            message: 'Credenciales registradas correctamente',
            user: {
                email: registerDto.email
            }
        };
    }
}