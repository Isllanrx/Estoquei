const Message = require('../models/MessageSchema');
const { AppError } = require('../middlewares/error.middleware');

class MessageService {
    async findAll(userId) {
        return await Message.find()
            .sort({ createdAt: -1 })
            .where({ 
                $or: [
                    { destination: null }, 
                    { destination: userId }, 
                    { autorId: userId }
                ] 
            })
            .populate('autorId', 'nome imagem');
    }

    async create(messageData, userId) {
        const message = new Message({
            content: messageData.texto,
            autorId: userId,
            type: messageData.type || 'message',
            destination: messageData.destination || null
        });
        await message.save();
        return await Message.findById(message._id).populate('autorId', 'nome imagem');
    }

    async findById(id) {
        const message = await Message.findById(id).populate('autorId', 'nome imagem');
        if (!message) {
            throw new AppError('Mensagem não encontrada', 404);
        }
        return message;
    }

    async update(id, userId, content) {
        const message = await Message.findById(id);
        if (!message) {
            throw new AppError('Mensagem não encontrada', 404);
        }

        if (message.autorId.toString() !== userId) {
            throw new AppError('Não autorizado para editar esta mensagem', 403);
        }

        message.content = content;
        await message.save();
        return await Message.findById(message._id).populate('autorId', 'nome imagem');
    }

    async delete(id, userId) {
        const message = await Message.findById(id);
        if (!message) {
            throw new AppError('Mensagem não encontrada', 404);
        }

        if (message.autorId.toString() !== userId) {
            throw new AppError('Não autorizado para deletar esta mensagem', 403);
        }

        await Message.findByIdAndDelete(id);
    }

    async findPrivate(myId, otherUserId) {
        return await Message.find({
            $or: [
                { autorId: myId, destination: otherUserId },
                { autorId: otherUserId, destination: myId }
            ]
        })
        .sort({ createdAt: 1 })
        .populate('autorId', 'nome imagem');
    }
}

module.exports = new MessageService();
