import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, ValidateNested, Min } from 'class-validator';

export class TransactionDetailDto {
  @IsNotEmpty()
  @IsInt()
  usuarioEmisorId: number;

  @IsNotEmpty()
  @IsInt()
  usuarioReceptorId: number;

  @IsNotEmpty()
  @IsInt()
  publicacionId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  cantidad: number;
}

export class CreateTransactionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionDetailDto)
  detalles: TransactionDetailDto[];
}
