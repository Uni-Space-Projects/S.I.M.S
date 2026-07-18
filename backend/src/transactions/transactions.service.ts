import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionState } from './entities/transactions.entity';
import { TransactionDetail } from './entities/transaction-details.entity';
import { Publication } from '../publications/publications.entity';
import { UserEntity } from '../users/users.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { RateTransactionDto } from './dto/rate-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionDetail)
    private readonly detailRepository: Repository<TransactionDetail>,
    @InjectRepository(Publication)
    private readonly publicationRepository: Repository<Publication>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  // 🔵 HU4 - Crear Transacción (Solicitar insumos)
  async create(dto: CreateTransactionDto) {
    if (!dto.detalles || dto.detalles.length === 0) {
      throw new BadRequestException(
        'La transacción debe tener al menos un detalle',
      );
    }

    const detallesEntities: TransactionDetail[] = [];

    for (const det of dto.detalles) {
      if (det.usuarioEmisorId === det.usuarioReceptorId) {
        throw new BadRequestException(
          'Un usuario no puede solicitar sus propias publicaciones',
        );
      }

      const publicacion = await this.publicationRepository.findOne({
        where: { id: det.publicacionId, isActive: true },
        relations: ['user'],
      });

      if (!publicacion) {
        throw new NotFoundException(
          `La publicación con ID ${det.publicacionId} no existe o no está activa`,
        );
      }

      if (publicacion.user.id !== det.usuarioEmisorId) {
        throw new BadRequestException(
          `La publicación ${det.publicacionId} no pertenece al usuario emisor ${det.usuarioEmisorId}`,
        );
      }

      if (publicacion.expirationDate <= new Date()) {
        throw new BadRequestException(
          `La publicación ${det.publicacionId} está vencida y no puede ser transada`,
        );
      }

      if (publicacion.cantidad < det.cantidad) {
        throw new BadRequestException(
          `La publicación ${det.publicacionId} no tiene stock suficiente. Disponible: ${publicacion.cantidad}`,
        );
      }

      const emisor = await this.userRepository.findOne({
        where: { id: det.usuarioEmisorId },
      });
      const receptor = await this.userRepository.findOne({
        where: { id: det.usuarioReceptorId },
      });

      if (!emisor || !receptor) {
        throw new NotFoundException(
          'Uno o más usuarios de la transacción no existen',
        );
      }

      const detalle = this.detailRepository.create({
        usuarioEmisor: emisor,
        usuarioReceptor: receptor,
        publicacion: publicacion,
        cantidad: det.cantidad,
      });

      detallesEntities.push(detalle);
    }

    const transaction = this.transactionRepository.create({
      estado: TransactionState.PENDING,
      detalles: detallesEntities,
    });

    return await this.transactionRepository.save(transaction);
  }

  // 🔵 HU6 - Obtener todas las transacciones
  async findAll() {
    const transacciones = await this.transactionRepository.find({
      relations: [
        'detalles',
        'detalles.usuarioEmisor',
        'detalles.usuarioReceptor',
        'detalles.publicacion',
      ],
    });

    transacciones.forEach(t => {
      if (t.detalles) {
        t.detalles.sort((a, b) => a.id - b.id);
      }
    });

    return transacciones;
  }

  // 🔵 Obtener transacción por ID
  async findOne(id: number) {
    const transaccion = await this.transactionRepository.findOne({
      where: { id },
      relations: [
        'detalles',
        'detalles.usuarioEmisor',
        'detalles.usuarioReceptor',
        'detalles.publicacion',
      ],
    });

    if (!transaccion) {
      throw new NotFoundException(`Transacción con ID ${id} no encontrada`);
    }

    if (transaccion.detalles) {
      transaccion.detalles.sort((a, b) => a.id - b.id);
    }

    return transaccion;
  }

  // 🔵 HU5, HU6 - Aprobar, rechazar, completar o cancelar transacción
  async updateStatus(id: number, dto: UpdateTransactionDto) {
    const transaccion = await this.findOne(id);

    // Validación de seguridad (HU6)
    if (dto.actionUserId) {
      const isIniciador = transaccion.detalles[0]?.usuarioEmisor?.id === dto.actionUserId;
      if (dto.estado === TransactionState.CANCELLED && !isIniciador) {
        throw new UnauthorizedException('Solo el iniciador puede cancelar la solicitud');
      }
      if ((dto.estado === TransactionState.COMPLETED || dto.estado === TransactionState.REJECTED) && isIniciador) {
        throw new UnauthorizedException('Solo el usuario receptor puede aprobar o rechazar la solicitud');
      }
    }

    // Validar transición de estados
    if (
      transaccion.estado === TransactionState.CANCELLED ||
      transaccion.estado === TransactionState.REJECTED
    ) {
      throw new BadRequestException(
        'No se puede modificar una transacción cancelada o rechazada',
      );
    }

    if (transaccion.estado === TransactionState.COMPLETED) {
      throw new BadRequestException(
        'No se puede modificar una transacción ya completada',
      );
    }

    // HU5 - Al completar (o aprobar definitivamente), restar stock
    // Nota: El ERS dice "asegurar disponibilidad al aprobar". Y "Al pasar a finalizada mantener trazabilidad".
    // Restamos el stock aquí cuando se completa o se aprueba. Asumiremos que se resta al completarse.
    if (dto.estado === TransactionState.COMPLETED) {
      for (const det of transaccion.detalles) {
        const pub = await this.publicationRepository.findOne({
          where: { id: det.publicacion.id },
        });
        if (pub && pub.cantidad >= det.cantidad) {
          pub.cantidad -= det.cantidad;
          // Si la cantidad llega a 0, se puede marcar como inactiva según la regla de negocio
          if (pub.cantidad === 0) {
            pub.isActive = false;
          }
          await this.publicationRepository.save(pub);
        } else {
          throw new BadRequestException(
            `No hay stock suficiente para completar el trueque de la publicación ${det.publicacion.id}`,
          );
        }
      }
    }

    transaccion.estado = dto.estado;
    return await this.transactionRepository.save(transaccion);
  }

  // 🔵 Soft Delete (HU4 - Cancelar transacciones)
  async remove(id: number) {
    const transaccion = await this.findOne(id);

    if (transaccion.estado === TransactionState.COMPLETED) {
      throw new BadRequestException(
        'No se puede cancelar una transacción que ya fue completada',
      );
    }

    transaccion.estado = TransactionState.CANCELLED;
    return await this.transactionRepository.save(transaccion);
  }

  // 🔵 HU7 - Calificar transacción
  async rateTransaction(id: number, dto: RateTransactionDto) {
    const transaccion = await this.findOne(id);

    if (transaccion.estado !== TransactionState.COMPLETED) {
      throw new BadRequestException(
        'Solo se pueden calificar transacciones finalizadas/completadas',
      );
    }

    if (transaccion.calificacion != null) {
      throw new BadRequestException('Esta transacción ya fue calificada');
    }

    transaccion.calificacion = dto.calificacion;
    return await this.transactionRepository.save(transaccion);
  }

  // 🔵 HU7 - Calcular reputación de usuario
  async getUserReputation(userId: number) {
    const query = this.transactionRepository.createQueryBuilder('t')
      .innerJoin('t.detalles', 'd')
      .innerJoin('d.usuarioEmisor', 'ue')
      .innerJoin('d.usuarioReceptor', 'ur')
      .where('(ue.id = :userId OR ur.id = :userId)', { userId })
      .andWhere('t.estado = :estado', { estado: TransactionState.COMPLETED })
      .andWhere('t.calificacion IS NOT NULL');

    const transacciones = await query.getMany();

    if (transacciones.length === 0) {
      return { 
        average: 0, 
        total: 0 
      };
    }

    const suma = transacciones.reduce((acc, t) => acc + t.calificacion, 0);
    const average = suma / transacciones.length;

    return {
      average: parseFloat(average.toFixed(1)),
      total: transacciones.length
    };
  }
}
