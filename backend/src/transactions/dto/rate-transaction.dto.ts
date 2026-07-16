import { IsInt, Max, Min } from 'class-validator';

export class RateTransactionDto {
  @IsInt()
  @Min(1)
  @Max(10)
  calificacion: number;
}
