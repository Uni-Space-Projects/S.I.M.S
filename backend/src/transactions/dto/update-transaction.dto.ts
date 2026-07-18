import { IsEnum, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { TransactionState } from '../entities/transactions.entity';

export class UpdateTransactionDto {
  @IsNotEmpty()
  @IsEnum(TransactionState)
  estado: TransactionState;

  @IsOptional()
  @IsNumber()
  actionUserId?: number;
}
