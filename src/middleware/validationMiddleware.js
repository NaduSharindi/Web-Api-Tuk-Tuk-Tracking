import Joi from 'joi';

// Define the exact rules for a SINGLE Location Ping
const pingSchema = Joi.object({
    vehicleId: Joi.string().required(),
    deviceId: Joi.string().required(),
    latitude: Joi.number().min(-90).max(90).required(), // Must be valid Earth coordinates
    longitude: Joi.number().min(-180).max(180).required(),
    speed: Joi.number().min(0).max(150).optional(),
    heading: Joi.number().min(0).max(360).optional(),
    accuracy: Joi.number().min(0).required(), // NEW: Added accuracy so Joi allows it!
    timestamp: Joi.date().iso().optional()
});

// Define the exact rules for BULK Location Pings (Array of pings)
const bulkPingSchema = Joi.object({
    pings: Joi.array().items(
        Joi.object({
            deviceId: Joi.string().required(),
            latitude: Joi.number().min(-90).max(90).required(),
            longitude: Joi.number().min(-180).max(180).required(),
            speed: Joi.number().min(0).max(150).optional(),
            heading: Joi.number().min(0).max(360).optional(),
            accuracy: Joi.number().min(0).required(), // NEW: Added accuracy here too!
            timestamp: Joi.date().iso().optional()
        })
    ).min(1).required() // Must have at least 1 ping in the array
});

// Middleware function to intercept and check a SINGLE ping
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

// Middleware function to intercept and check BULK pings
export const validateBulkPings = (req, res, next) => {
    const { error } = bulkPingSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: 'Invalid Bulk Data Format',
            details: error.details[0].message
        });
    }
    next();
};