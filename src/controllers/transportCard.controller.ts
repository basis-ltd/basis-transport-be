import { Request, Response, NextFunction } from 'express';
import { TransportCardService } from '../services/transportCard.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { UUID } from '../types';

// INITIALIZE SERVICES
const transportCardService = new TransportCardService();

export class TransportCardController {
  /**
   * CREATE TRANSPORT CARD
   */
  async createTransportCard(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = req as AuthenticatedRequest;

      const transportCard = await transportCardService.createTransportCard({
        ...req.body,
        userId: user.id,
      });
      return res.status(201).json({
        message: 'Transport card created successfully',
        data: transportCard,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE TRANSPORT CARD
   */
  async deleteTransportCard(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await transportCardService.deleteTransportCard(id as UUID);

      return res.status(204).json({
        message: 'Transport card deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
