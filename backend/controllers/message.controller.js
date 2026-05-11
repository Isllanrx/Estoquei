const messageService = require('../services/message.service');
const { AppError } = require('../middlewares/error.middleware');

class MessageController {
    async getAll(req, res, next) {
        try {
            const messages = await messageService.findAll(req.userId);
            res.json(messages);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const message = await messageService.create(req.body, req.userId);
            res.status(201).json(message);
        } catch (error) {
            next(error);
        }
    }

    async getOne(req, res, next) {
        try {
            const message = await messageService.findById(req.params.id);
            res.json(message);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const message = await messageService.update(req.params.id, req.userId, req.body.content);
            res.json(message);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await messageService.delete(req.params.id, req.userId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async getPrivate(req, res, next) {
        try {
            const messages = await messageService.findPrivate(req.userId, req.params.userId);
            res.json(messages);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new MessageController();
