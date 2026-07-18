import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { RateTransactionDto } from './dto/rate-transaction.dto';
import { Transaction } from './entities/transactions.entity';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  private cacheFind: Transaction[] = [];

  // HU4 - Crear Transacción
  @Post()
  async create(@Body() dto: CreateTransactionDto) {
    const nueva = await this.transactionsService.create(dto);
    if (!this.cacheFind.some((t) => t.id === nueva.id)) {
      this.cacheFind.push(nueva);
    }
    return nueva;
  }

  // HU6 - Obtener todas las transacciones
  @Get()
  async findAll() {
    return this.transactionsService.findAll();
  }

  // Obtener por ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    for (const trans of this.cacheFind) {
      if (trans.id === id) {
        return trans;
      }
    }
    const encontrada = await this.transactionsService.findOne(id);
    if (!this.cacheFind.some((t) => t.id === encontrada.id)) {
      this.cacheFind.push(encontrada);
    }
    return encontrada;
  }

  // Actualizar estado de la transacción (Aprobar, Completar, etc)
  @Put(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransactionDto,
  ) {
    const actualizada = await this.transactionsService.updateStatus(id, dto);
    const index = this.cacheFind.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.cacheFind[index] = actualizada;
    }
    return actualizada;
  }

  // HU4 - Cancelar / Soft delete transacción
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const cancelada = await this.transactionsService.remove(id);
    const index = this.cacheFind.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.cacheFind[index] = cancelada;
    }
    return cancelada;
  }

  // HU7 - Calificar transacción
  @Put(':id/rate')
  async rateTransaction(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RateTransactionDto,
  ) {
    const calificada = await this.transactionsService.rateTransaction(id, dto);
    const index = this.cacheFind.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.cacheFind[index] = calificada;
    }
    return calificada;
  }

  // HU7 - Consultar reputación del usuario
  @Get('reputation/:userId')
  async getReputation(@Param('userId', ParseIntPipe) userId: number) {
    return this.transactionsService.getUserReputation(userId);
  }
}
