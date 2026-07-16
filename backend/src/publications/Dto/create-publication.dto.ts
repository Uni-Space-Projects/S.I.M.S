import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreatePublicationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  lote: string;

  @IsNotEmpty()
  @IsDateString()
  expirationDate: string;


  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  //Si se coloca un signo de pregunta a una variable dice que el atributo es opcional
  additionalInfo?: string;

  @IsNotEmpty()
  @IsString()
  type: string; //TODO: Hacer enumerate de esto (etiquetas para el motor de busqueda).

  @IsNotEmpty()
  @IsNumber()
  cantidad: number;

  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
