import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * UpdateProfileDto - DTO para la edición del perfil del usuario.
 *
 * SEGURIDAD (Prevención de Mass Assignment / Escalación de Privilegios):
 * Este DTO define ÚNICAMENTE los campos que el usuario tiene permitido modificar.
 * Los campos sensibles como 'rol', 'contrasena' o 'status' NO están definidos aquí,
 * por lo que incluso si un atacante los envía en el body, serán ignorados
 * por el ValidationPipe global de NestJS.
 *
 * Regla de negocio RP-04: El usuario NO puede cambiar su propio rol ni estado
 * desde este endpoint.
 */
export class UpdateProfileDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido: string;

  @IsEmail({}, { message: 'El formato del correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsOptional()
  telefono?: string;
}
