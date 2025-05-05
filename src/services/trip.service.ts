import { FindOptionsWhere, Repository } from 'typeorm';
import { Trip } from '../entities/trip.entity';
import { AppDataSource } from '../data-source';
import {
  createTripValidation,
  updateTripValidation,
} from '../validations/trip.validations';
import { NotFoundError, ValidationError } from '../helpers/errors.helper';
import { LocationService } from './location.service';
import { Location } from '../entities/location.entity';
import { User } from '../entities/user.entity';
import { LogReferenceTypes } from '../constants/logs.constants';
import { generateReferenceId } from '../helpers/string.helper';
import { AuditDelete, AuditUpdate } from '../helpers/auditDecorator';
import { UUID } from '../types';
import { getPagingData } from '../helpers/pagination.helper';
import { getPagination, Pagination } from '../helpers/pagination.helper';

export class TripService {
  private readonly tripRepository: Repository<Trip>;
  private readonly locationRepository: Repository<Location>;
  private readonly userRepository: Repository<User>;

  constructor() {
    this.tripRepository = AppDataSource.getRepository(Trip);
    this.locationRepository = AppDataSource.getRepository(Location);
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   *
   * @param trip
   * @returns
   * CREATE TRIP
   */
  async createTrip(trip: Trip): Promise<Trip> {
    // VALIDATE TRIP
    const { error, value } = createTripValidation(trip);
    if (error) {
      throw new ValidationError(error.message);
    }

    // CHECK IF LOCATION FROM EXISTS
    let locationFrom: Location | null = null;
    locationFrom = await this.locationRepository.findOne({
      where: { id: value?.locationFromId },
    });

    if (!locationFrom) {
      throw new ValidationError('Starting location not found', {
        referenceId: value?.locationFromId,
        referenceType: LogReferenceTypes.LOCATION,
      });
    }

    // CHECK IF LOCATION TO EXISTS
    let locationTo: Location | null = null;
    if (value?.locationToId) {
      locationTo = await this.locationRepository.findOne({
        where: { id: value?.locationToId },
      });

      if (!locationTo) {
        throw new ValidationError('Destination location not found', {
          referenceId: value?.locationToId,
          referenceType: LogReferenceTypes.LOCATION,
        });
      }
    }

    // CHECK IF CREATED BY EXISTS
    let createdBy: User | null = null;
    createdBy = await this.userRepository.findOne({
      where: { id: value?.createdById },
    });

    if (!createdBy) {
      throw new NotFoundError('Created by not found', {
        referenceId: value?.createdById,
        referenceType: LogReferenceTypes.USER,
      });
    }

    // GENERATE REFERENCE ID
    let referenceId = generateReferenceId(5, 'TRIP');

    // CHECK IF REFERENCE ID IS UNIQUE
    while (await this.tripRepository.findOne({ where: { referenceId } })) {
      referenceId = generateReferenceId(5, 'TRIP');
    }

    // CREATE TRIP
    const newTrip = this.tripRepository.save({
      ...value,
      locationFrom,
      locationTo,
      createdBy,
    });

    return newTrip;
  }

  /**
   * UPDATE TRIP
   * @param trip
   * @returns
   */
  @AuditUpdate({
    entityType: 'Trip',
    getEntityId: (args) => args[0],
    getUserId: (args) => args[1]?.createdById,
  })
  async updateTrip(id: UUID, trip: Partial<Trip>): Promise<Trip> {
    // VALIDATE TRIP
    const { error, value } = updateTripValidation(trip);
    if (error) {
      throw new ValidationError(error.message);
    }

    // CHECK IF TRIP EXISTS
    const existingTrip = await this.tripRepository.findOne({
      where: { id: value?.id },
    });

    if (!existingTrip) {
      throw new NotFoundError('Trip not found', {
        referenceId: value?.id,
        referenceType: LogReferenceTypes.TRIP,
      });
    }

    // CHECK IF LOCATION FROM EXISTS
    let locationFrom: Location | null = null;
    if (value?.locationFromId) {
      locationFrom = await this.locationRepository.findOne({
        where: { id: value?.locationFromId },
      });
    }

    // CHECK IF LOCATION TO EXISTS
    let locationTo: Location | null = null;
    if (value?.locationToId) {
      locationTo = await this.locationRepository.findOne({
        where: { id: value?.locationToId },
      });
    }

    // UPDATE LOCATION
    const updatedTrip = await this.tripRepository.save({
      ...existingTrip,
      ...value,
      locationFrom,
      locationTo,
    });

    return updatedTrip;
  }

  /**
   * DELETE TRIP
   * @param id
   * @returns
   */
  @AuditDelete({
    entityType: 'Trip',
    getEntityId: (args) => args[0],
    getUserId: (args) => args[1]?.createdById,
  })
  async deleteTrip(id: UUID, metadata?: { createdById?: UUID }): Promise<void> {
    // CHECK IF TRIP EXISTS
    const existingTrip = await this.tripRepository.findOne({
      where: { id: id as UUID },
    });

    if (!existingTrip) {
      throw new NotFoundError('Trip not found', {
        referenceId: id,
        referenceType: LogReferenceTypes.TRIP,
      });
    }

    // DELETE TRIP
    await this.tripRepository.delete(id);
  }

  /**
   * FETCH TRIPS
   * @param page
   * @param limit
   * @returns
   */
  async fetchTrips({
    page,
    size,
    condition,
  }: {
    page: number;
    size: number;
    condition: FindOptionsWhere<Trip> | FindOptionsWhere<Trip>[];
  }): Promise<Pagination<Trip>> {
    // GET PAGINATION
    const { take, skip } = getPagination({ page, size });

    const trips = await this.tripRepository.findAndCount({
      skip,
      take,
      where: condition,
      relations: {
        locationFrom: true,
        locationTo: true,
        createdBy: true,
      },
    });

    return getPagingData({
      data: trips,
      page,
      size,
    });
  }

  /**
   * GET TRIP BY ID
   * @param id
   * @returns
   */
  async getTripById(id: UUID): Promise<Trip> {
    const trip = await this.tripRepository.findOne({
      where: { id: id as UUID },
      relations: {
        locationFrom: true,
        locationTo: true,
        createdBy: true,
      },
    });

    if (!trip) {
      throw new NotFoundError('Trip not found', {
        referenceId: id,
        referenceType: LogReferenceTypes.TRIP,
      });
    }

    return trip;
  }

  /**
   * GET TRIP BY REFERENCE ID
   * @param referenceId
   * @returns
   */
  async getTripByReferenceId(referenceId: string): Promise<Trip> {
    const trip = await this.tripRepository.findOne({
      where: { referenceId },
    });

    if (!trip) {
      throw new NotFoundError('Trip not found', {
        referenceId,
        referenceType: LogReferenceTypes.TRIP,
      });
    }

    return trip;
  }
}
