import { IsInt, Max, Min, IsOptional, IsNumber } from 'class-validator';

export class RateTransactionDto {
  @IsInt()
  @Min(1)
  @Max(10)
  calificacion: number;

  @IsOptional()
  @IsNumber()
  actionUserId?: number;
}
