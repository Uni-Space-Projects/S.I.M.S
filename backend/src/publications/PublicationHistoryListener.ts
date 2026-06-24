import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeletedPublication } from './DeletedPublication.entity';
import { Publication } from './publications.entity';
import {
  PublicationDeletedEvent,
  PublicationRestoredEvent,
} from './publications.events';


@Injectable()
export class PublicationListenersService {
    constructor(
        @InjectRepository(DeletedPublication)
        private publicationDeletedRepository: Repository<DeletedPublication>,
        @InjectRepository(Publication)
        private publicationRepository: Repository<Publication>
    ) {}

    // Este método se ejecutará automáticamente cuando se emita 'publication.deleted'
    @OnEvent('publication.deleted')
    async handlePublicationDeletedEvent(event: PublicationDeletedEvent) {
        console.log(`Moviendo la publicación ${event.publicationId} al historial de eliminados...`);
        
        // Calculamos la fecha de expiración (7 días a partir de hoy)
        const expiresIn = new Date();
        expiresIn.setDate(expiresIn.getDate() + 7);

        // Instanciamos el DeletedPublication con todos los datos necesarios
        const deletedPublication = this.publicationDeletedRepository.create({
            id: event.publicationData.id,
            name: event.publicationData.name,
            lote: event.publicationData.lote,
            expirationDate: event.publicationData.expirationDate,
            description: event.publicationData.description,
            type: event.publicationData.type,
            isActive: event.publicationData.isActive,
            user: event.publicationData.user,
            expiresIn: expiresIn,
        });

        // Ejecucion automatica (esperando a que termine):
        try {
            await this.publicationDeletedRepository.save(deletedPublication);
            await this.publicationRepository.delete(event.publicationId);
        } catch (error) {
            console.error('Error al archivar la publicación eliminada:', error);
            throw error;
        }
    }

    @OnEvent('publication.restored')
    async handlePublicationRestoredEvent(event: PublicationRestoredEvent) {
        console.log(`Limpiando la publicación ${event.publicationId} del historial de eliminados...`);

        // Aquí la lógica inversa (esperando a que termine):
        try {
            await this.publicationRepository.save(event.publicationData);
            await this.publicationDeletedRepository.delete(event.publicationId);
        } catch (error) {
            console.error('Error al restaurar la publicación:', error);
            throw error;
        }
    }
}