import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginDto } from './dto/Login.Dto';
import { RegisterDto } from './dto/Register.Dto';
import { UserEntity } from './users.entity';

//Le decimos al programa que todas las rutas empiezan con users para mandarselas a las distintas clases
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  private cacheUsuarios:UserEntity[] = [];
  //Lo que le entrega la pagina al servicio (cuando alguien haga post en login)
  @Post('login')
  //Body agarra el json que envio el usuario al mandarle el formulario del login y lo guarda en una variable body
  async login(@Body() body: LoginDto) {
    //Llama al metodo login en usersService
    for (const usuarios of this.cacheUsuarios) {
      if (usuarios.email === body.email && usuarios.contrasena === body.password) {
        return {
          user: usuarios.id,
          email: usuarios.email,

        };
      }
    }
      const nuevo = await this.usersService.login(body);
      this.cacheUsuarios.push(nuevo);
      return nuevo;
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const u_creado = await this.usersService.register(body);
    this.cacheUsuarios.push(u_creado);
    return {
      user: u_creado.id,
      email: u_creado.email,
    };
  }

  // 🔵 OBTENER USUARIO POR ID (para perfil)
  @Get(':id')
  async findById(@Param('id') id: string) {
    // Buscar en caché primero
    for (const usuario of this.cacheUsuarios) {
      if (usuario.id?.toString() === id) {
        // Retornar sin la contraseña
        const { contrasena, ...perfil } = usuario as any;
        return perfil;
      }
    }

    const user = await this.usersService.findById(+id);
    this.cacheUsuarios.push(user);

    // Retornar sin la contraseña
    const { contrasena, ...perfil } = user as any;
    return perfil;
  }

}
