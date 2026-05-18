// src/routes/testRoutes.js
import express from 'express';

const router = express.Router();

/**
 * @swagger
 * /api/v1/test/ping:
 * get:
 * summary: Health check endpoint for testing server connectivity
 * tags: [Test]
 * responses:
 * 200:
 * description: Server is up and running
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success:
 * type: boolean
 * example: true
 * message:
 * type: string
 * example: "Pong!"
 */
router.get('/ping', (req, res) => {
    res.status(200).json({ success: true, message: "Pong!" });
});

export default router;