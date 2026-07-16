import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportesEntity } from './reports.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UsersService } from '../users/users.service';
import { PublicationsService } from '../publications/publications.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportesEntity)
    private readonly reportRepository: Repository<ReportesEntity>,
    private readonly usersService: UsersService,
    private readonly publicationsService: PublicationsService,
  ) {}

  async create(dto: CreateReportDto): Promise<ReportesEntity> {
    const user = await this.usersService.findOne(dto.usuarioReportaId);
    if (!user) {
      throw new NotFoundException('Usuario que reporta no encontrado');
    }

    const publication = await this.publicationsService.findOne(
      dto.publicacionId,
    );
    if (!publication) {
      throw new NotFoundException('Publicación reportada no encontrada');
    }

    const report = this.reportRepository.create({
      usuarioReporta: user,
      publicacion: publication,
      motivo: dto.motivo,
      estado: 'pendiente',
    });

    return this.reportRepository.save(report);
  }

  async findAll(): Promise<ReportesEntity[]> {
    return this.reportRepository.find({
      relations: ['usuarioReporta', 'publicacion', 'publicacion.user'],
      order: {
        fechaReporte: 'DESC',
        id: 'DESC',
      },
    });
  }

  async updateStatus(
    id: number,
    estado: 'aceptado' | 'rechazado',
  ): Promise<ReportesEntity> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['publicacion'],
    });

    if (!report) {
      throw new NotFoundException('Reporte no encontrado');
    }

    report.estado = estado;
    const updatedReport = await this.reportRepository.save(report);

    // Si el reporte es aceptado, ocultar la publicación (deactivar)
    if (estado === 'aceptado' && report.publicacion) {
      try {
        await this.publicationsService.deactivate(report.publicacion.id);
      } catch (error) {
        console.error(
          'Error auto-hiding publication after report approval:',
          error,
        );
      }
    }

    return updatedReport;
  }
}
