const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

router.get('/check-events', ticketController.checkEvents);

module.exports = router;
