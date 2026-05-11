const User = require('../models/UserSchema');
const { AppError } = require('../middlewares/error.middleware');
const jwt = require('jsonwebtoken');
const { hash, compare } = require('bcrypt');

class UserService {
    async login(email, password) {
        const user = await User.findOne({ email });
        
        if (!user || !(await compare(password, user.password))) {
            throw new AppError('Credenciais inválidas', 401);
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { 
            expiresIn: '1h' 
        });

        return {
            _id: user._id,
            nome: user.nome,
            email: user.email,
            imagem: user.imagem || '/images/padrao.png',
            admin: user.admin,
            token
        };
    }

    async createUser(userData) {
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            throw new AppError('E-mail já cadastrado', 400);
        }

        const passwordHash = await hash(userData.password, 10);
        const user = new User({
            ...userData,
            password: passwordHash
        });

        await user.save();
        
        const userJson = user.toJSON();
        delete userJson.password;
        return userJson;
    }

    async updateImage(userId, imagePath) {
        const user = await User.findByIdAndUpdate(
            userId,
            { imagem: imagePath },
            { new: true }
        ).select('-password');

        if (!user) {
            throw new AppError('Usuário não encontrado', 404);
        }

        return user;
    }

    async findAll() {
        return await User.find().select('-password -admin');
    }

    async findById(id) {
        const user = await User.findById(id).select('-password');
        if (!user) {
            throw new AppError('Usuário não encontrado', 404);
        }
        return user;
    }

    async delete(id) {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            throw new AppError('Usuário não encontrado', 404);
        }
    }
}

module.exports = new UserService();
