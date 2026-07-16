import { IsEnum, IsNotEmpty } from 'class-validator';
import { TransactionState } from '../entities/transactions.entity';

export class UpdateTransactionDto {
  @IsNotEmpty()
  @IsEnum(TransactionState)
  estado: TransactionState;
}
