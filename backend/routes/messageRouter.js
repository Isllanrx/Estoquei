const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const authMiddleware = require('../middlewares/auth.middleware');

function messageRouter() {
    router.use(authMiddleware);

    router.get('/', messageController.getAll);
    router.post('/', messageController.create);
    router.get('/:id', messageController.getOne);
    router.put('/:id', messageController.update);
    router.delete('/:id', messageController.delete);
    router.get('/private/:userId', messageController.getPrivate);

    return router;
}

module.exports = messageRouter;
