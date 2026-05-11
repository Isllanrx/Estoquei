const userService = require('../services/user.service');
const path = require('path');
const fs = require('fs');
const { AppError } = require('../middlewares/error.middleware');

class UserController {
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return next(new AppError('Por favor, forneça email e senha', 400));
            }
            const result = await userService.login(email, password);
            res.status(200).json({
                message: 'Usuário habilitado a logar',
                user: result
            });
        } catch (error) {
            next(error);
        }
    }

    async signup(req, res, next) {
        try {
            const user = await userService.createUser(req.body);
            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    }

    async uploadImage(req, res, next) {
        try {
            if (!req.files || !req.files.imagem) {
                return next(new AppError('Nenhuma imagem enviada', 400));
            }

            const file = req.files.imagem;
            const fileName = Date.now() + path.extname(file.name);
            const dir = path.join(__dirname, '../../frontend/public/images');
            const filePath = path.join(dir, fileName);

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            await file.mv(filePath);

            const user = await userService.updateImage(req.params.id, `/images/${fileName}`);
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const users = await userService.findAll();
            res.json(users);
        } catch (error) {
            next(error);
        }
    }

    async getOne(req, res, next) {
        try {
            const user = await userService.findById(req.params.id);
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await userService.delete(req.params.id);
            res.status(204).json(null);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
