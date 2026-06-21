export class PublicationDeletedEvent {
    constructor(public readonly publicationId: number, public readonly publicationData: any) {}
}

export class PublicationRestoredEvent {
    constructor(public readonly publicationId: number, public readonly publicationData: any) {}
}