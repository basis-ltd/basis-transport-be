import { Request, Response, NextFunction } from 'express';
import { AuditLogService } from '../services/auditLog.service';
import { UUID } from '../types';
import { Between, FindOptionsWhere } from 'typeorm';
import { AuditLog } from '../entities/auditLog.entity';

export class AuditController {
  private auditLogService: AuditLogService;

  constructor() {
    this.auditLogService = new AuditLogService();
  }

  /**
   * FETCH AUDIT LOGS
   */
  fetchAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const size = Number(req.query.size) || 10;
      const entityType = req.query.entityType as string;
      const entityId = req.query.entityId as UUID;
      const action = req.query.action as string;
      const createdById = req.query.createdById as UUID;
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;

      // BUILD CONDITION
      const condition: FindOptionsWhere<AuditLog> = {};

      if (entityType) condition.entityType = entityType;
      if (entityId) condition.entityId = entityId;
      if (action) condition.action = action as any;
      if (createdById) condition.createdById = createdById;
      if (startDate && endDate) {
        condition.createdAt = Between(startDate, endDate);
      }

      const result = await this.auditLogService.fetchAuditLogs(
        page,
        size,
        entityType,
        entityId,
        createdById,
        startDate,
        endDate
      );

      return res.status(200).json({
        message: 'Audit logs retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * FETCH ENTITY HISTORY
   */
  fetchEntityHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { entityType, entityId } = req.params;

      const auditLogs = await this.auditLogService.fetchEntityHistory(
        entityType,
        entityId as UUID
      );

      return res.status(200).json({
        message: 'Entity history retrieved successfully',
        data: auditLogs,
      });
    } catch (error) {
      next(error);
    }
  };
}
