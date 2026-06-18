import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Publication } from './publications.entity';
import { CreatePublicationDto } from './Dto/create-publication.dto';
import { UpdatePublicationDto } from './Dto/update-publication.dto';

@Injectable()
export class PublicationsService {
  constructor(
    @InjectRepository(Publication)
    private readonly publicationRepository: Repository<Publication>,
    private readonly publicationDeletedRepository: Repository<Publication>
  ) { }

  // 🔵 CREAR PUBLICACIÓN
  async create(dto: CreatePublicationDto) {
    const expiration = new Date(dto.expirationDate);

    if (expiration <= new Date()) {
      throw new Error('La fecha de vencimiento no puede ser pasada');
    }

    const publication = this.publicationRepository.create({
      ...dto,
      expirationDate: expiration,
      isActive: true,
      user: { id: dto.userId },
    });

    return await this.publicationRepository.save(publication);
  }

  // 🔵 OBTENER TODAS (solo activas y no vencidas)
  async findAll() {
    const publicaciones =  await this.publicationRepository.find({
      where: {
        isActive: true,
      },
    });

    if (publicaciones.length === 0) {
        throw new NotFoundException("No hay publicaciones creadas");
    }

    return publicaciones;
  }

  // 🔵 OBTENER TODAS POR USUARIO
  async findByUser(userId: number) {
    const usurario = await this.publicationRepository.find({
      where: {
        isActive: true,
        user: { id: userId },
      },
    });

    if (!usurario.length) {
        throw new NotFoundException('Usuario no encontrado');
    }

    return usurario;
  }

  // 🔵 OBTENER UNA POR NOMBRE
  async findByInitialText(term: string) {
    const publications = await this.publicationRepository.find({
      where: {
        // 🔵 2. Lo aplicas aquí. Si 'term' es "hola", buscará "Hola", "HOLA", "hola", etc.
        name: ILike(`${term}%`),
      },
    });


    if (publications.length === 0) {
      throw new NotFoundException(`No se encontraron publicaciones`);
    }

    return publications;
  }

  // 🔵 OBTENER UNA POR ID
  async findOne(id: number) {
    const publication = await this.publicationRepository.findOne({
      where: { id },
    });

    if (!publication) {
      throw new NotFoundException('Publicación no encontrada');
    }

    return publication;
  }

  // 🔵 ACTUALIZAR
  async update(id: number, dto: UpdatePublicationDto) {
    const publication = await this.findOne(id);

    if (dto.expirationDate) {
      const expiration = new Date(dto.expirationDate);

      if (expiration <= new Date()) {
        throw new Error('Fecha de vencimiento inválida');
      }

      publication.expirationDate = expiration;
    }

    Object.assign(publication, dto);

    return this.publicationRepository.save(publication);
  }

  // 🔵 ELIMINAR (soft delete)
  async remove(id: number) {
    const publication = await this.findOne(id);

    publication.isActive = false;

    return this.publicationDeletedRepository.save(publication);
  }

  async reload(id: number){
    const publication = await this.findOne(id);
    if (!publication.isActive || !publication) {
      throw new NotFoundException('Publicación no encontrada');
    }

    publication.isActive = true;
  }


}
