import { Publication } from './publications.entity';

export class PublicationDeletedEvent {
  constructor(
    public readonly publicationId: number,
    public readonly publicationData: Publication,
  ) {}
}

export class PublicationRestoredEvent {
  constructor(
    public readonly publicationId: number,
    public readonly publicationData: Publication,
  ) {}
}
