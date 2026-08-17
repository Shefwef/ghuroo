import { errorHandler } from "./error.js";

const MAX_PERSONS = 50;
const MIN_PRICE = 0.01;

/**
 * Express middleware: validates booking creation payload.
 *
 * Rules enforced proactively (PM-01):
 *  - number_of_persons must be an integer in [1, MAX_PERSONS]
 *  - total_price must be a positive number
 *  - booking_date must be a parseable date that is today or in the future
 *  - tour_id must be present
 */
export const validateBookingInput = (req, res, next) => {
  const { tour_id, booking_date, total_price, number_of_persons } = req.body;

  if (!tour_id) {
    return next(errorHandler(400, "tour_id is required"));
  }

  const persons = Number(number_of_persons);
  if (!Number.isInteger(persons) || persons < 1 || persons > MAX_PERSONS) {
    return next(
      errorHandler(
        400,
        `number_of_persons must be a whole number between 1 and ${MAX_PERSONS}`
      )
    );
  }

  const price = Number(total_price);
  if (!isFinite(price) || price < MIN_PRICE) {
    return next(errorHandler(400, "total_price must be a positive number"));
  }

  const date = new Date(booking_date);
  if (isNaN(date.getTime())) {
    return next(errorHandler(400, "booking_date must be a valid date"));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) {
    return next(errorHandler(400, "booking_date must not be in the past"));
  }

  next();
};
