require('dotenv').config();
const connectDB = require('./db');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Conectar ao Banco de Dados
connectDB();

// Middlewares Globais
app.use(express.json());
app.use(cors());
app.use(fileUpload());

// Servir imagens do diretório public do frontend
app.use('/images', express.static(path.join(__dirname, '../frontend/public/images')));

// Rotas
const userRouter = require('./routes/userRouter');
const messageRouter = require('./routes/messageRouter');

app.use('/api/usuarios', userRouter());
app.use('/api/mensagens', messageRouter());

// Middleware de Erro Global (Deve ser o último)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em modo ${process.env.NODE_ENV} na porta ${PORT}`);
});
