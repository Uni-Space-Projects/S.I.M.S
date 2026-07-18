import { IsOptional, IsString, IsDateString, IsInt, Min } from 'class-validator';

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

  @IsOptional()
  @IsInt()
  @Min(1)
  cantidad?: number;
}
