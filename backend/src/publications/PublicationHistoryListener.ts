import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { DeletedPublication } from './DeletedPublication.entity';
import { Publication } from './publications.entity';
import { PublicationDeletedEvent, PublicationRestoredEvent } from './publications.events';

@Injectable()
export class PublicationListenersService {
    constructor(
        private publicationDeletedRepository: Repository<DeletedPublication>,
        private publicationRepository: Repository<Publication>
    ) {}

    // Este método se ejecutará automáticamente cuando se emita 'publication.deleted'
    @OnEvent('publication.deleted')
    handlePublicationDeletedEvent(event: PublicationDeletedEvent) {
        console.log(`Moviendo la publicación ${event.publicationId} al historial de eliminados...`);
        // Ejecucion automatica:
        this.publicationDeletedRepository.save(event.publicationData);
        this.publicationRepository.delete(event.publicationId);
    }

    @OnEvent('publication.restored')
    handlePublicationRestoredEvent(event: PublicationRestoredEvent) {
        console.log(`Limpiando la publicación ${event.publicationId} del historial de eliminados...`);

        // Aquí la lógica inversa:
        this.publicationRepository.save(event.publicationData);
        this.publicationDeletedRepository.delete(event.publicationId);
    }
}