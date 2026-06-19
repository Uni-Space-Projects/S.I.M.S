import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { CreatePublicationDto } from './Dto/create-publication.dto';
import { UpdatePublicationDto } from './Dto/update-publication.dto';

@Controller('publications')
export class PublicationsController {
  constructor(private readonly publicationsService: PublicationsService) {}

  // 🔵 CREAR PUBLICACIÓN
  @Post()
  create(@Body() dto: CreatePublicationDto) {
    return this.publicationsService.create(dto);
  }

  // 🔵 OBTENER TODAS
  @Get()
  findAll() {
    return this.publicationsService.findAll();
  }

  // 🔵 OBTENER POR USUARIO
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.publicationsService.findByUser(+userId);
  }

  // 🔵 OBTENER POR ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.publicationsService.findOne(+id);
  }

  // 🔵 ACTUALIZAR
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePublicationDto) {
    return this.publicationsService.update(+id, dto);
  }

  // 🔵 ELIMINAR
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.publicationsService.remove(+id);
  }

  // 🔵 RESTAURAR
  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.publicationsService.reload(+id);
  }
}
