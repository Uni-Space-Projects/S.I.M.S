import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { UserEntity } from './users.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Actualiza el perfil del usuario autenticado.
   *
   * SEGURIDAD:
   * - Solo se actualizan los campos permitidos (nombre, apellido, email, telefono).
   * - Los campos 'rol' y 'contrasena' NUNCA son tocados, previniendo escalación de privilegios.
   * - Se verifica colisión de email contra otros usuarios (id != userId).
   * - La contraseña (contrasena) es eliminada del objeto retornado (Regla RP-03 del ERS).
   */
  async updateProfile(
    userId: number,
    dto: UpdateProfileDto,
  ): Promise<Partial<UserEntity>> {
    // 1. Verificar que el usuario existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 2. Verificar colisión de email con OTRO usuario diferente
    if (dto.email !== user.email) {
      const emailTaken = await this.userRepository.findOne({
        where: { email: dto.email, id: Not(userId) },
      });

      if (emailTaken) {
        throw new ConflictException(
          'El correo electrónico ya está registrado por otro usuario',
        );
      }
    }

    // 3. Actualizar SOLO los campos permitidos manualmente
    // (previene mass assignment aunque el DTO ya lo filtra)
    user.nombre = dto.nombre;
    user.apellido = dto.apellido;
    user.email = dto.email;
    if (dto.telefono !== undefined) {
      user.telefono = dto.telefono;
    }

    // 4. Persistir en base de datos
    await this.userRepository.save(user);

    // 5. Retornar perfil SIN exponer la contraseña (Regla RP-03)
    const { contrasena, ...safeUser } = user;
    return safeUser;
  }
}
