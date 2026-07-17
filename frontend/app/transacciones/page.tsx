import { Metadata } from 'next';
import TransaccionesClient from './TransaccionesClient';

export const metadata: Metadata = {
  title: 'Mis Transacciones | SIMS',
  description: 'Gestiona tus trueques e intercambios de insumos médicos.',
};

export default function TransaccionesPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <TransaccionesClient />
    </div>
  );
}
