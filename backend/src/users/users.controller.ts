import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
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
    for (const usuarios of this.cacheUsuarios) {
      if (usuarios.email === body.email) {
        const match = await bcrypt.compare(body.password, usuarios.contrasena);
        if (match) {
          const result = { ...usuarios };
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
      user: u_creado.id,
      email: u_creado.email,
      success: true,
    };
  }

  // 🔵 OBTENER USUARIO POR ID (para perfil)
  @Get(':id')
  async findById(@Param('id') id: string) {
    // Buscar en caché primero
    for (const usuario of this.cacheUsuarios) {
      if (usuario.id?.toString() === id) {
        // Retornar sin la contraseña
        const result = { ...usuario };
        delete (result as Partial<UserEntity>).contrasena;
        return result;
      }
    }

    const user = await this.usersService.findById(+id);
    this.cacheUsuarios.push(user);

    // Retornar sin la contraseña
    const result = { ...user };
    delete (result as Partial<UserEntity>).contrasena;
    return result;
  }
}
