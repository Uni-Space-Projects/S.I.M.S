import { Controller, Put, Body } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from './current-user.decorator';

/**
 * ProfileController - Controlador dedicado a la gestión del perfil propio.
 *
 * SEGURIDAD (Prevención de IDOR):
 * El endpoint PUT /users/profile NO recibe un :id por URL.
 * En su lugar, el decorador @CurrentUser() extrae el ID del usuario
 * directamente del header de autenticación simulado (x-user-id).
 * Esto garantiza que un usuario solo pueda modificar SU PROPIO perfil.
 */
@Controller('users/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Put()
  async updateProfile(
    @CurrentUser() userId: number,
    @Body() dto: UpdateProfileDto,
  ) {
    return await this.profileService.updateProfile(userId, dto);
  }
}
