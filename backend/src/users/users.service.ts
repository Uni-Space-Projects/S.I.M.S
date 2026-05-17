import {Injectable} from '@nestjs/common';
import {LoginDto} from "./dto/Login.Dto";
import {RegisterDto} from "./dto/Register.Dto";
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {UserEntity} from './users.entity';
import * as bcrypt from 'bcrypt';
import {Role} from "./roles.enum";

//Injectable significa que puedes usar esta clase en otras clases
@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
    ) {}

    async login(loginDto: LoginDto) {

        const user = await this.userRepository.findOne({
            where: { email: loginDto.email }
        });

        if (!user){
            return {
                success: false,
                message: 'Usuario no encontrado'
            }
        }
        // @ts-ignore
        const passwordMatch = await bcrypt.compare(
            loginDto.password,
            user.contrasena
        );

        if (!passwordMatch) {
            return {
                success: false,
                message: 'Credenciales incorrectas'
            };
        }
        else{
            return {
                success: true,
                message: 'Login correcto',
                user: {
                    email: user.email
                }
            };
        }

        //if (user.rol === Role.ADMIN) {
            //TODO:Funcionalidades agregadas si el usuario es admin.
        //}
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
            where: { email: registerDto.email }
        });

        if (userExists) {
            return {
                success: false,
                message: 'El usuario ya existe'
            };
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        // crear usuario en DB
        const user = this.userRepository.create({
            nombre: registerDto.name,
            apellido: registerDto.apellido,
            email: registerDto.email,
            contrasena: hashedPassword,
            telefono: registerDto.telefono,
            rol: Role.USER
        });

        await this.userRepository.save(user);

        return {
            success: true,
            message: 'Usuario registrado correctamente',
            user: {
                email: user.email
            }
        };
    }
}