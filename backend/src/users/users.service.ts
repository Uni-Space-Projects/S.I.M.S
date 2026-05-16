import { Injectable } from '@nestjs/common';
import {Usuario} from "./Usuario";
import {LoginDto} from "./dto/Login.Dto";
import {RegisterDto} from "./dto/Register.Dto";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './users.entity';

//Injectable significa que puedes usar esta clase en otras clases
@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
    ) {}

    async login(loginDto: LoginDto) {

        const user = await this.userRepository.findOne({
            where: { correo: loginDto.email }
        });

        if (!user || user.contrasena !== loginDto.password) {
            return {
                success: false,
                message: 'Credenciales incorrectas'
            };
        }

        return {
            success: true,
            message: 'Login correcto',
            user: {
                email: user.correo
            }
        };
    }

    async register(registerDto: RegisterDto) {

        const emailPattern = /\w+@\w+\.\w+/;
        const verificarEmail = emailPattern.test(registerDto.email);

        if (!verificarEmail) {
            return {
                success: false,
                message: 'Correo electrónico no válido'
            };
        }

        // 🔍 verificar si ya existe
        const userExists = await this.userRepository.findOne({
            where: { correo: registerDto.email }
        });

        if (userExists) {
            return {
                success: false,
                message: 'El usuario ya existe'
            };
        }

        // 🧱 crear usuario en DB
        const user = this.userRepository.create({
            nombre: registerDto.name,
            apellido: registerDto.apellido,
            correo: registerDto.email,
            contrasena: registerDto.password,
            telefono: registerDto.telefono
        });

        await this.userRepository.save(user);

        return {
            success: true,
            message: 'Usuario registrado correctamente',
            user: {
                email: user.correo
            }
        };
    }
}