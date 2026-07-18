import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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
    private readonly dataSource: DataSource,
  ) { }

  // HU4 - Crear Transacción (Solicitar insumos)
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

  // HU6 - Obtener todas las transacciones
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

  // Obtener transacción por ID
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

  // HU5, HU6 - Aprobar, rechazar, completar o cancelar transacción
  async updateStatus(id: number, dto: UpdateTransactionDto) {
    const transaccion = await this.findOne(id);

    // Validación de seguridad (HU6)
    let isIniciador = false;
    if (dto.actionUserId) {
      isIniciador = transaccion.detalles[0]?.usuarioEmisor?.id === dto.actionUserId;
      if (dto.estado === TransactionState.CANCELLED && !isIniciador) {
        throw new UnauthorizedException('Solo el iniciador puede cancelar la solicitud');
      }
      if ((dto.estado === TransactionState.COMPLETED || dto.estado === TransactionState.REJECTED) && isIniciador) {
        // En el flujo de dos pasos, el iniciador SÍ puede enviar COMPLETED (para confirmar su parte).
        // Pero no puede rechazarla.
        if (dto.estado === TransactionState.REJECTED) {
          throw new UnauthorizedException('Solo el usuario receptor puede rechazar la solicitud');
        }
      }
    }

    if (transaccion.estado === TransactionState.CANCELLED || transaccion.estado === TransactionState.REJECTED) {
      throw new BadRequestException('No se puede modificar una transacción cancelada o rechazada');
    }
    if (transaccion.estado === TransactionState.COMPLETED) {
      throw new BadRequestException('No se puede modificar una transacción ya completada');
    }

    // Lógica de confirmación mutua (HU6) y concurrencia (HU5)
    if (dto.estado === TransactionState.COMPLETED) {
      if (!dto.actionUserId) {
        throw new BadRequestException('Se requiere actionUserId para confirmar el trueque');
      }

      if (isIniciador) {
        transaccion.iniciadorConfirmo = true;
      } else {
        transaccion.receptorConfirmo = true;
      }

      // Si ambos confirmaron, se descuenta el stock y se completa la transacción
      if (transaccion.iniciadorConfirmo && transaccion.receptorConfirmo) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          for (const det of transaccion.detalles) {
            // Bloqueo pesimista para evitar stock negativo (HU5)
            const pub = await queryRunner.manager.findOne(Publication, {
              where: { id: det.publicacion.id },
              lock: { mode: 'pessimistic_write' },
            });

            if (pub && pub.cantidad >= det.cantidad) {
              pub.cantidad -= det.cantidad;
              if (pub.cantidad === 0) {
                pub.isActive = false;
              }
              await queryRunner.manager.save(pub);
            } else {
              throw new BadRequestException(`No hay stock suficiente para la publicación ${det.publicacion.id}`);
            }
          }

          transaccion.estado = TransactionState.COMPLETED;
          const savedTransaction = await queryRunner.manager.save(transaccion);
          
          await queryRunner.commitTransaction();
          return savedTransaction;
        } catch (error) {
          await queryRunner.rollbackTransaction();
          throw error;
        } finally {
          await queryRunner.release();
        }
      } else {
        // Aún falta uno por confirmar, solo guardamos las banderas, el estado sigue pendiente
        return await this.transactionRepository.save(transaccion);
      }
    }

    // Para CANCELLED y REJECTED
    transaccion.estado = dto.estado;
    return await this.transactionRepository.save(transaccion);
  }

  // Soft Delete (HU4 - Cancelar transacciones)
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

  // HU7 - Calificar transacción (dual)
  async rateTransaction(id: number, dto: RateTransactionDto) {
    const transaccion = await this.findOne(id);

    if (transaccion.estado !== TransactionState.COMPLETED) {
      throw new BadRequestException('Solo se pueden calificar transacciones completadas');
    }

    if (!dto.actionUserId) {
      throw new BadRequestException('Se requiere actionUserId para calificar');
    }

    const isIniciador = transaccion.detalles[0]?.usuarioEmisor?.id === dto.actionUserId;

    if (isIniciador) {
      if (transaccion.calificacionAlReceptor != null) {
        throw new BadRequestException('Ya calificaste al receptor');
      }
      transaccion.calificacionAlReceptor = dto.calificacion;
    } else {
      if (transaccion.calificacionAlIniciador != null) {
        throw new BadRequestException('Ya calificaste al iniciador');
      }
      transaccion.calificacionAlIniciador = dto.calificacion;
    }

    return await this.transactionRepository.save(transaccion);
  }

  // HU7 - Calcular reputación de usuario (individualizada)
  async getUserReputation(userId: number) {
    const transacciones = await this.transactionRepository.createQueryBuilder('t')
      .leftJoinAndSelect('t.detalles', 'd')
      .leftJoinAndSelect('d.usuarioEmisor', 'ue')
      .leftJoinAndSelect('d.usuarioReceptor', 'ur')
      .where('(ue.id = :userId OR ur.id = :userId)', { userId })
      .andWhere('t.estado = :estado', { estado: TransactionState.COMPLETED })
      .getMany();
      
    console.log("Transacciones obtenidas:", JSON.stringify(transacciones, null, 2));

    let suma = 0;
    let cantidad = 0;

    for (const t of transacciones) {
      if (!t.detalles || t.detalles.length === 0) continue;
      
      // El iniciador es el emisor del PRIMER detalle (cuando se crea la transacción)
      const isIniciador = t.detalles[0]?.usuarioEmisor?.id === userId;
      if (isIniciador && t.calificacionAlIniciador != null) {
        suma += t.calificacionAlIniciador;
        cantidad++;
      }
      if (!isIniciador && t.calificacionAlReceptor != null) {
        suma += t.calificacionAlReceptor;
        cantidad++;
      }
    }

    if (cantidad === 0) {
      return { average: 0, total: 0 };
    }

    const average = suma / cantidad;
    return {
      average: parseFloat(average.toFixed(1)),
      total: cantidad
    };
  }
}
