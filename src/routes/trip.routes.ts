import { Router } from 'express';
import { TripController } from '../controllers/trip.controller';

const router = Router();

const tripController = new TripController();

// CREATE TRIP
router.post('/', tripController.createTrip);

// UPDATE TRIP
router.patch('/:id', tripController.updateTrip);

// DELETE TRIP
router.delete('/:id', tripController.deleteTrip);

// FETCH TRIPS
router.get('/', tripController.fetchTrips);

// GET TRIP BY ID
router.get('/:id', tripController.getTripById);

// GET TRIP BY REFERENCE ID
router.get('/reference/:referenceId', tripController.getTripByReferenceId);

export default router;
