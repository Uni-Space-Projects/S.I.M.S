import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicationsService } from './publications.service';
import { PublicationsController } from './publications.controller';
import { Publication } from './publications.entity';
import { UserEntity } from '../users/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Publication]),
  ],
  controllers: [PublicationsController, PeneController],
  providers: [PublicationsService],
})
export class PublicationsModule {}