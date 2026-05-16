import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

//Toda la informacion pasa por aqui y dicta que hace cada quien
@Module({
  //dice quien es el que va a dar los datos
  controllers: [UsersController],
  //dice quien va a recibir los datos
  providers: [UsersService]
})
export class UsersModule {}
