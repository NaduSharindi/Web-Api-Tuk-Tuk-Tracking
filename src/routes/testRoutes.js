// src/routes/testRoutes.js
import express from 'express';

const router = express.Router();
router.get('/ping', (req, res) => {
    res.status(200).json({ success: true, message: "Pong!" });
});

export default router;