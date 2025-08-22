// Backend: participationRoutes.js
const express = require('express');
const router = express.Router();
const { userAuth, memberAuth } = require('../middleware/auth');
const participationController = require('../controllers/participationController');

router.get('/users/records', memberAuth, participationController.getUserRecords);
router.post('/', userAuth, participationController.registerParticipation);
router.get('/', userAuth, participationController.getUserParticipations);
router.get('/my', userAuth, participationController.getMyParticipations);
router.get('/users/records', userAuth, participationController.getUserRecords);
router.get('/event/:eventId/participants', userAuth, participationController.getEventParticipants);
// Add this route

module.exports = router;
