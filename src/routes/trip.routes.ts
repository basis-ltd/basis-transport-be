import { Router } from 'express';
import { TripController } from '../controllers/trip.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

const tripController = new TripController();

// CREATE TRIP
router.post('/', authMiddleware, tripController.createTrip);

// UPDATE TRIP
router.patch('/:id', authMiddleware, tripController.updateTrip);

// DELETE TRIP
router.delete('/:id', authMiddleware, tripController.deleteTrip);

// FETCH TRIPS
router.get('/', authMiddleware, tripController.fetchTrips);

// GET TRIP BY ID
router.get('/:id', authMiddleware, tripController.getTripById);

// GET TRIP BY REFERENCE ID
router.get('/reference/:referenceId', authMiddleware, tripController.getTripByReferenceId);

export default router;
