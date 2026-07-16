import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesEntity } from './reports.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { UsersModule } from '../users/users.module';
import { PublicationsModule } from '../publications/publications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportesEntity]),
    UsersModule,
    PublicationsModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
