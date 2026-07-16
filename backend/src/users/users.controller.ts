import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginDto } from './dto/Login.Dto';
import { RegisterDto } from './dto/Register.Dto';
import { UserEntity } from './users.entity';
import * as bcrypt from 'bcrypt';
import { Role } from './roles.enum';

//Le decimos al programa que todas las rutas empiezan con users para mandarselas a las distintas clases
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  private cacheUsuarios: UserEntity[] = [];

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((user) => {
      const result = { ...user };
      delete (result as Partial<UserEntity>).contrasena;
      return result;
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(Number(id));
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const result = { ...user };
    delete (result as Partial<UserEntity>).contrasena;
    return result;
  }

  @Patch(':id/role')
  async updateRole(@Param('id') id: string, @Body('rol') rol: Role) {
    const user = await this.usersService.updateRole(Number(id), rol);
    const result = { ...user };
    delete (result as Partial<UserEntity>).contrasena;
    return result;
  }

  //Lo que le entrega la pagina al servicio (cuando alguien haga post en login)
  @Post('login')
  //Body agarra el json que envio el usuario al mandarle el formulario del login y lo guarda en una variable body
  async login(@Body() body: LoginDto) {
    //Llama al metodo login en usersService
    for (const usuario of this.cacheUsuarios) {
      if (usuario.email === body.email) {
        const passwordMatch = await bcrypt.compare(
          body.password,
          usuario.contrasena,
        );
        if (passwordMatch) {
          const result = { ...usuario };
          delete (result as Partial<UserEntity>).contrasena;
          return result;
        }
      }
    }
    const nuevo = await this.usersService.login(body);
    this.cacheUsuarios.push(nuevo);
    const result = { ...nuevo };
    delete (result as Partial<UserEntity>).contrasena;
    return result;
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const u_creado = await this.usersService.register(body);
    this.cacheUsuarios.push(u_creado);
    return {
      success: true,
      user: u_creado.id,
      email: u_creado.email,
    };
  }
}
