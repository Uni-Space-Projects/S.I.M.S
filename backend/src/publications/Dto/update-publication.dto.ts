import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdatePublicationDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  lote?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsString()
  additionalInfo?: string;
}
