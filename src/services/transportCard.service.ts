import { FindOptionsWhere, Repository } from 'typeorm';
import { TransportCard } from '../entities/transportCard.entity';
import { AppDataSource } from '../data-source';
import {
  validateCreateTransportCard,
  validateUpdateTransportCard,
} from '../validations/transportCard.validations';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../helpers/errors.helper';
import { LogReferenceTypes } from '../constants/logs.constants';
import { UUID } from '../types';
import {
  getPagination,
  getPagingData,
  Pagination,
} from '../helpers/pagination.helper';

export class TransportCardService {
  private readonly transportCardRepository: Repository<TransportCard>;

  constructor() {
    this.transportCardRepository = AppDataSource.getRepository(TransportCard);
  }

  /**
   * CREATE TRANSPORT CARD
   */
  async createTransportCard(transportCard: Partial<TransportCard>) {
    const { error, value } = validateCreateTransportCard(transportCard);

    if (error) {
      throw new ValidationError(error.message);
    }

    const existingTransportCard = await this.transportCardRepository.findOne({
      where: { cardNumber: value.cardNumber },
    });

    if (existingTransportCard) {
      throw new ConflictError('Transport card already exists', {
        referenceType: LogReferenceTypes.TRANSPORT_CARD,
        userId: existingTransportCard?.userId,
        referenceId: existingTransportCard?.id,
      });
    }

    const newTransportCard = await this.transportCardRepository.save(value);

    return newTransportCard;
  }

  /**
   * FETCH TRANSPORT CARDS
   */
  async fetchTransportCards({
    page,
    size,
    condition,
  }: {
    page: number;
    size: number;
    condition:
      | FindOptionsWhere<TransportCard>
      | FindOptionsWhere<TransportCard>[];
  }): Promise<Pagination<TransportCard>> {
    // GET PAGINATION
    const { skip, take } = getPagination({ page, size });

    const transportCards = await this.transportCardRepository.findAndCount({
      where: condition,
      skip,
      take,
    });

    return getPagingData({
      data: transportCards,
      page,
      size,
    });
  }

  /**
   * GET TRANSPORT CARD BY ID
   */
  async getTransportCardById(id: UUID) {
    const transportCard = await this.transportCardRepository.findOne({
      where: { id },
    });

    if (!transportCard) {
      throw new NotFoundError('Transport card not found', {
        referenceType: LogReferenceTypes.TRANSPORT_CARD,
        referenceId: id,
      });
    }

    return transportCard;
  }

  /**
   * DELETE TRANSPORT CARD
   */
  async deleteTransportCard(id: UUID): Promise<void> {
    const transportCard = await this.getTransportCardById(id);

    await this.transportCardRepository.delete(transportCard?.id);
  }

  /**
   * UPDATE TRANSPORT CARD
   */
  async updateTransportCard(
    id: UUID,
    transportCard: Partial<TransportCard>
  ): Promise<TransportCard> {
    const { error, value } = validateUpdateTransportCard(transportCard);

    if (error) {
      throw new ValidationError(error.message);
    }

    // CHECK IF TRANSPORT CARD EXISTS
    const existingTransportCard = await this.getTransportCardById(id);

    // UPDATE TRANSPORT CARD
    const updatedTransportCard = await this.transportCardRepository.save({
      ...existingTransportCard,
      ...value,
    });

    return updatedTransportCard;
  }
}
