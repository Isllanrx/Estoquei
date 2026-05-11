const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

function userRouter() {
    router.post('/login', userController.login);
    router.post('/', userController.signup);
    router.post('/upload/:id', userController.uploadImage);

    // Rotas protegidas
    router.use(authMiddleware);
    router.get('/', userController.getAll);
    router.get('/:id', userController.getOne);
    router.delete('/:id', userController.delete);

    return router;
}

module.exports = userRouter;
