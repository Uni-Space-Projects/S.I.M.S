import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicationsModule } from './publications/publications.module';

@Module({

  //Informacion necesaria para conectar una base de datos local con postgresql
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'REDACTED_PASSWORD',
      database: 'trueque_medicinas',
      autoLoadEntities: true,
      //nest crea las tabla automaticamente
      synchronize: true, // ⚠️ solo desarrollo
    }),
    UsersModule,
    PublicationsModule,
  ],

})
export class AppModule {}