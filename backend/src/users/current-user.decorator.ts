import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

/**
 * @CurrentUser() - Decorador personalizado para extraer el ID del usuario autenticado.
 *
 * SEGURIDAD: Se extrae el userId directamente del header 'x-user-id' de la Request,
 * NO de un parámetro ':id' en la URL. Esto previene ataques IDOR (Insecure Direct
 * Object Reference) donde un usuario "A" podría modificar el perfil de "B"
 * simplemente alterando el ID en la URL.
 *
 * NOTA: Este header es una simulación temporal mientras se implementa JWT.
 * Cuando JWT esté listo, este decorador se actualizará para leer del token
 * decodificado (ej. request.user.id) sin cambiar la firma del controlador.
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    const userIdHeader = request.headers['x-user-id'];

    if (!userIdHeader) {
      throw new UnauthorizedException(
        'No se ha proporcionado un identificador de usuario válido (x-user-id).',
      );
    }

    const userId = parseInt(userIdHeader as string, 10);

    if (isNaN(userId)) {
      throw new UnauthorizedException('Identificador de usuario inválido.');
    }

    return userId;
  },
);
