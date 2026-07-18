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

  private cacheFind: Publication[] = [];

  // CREAR PUBLICACIÓN
  @Post()
  async create(@Body() dto: CreatePublicationDto) {
    const nuevo = await this.publicationsService.create(dto);
    if (!this.cacheFind.some((publi) => publi.id === nuevo.id)) {
      this.cacheFind.push(nuevo);
    }
    return nuevo;
  }

  // OBTENER TODAS
  @Get()
  findAll() {
    return this.publicationsService.findAll();
  }

  // OBTENER POR USUARIO TODO: Preguntar a la profesora sobre esta implementacion ya que es muy ineficiente.
  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    const almacenadas: Publication[] = [];
    for (const publi of this.cacheFind) {
      if (publi.user?.id?.toString() === userId) {
        almacenadas.push(publi);
      }
    }

    try {
      const encontrado = await this.publicationsService.findByUser(+userId);
      // Las que no están en las almacenadas en caché se agregan de la búsqueda de base de datos.
      for (const buscadas of encontrado) {
        if (!almacenadas.some((a) => a.id === buscadas.id)) {
          almacenadas.push(buscadas);
        }
      }

      // Agrega al caché las publicaciones que no se encontraron.
      for (const publicacion of almacenadas) {
        if (!this.cacheFind.some((c) => c.id === publicacion.id)) {
          this.cacheFind.push(publicacion);
        }
      }
    } catch (error) {
      // Si ocurre un error (por ejemplo, NotFoundException porque no hay publicaciones en la BD),
      // pero ya tenemos publicaciones en memoria/caché para este usuario, las retornamos en vez de lanzar un error.
      if (almacenadas.length === 0) {
        throw error;
      }
    }

    return almacenadas;
  }

  // OBTENER POR ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    for (const publi of this.cacheFind) {
      if (publi.id.toString() === id) {
        return publi;
      }
    }
    const encontrado = await this.publicationsService.findOne(+id);
    if (!this.cacheFind.some((c) => c.id === encontrado.id)) {
      this.cacheFind.push(encontrado);
    }
    return encontrado;
  }

  // ACTUALIZAR
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePublicationDto,
  ): Promise<Publication> {
    const publicacionActualizada = await this.publicationsService.update(
      +id,
      dto,
    );
    const index = this.cacheFind.findIndex(
      (publi) => publi.id.toString() === id,
    );
    // Si el índice es diferente de -1, significa que SÍ estaba en el caché
    if (index !== -1) {
      // Reemplazar el objeto en su misma posición original
      this.cacheFind[index] = publicacionActualizada;
    }
    return publicacionActualizada;
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
    const index = this.cacheFind.findIndex(
      (publi) => publi.id.toString() === id,
    );
    if (index !== -1) {
      this.cacheFind.splice(index, 1);
    }
  }

  @Post(':id/restore')
  async restore(@Param('id') id: string, @Body('adminId') adminId: number) {
    if (!adminId) {
      throw new UnauthorizedException('Se requiere ID de administrador');
    }
    const admin = await this.usersService.findById(adminId);
    if (admin.rol !== Role.ADMIN) {
      throw new UnauthorizedException('Solo los administradores pueden restaurar');
    }

    const restaurada = await this.publicationsService.reload(+id);
    if (!this.cacheFind.some((c) => c.id === restaurada.id)) {
      this.cacheFind.push(restaurada);
    }
    return restaurada;
  }
}
