import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { AuditLog, AuditAction } from '../entities/auditLog.entity';
import { Between, FindOptionsWhere } from 'typeorm';
import { UUID } from '../types';

/**
 * AUDIT LOG SERVICE
 */
export class AuditLogService {
  private auditLogRepository: Repository<AuditLog>;

  constructor() {
    this.auditLogRepository = AppDataSource.getRepository(AuditLog);
  }

  /**
   * CREATE AUDIT LOG
   */
  async createAuditLog(
    action: AuditAction,
    entityType: string,
    entityId: UUID,
    oldValues: any,
    newValues: any,
    userId?: UUID
  ): Promise<AuditLog> {
    const auditLog = new AuditLog();
    auditLog.action = action;
    auditLog.entityType = entityType;
    auditLog.entityId = entityId;
    auditLog.oldValues = oldValues;
    auditLog.newValues = newValues;
    auditLog.userId = userId;

    return this.auditLogRepository.save(auditLog);
  }

  /**
   * LOG UPDATE
   */
  async logUpdate(
    entityType: string,
    entityId: UUID,
    oldValues: any,
    newValues: any,
    userId?: UUID
  ): Promise<AuditLog> {
    return this.createAuditLog(
      AuditAction.UPDATE,
      entityType,
      entityId,
      oldValues,
      newValues,
      userId
    );
  }

  /**
   * LOG DELETE
   */
  async logDelete(
    entityType: string,
    entityId: UUID,
    oldValues: any,
    userId?: UUID
  ): Promise<AuditLog> {
    return this.createAuditLog(
      AuditAction.DELETE,
      entityType,
      entityId,
      oldValues,
      {},
      userId
    );
  }

  /**
   * FIND AUDIT LOGS
   */
  async fetchAuditLogs(
    page: number = 1,
    limit: number = 10,
    entityType?: string,
    entityId?: UUID,
    userId?: UUID,
    startDate?: Date,
    endDate?: Date
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const condition: FindOptionsWhere<AuditLog> = {};

    if (entityType) {
      condition.entityType = entityType;
    }

    if (entityId) {
      condition.entityId = entityId;
    }

    if (userId) {
      condition.userId = userId;
    }

    if (startDate && endDate) {
      condition.createdAt = Between(startDate, endDate);
    }

    const [logs, total] = await this.auditLogRepository.findAndCount({
      where: condition,
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return { logs, total };
  }

  /**
   * FETCH ENTITY HISTORY
   */
  async fetchEntityHistory(
    entityType: string,
    entityId: UUID
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: {
        entityType,
        entityId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
} 