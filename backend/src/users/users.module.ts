import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './users.entity';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

//Toda la informacion pasa por aqui y dicta que hace cada quien
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]), // 👈 REPOSITORIO REGISTRADO
  ],
  //dice quien es el que va a dar los datos
  controllers: [UsersController, ProfileController],
  //dice quien va a recibir los datos
  providers: [UsersService, ProfileService],
  exports: [UsersService],
})
export class UsersModule {}
