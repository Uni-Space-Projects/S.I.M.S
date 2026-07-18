import { Injectable, NotFoundException } from '@nestjs/common';
import { LoginDto } from './dto/Login.Dto';
import { RegisterDto } from './dto/Register.Dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserEntity } from './users.entity';
import * as bcrypt from 'bcrypt';
import { Role } from './roles.enum';
import { UnauthorizedException } from '@nestjs/common';
import { ConflictException } from '@nestjs/common';

//Injectable significa que puedes usar esta clase en otras clases
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async login(loginDto: LoginDto) {
    //Esto ya retorna el objeto instanciado.
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const passwordMatch = await bcrypt.compare(
      loginDto.password,
      user.contrasena,
    );

    if (!passwordMatch) {
      throw new NotFoundException('Usuario no encontrado');
    } else {
      return new UserEntity(
        user.id,
        user.nombre,
        user.apellido,
        user.email,
        user.contrasena,
        user.telefono,
        user.rol,
        user.publications,
      );
    }

    //if (user.rol === Role.ADMIN) {
    //TODO:Funcionalidades agregadas si el usuario es admin.
    //}
  }

  async register(registerDto: RegisterDto) {
    const emailPattern = /\w+@\w+\.\w+/;
    const verificarEmail = emailPattern.test(registerDto.email);

    if (!verificarEmail) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    //  verificar si ya existe
    const userExists = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (userExists) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    // crear usuario en DB
    const user = this.userRepository.create({
      nombre: registerDto.name,
      apellido: registerDto.apellido,
      email: registerDto.email,
      contrasena: hashedPassword,
      telefono: registerDto.telefono,
      rol: Role.USER,
    });

    await this.userRepository.save(user);

    return new UserEntity(
      user.id,
      user.nombre,
      user.apellido,
      user.email,
      user.contrasena,
      user.telefono,
      user.rol,
      user.publications,
    );
  }

  // 🔵 OBTENER USUARIO POR ID (para perfil)
  async findById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async findOne(id: number): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  async updateRole(id: number, rol: Role): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    user.rol = rol;
    return this.userRepository.save(user);
  }
}
