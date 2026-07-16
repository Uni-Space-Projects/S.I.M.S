import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateReportDto {
  @IsNotEmpty()
  @IsNumber()
  usuarioReportaId: number;

  @IsNotEmpty()
  @IsNumber()
  publicacionId: number;

  @IsNotEmpty()
  @IsString()
  motivo: string;
}
