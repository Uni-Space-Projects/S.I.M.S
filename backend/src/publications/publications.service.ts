import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publication } from './publications.entity';
import { CreatePublicationDto } from './Dto/create-publication.dto';
import { UpdatePublicationDto } from './Dto/update-publication.dto';

@Injectable()
export class PublicationsService {
    constructor(
        @InjectRepository(Publication)
        private readonly publicationRepository: Repository<Publication>,
    ) {}

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

        });

        return await this.publicationRepository.save(publication);
    }

    // 🔵 OBTENER TODAS (solo activas y no vencidas)
    async findAll() {
        const today = new Date();

        return this.publicationRepository.find({
            where: {
                isActive: true,
            },
        });
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

        return this.publicationRepository.save(publication);
    }
}