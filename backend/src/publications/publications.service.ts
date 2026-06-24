import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Publication } from './publications.entity';
import { CreatePublicationDto } from './Dto/create-publication.dto';
import { UpdatePublicationDto } from './Dto/update-publication.dto';
import { DeletedPublication } from './DeletedPublication.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PublicationDeletedEvent } from './publications.events';
import { PublicationRestoredEvent } from './publications.events';


@Injectable()
export class PublicationsService {
  constructor(
    @InjectRepository(Publication)
    private readonly publicationRepository: Repository<Publication>,
    @InjectRepository(DeletedPublication)
    private readonly publicationDeletedRepository: Repository<DeletedPublication>,
    private eventEmitter: EventEmitter2,
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
    const publicaciones = await this.publicationRepository.find({
      where: {
        isActive: true,
      },
      relations: ['user'],
    });

    if (publicaciones.length === 0) {
      throw new NotFoundException('No hay publicaciones creadas');
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
      //La base de datos tiene que cargar las tablas que estan relacionadas a las peticiones.
      relations: ['user'],
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
      //La base de datos tiene que cargar las tablas que estan relacionadas a las peticiones.
      relations: ['user'],
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

    this.eventEmitter.emit(
      'publication.deleted',
      new PublicationDeletedEvent(id, publication),
    );
  }

  async reload(id: number) {
    const deletedPub = await this.publicationDeletedRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!deletedPub) {
      throw new NotFoundException('Publicación eliminada no encontrada');
    }

    const publication = this.publicationRepository.create({
      id: deletedPub.id,
      name: deletedPub.name,
      lote: deletedPub.lote,
      expirationDate: deletedPub.expirationDate,
      description: deletedPub.description,
      type: deletedPub.type,
      isActive: true,
      user: deletedPub.user,
    });

    this.eventEmitter.emit(
      'publication.restored',
      new PublicationRestoredEvent(id, publication),
    );

    return publication;
  }
}
