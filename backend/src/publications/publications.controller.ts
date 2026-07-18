import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UnauthorizedException,
} from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { UsersService } from '../users/users.service';
import { Role } from '../users/roles.enum';
import { CreatePublicationDto } from './Dto/create-publication.dto';
import { UpdatePublicationDto } from './Dto/update-publication.dto';
import { Publication } from './publications.entity';

@Controller('publications')
export class PublicationsController {
  constructor(
    private readonly publicationsService: PublicationsService,
    private readonly usersService: UsersService,
  ) {}

  // CREAR PUBLICACIÓN
  @Post()
  async create(@Body() dto: CreatePublicationDto) {
    return await this.publicationsService.create(dto);
  }

  // OBTENER TODAS
  @Get()
  findAll() {
    return this.publicationsService.findAll();
  }

  // OBTENER POR USUARIO
  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    try {
      return await this.publicationsService.findByUser(+userId);
    } catch (error) {
      return []; // Return empty array if not found to avoid 404s breaking clients
    }
  }

  // OBTENER POR ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.publicationsService.findOne(+id);
  }

  // ACTUALIZAR
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePublicationDto,
  ): Promise<Publication> {
    return await this.publicationsService.update(+id, dto);
  }

  // ELIMINAR (Deactivate logic for admins or owner)
  @Delete(':id')
  async remove(@Param('id') id: string, @Body('adminId') adminId?: number): Promise<void> {
    if (adminId) {
      const admin = await this.usersService.findById(adminId);
      if (admin.rol !== Role.ADMIN) {
        throw new UnauthorizedException('No tienes permisos de administrador');
      }
    }
    // Si no es admin, asumimos que es el dueño borrando su propia publicación. 
    // Lo ideal sería validar que el userId coincida con el publicacion.user.id
    await this.publicationsService.remove(+id);
  }

  @Post(':id/restore')
  async restore(@Param('id') id: string, @Body('adminId') adminId?: number) {
    if (adminId) {
      const admin = await this.usersService.findById(adminId);
      if (admin.rol !== Role.ADMIN) {
        throw new UnauthorizedException('Solo los administradores pueden restaurar');
      }
    }

    return await this.publicationsService.reload(+id);
  }
}
