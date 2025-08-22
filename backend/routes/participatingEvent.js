const express = require('express');
const router = express.Router();
const participatingEventController = require('../controllers/participatingEventController');
const { memberAuth, userAuth } = require('../middleware/auth');

router.post('/', memberAuth, participatingEventController.createParticipatingEvent);
router.get('/', memberAuth, participatingEventController.getMemberParticipatingEvents);
router.get('/all', memberAuth, participatingEventController.getAllParticipatingEvents);
router.get('/open', userAuth, participatingEventController.getOpenEvents);
router.get('/:id', memberAuth, participatingEventController.getParticipatingEvent);
router.put('/:id', memberAuth, participatingEventController.updateParticipatingEvent);
router.delete('/:id', memberAuth, participatingEventController.deleteParticipatingEvent);

module.exports = router;
