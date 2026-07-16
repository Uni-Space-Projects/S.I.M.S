import { Module } from '@nestjs/common';
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
    TransactionsModule,
    ReportsModule,
    EventEmitterModule.forRoot(),
  ],
})
export class AppModule {}
