import Joi from 'joi';

// Define the exact rules for a Location Ping
const pingSchema = Joi.object({
    vehicleId: Joi.string().required(),
    deviceId: Joi.string().required(),
    latitude: Joi.number().min(-90).max(90).required(), // Must be valid Earth coordinates
    longitude: Joi.number().min(-180).max(180).required(),
    speed: Joi.number().min(0).max(150).optional(),
    heading: Joi.number().min(0).max(360).optional(),
    timestamp: Joi.date().iso().optional()
});

// Middleware function to intercept and check the data
export const validatePing = (req, res, next) => {
    const { error } = pingSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: 'Invalid Data Format',
            details: error.details[0].message
        });
    }
    next(); // Data is safe, proceed to the controller!
};