import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

//Le decimos al programa que todas las rutas empiezan con users para mandarselas a las distintas clases
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    //Lo que le entrega la pagina al servicio (cuando alguien haga post en login)
    @Post('login')
    //Body agarra el json que envio el usuario al mandarle el formulario del login y lo guarda en una variable body
    login(@Body() body: any) {
        //Llama al metodo login en usersService
        return this.usersService.login(body);
    }
}