const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
const userRoutes = require('./routes/userRoutes');
app.use('/api/usuarios', userRoutes);
const productRoutes = require('./routes/productRoutes');
app.use('/api/productos', productRoutes);
const orderRoutes = require('./routes/orderRoutes');
app.use('/api/pedidos', orderRoutes);


module.exports = app;
