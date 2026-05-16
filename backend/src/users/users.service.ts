import { Injectable } from '@nestjs/common';

//Injectable significa que puedes usar esta clase en otras clases
@Injectable()
export class UsersService {
    login(data: any) {
        const { email, password } = data;

        // Simulación de usuario (fake DB por ahora)
        if (email === 'test@test.com' && password === '1234') {
            return {
                success: true,
                message: 'Login correcto',
                user: {
                    email
                }
            };
        }

        return {
            success: false,
            message: 'Credenciales incorrectas'
        };
    }
}