import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicationsModule } from './publications/publications.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TransactionsModule } from './transactions/transactions.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  //Informacion necesaria para conectar una base de datos local con postgresql
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      //nest crea las tabla automaticamente
      synchronize: true, // ⚠️ solo desarrollo
    }),
    UsersModule,
    PublicationsModule,
    TransactionsModule,
    ReportsModule,
    EventEmitterModule.forRoot(),
  ],
})
export class AppModule {}
