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

  // HU4 - Crear Transacción
  @Post()
  async create(@Body() dto: CreateTransactionDto) {
    return await this.transactionsService.create(dto);
  }

  // HU6 - Obtener todas las transacciones
  @Get()
  async findAll() {
    return this.transactionsService.findAll();
  }

  // Obtener por ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.transactionsService.findOne(id);
  }

  // Actualizar estado de la transacción (Aprobar, Completar, etc)
  @Put(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransactionDto,
  ) {
    return await this.transactionsService.updateStatus(id, dto);
  }

  // HU4 - Cancelar / Soft delete transacción
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.transactionsService.remove(id);
  }

  // HU7 - Calificar transacción
  @Put(':id/rate')
  async rateTransaction(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RateTransactionDto,
  ) {
    return await this.transactionsService.rateTransaction(id, dto);
  }

  // HU7 - Consultar reputación del usuario
  @Get('reputation/:userId')
  async getReputation(@Param('userId', ParseIntPipe) userId: number) {
    return this.transactionsService.getUserReputation(userId);
  }
}
