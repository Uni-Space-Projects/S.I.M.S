import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicationsService } from './publications.service';
import { PublicationsController } from './publications.controller';
import { Publication } from './publications.entity';
import { DeletedPublication } from './DeletedPublication.entity';
import { PublicationListenersService } from './PublicationHistoryListener';

@Module({
  imports: [TypeOrmModule.forFeature([Publication, DeletedPublication])],
  controllers: [PublicationsController],
  providers: [PublicationsService, PublicationListenersService],
  exports: [PublicationsService],
})
export class PublicationsModule {}
