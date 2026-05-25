import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginDto } from './dto/Login.Dto';
import { RegisterDto } from './dto/Register.Dto';

//Le decimos al programa que todas las rutas empiezan con users para mandarselas a las distintas clases
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  //Lo que le entrega la pagina al servicio (cuando alguien haga post en login)
  @Post('login')
  //Body agarra el json que envio el usuario al mandarle el formulario del login y lo guarda en una variable body
  login(@Body() body: LoginDto) {
    //Llama al metodo login en usersService
    return this.usersService.login(body);
  }

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.usersService.register(body);
  }
}
