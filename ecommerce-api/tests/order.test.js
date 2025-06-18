const request = require('supertest');
const app = require('../app');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order'); 
const jwt = require('jsonwebtoken');

let clienteToken;
let adminToken;
let productoInicial; 
let pedidoInicialCreado;

beforeAll(async () => {
  await connect();
});

beforeEach(async () => {
  await clearDatabase();

  const cliente = await User.create({
    nombre: 'Paola', 
    email: 'pao11@gmail.com',
    password: '111',
    rol: 'cliente'
  });

  const admin = await User.create({
    nombre: 'Diego', 
    email: 'diego@hotmail.com',
    password: 'diego10',
    rol: 'admin'
  });

  clienteToken = jwt.sign(
    { _id: cliente._id, rol: cliente.rol },
    process.env.JWT_SECRET || 'secreto',
    { expiresIn: '1h' }
  );

  adminToken = jwt.sign(
    { _id: admin._id, rol: admin.rol },
    process.env.JWT_SECRET || 'secreto',
    { expiresIn: '1h' }
  );

  // Crear producto para usar en tests de pedidos (lo crea el admin)
  const productRes = await request(app)
    .post('/api/productos')
    .set('Authorization', `Bearer ${adminToken}`) 
    .send({
      nombre: 'Mouse gamer',
      descripcion: 'con lucesitas',
      precio: 20,
      stock: 10
    });
  productoInicial = productRes.body;

  // Crear pedido para usar en tests (lo crea el cliente)
  const orderRes = await request(app)
    .post('/api/pedidos')
    .set('Authorization', `Bearer ${clienteToken}`) 
    .send({
      productos: [
        { producto: productoInicial._id.toString(), cantidad: 1 }
      ]
    });
  pedidoInicialCreado = orderRes.body;
});

afterAll(async () => await closeDatabase());

describe('Gestión de Pedidos', () => {
  it('debería permitir crear un pedido con productos válidos', async () => {
    const res = await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${clienteToken}`)
      .send({
        productos: [
          { producto: productoInicial._id.toString(), cantidad: 2 }
        ]
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.total).toBe(40);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.usuario).toBeDefined();
    expect(res.body.productos[0]).toHaveProperty('producto', productoInicial._id.toString());
    expect(res.body.productos[0]).toHaveProperty('cantidad', 2);
  });

  it('no debería permitir crear un pedido sin token', async () => {
    const res = await request(app)
      .post('/api/pedidos')
      .send({
        productos: [
          { producto: productoInicial._id.toString(), cantidad: 1 }
        ]
      });
    expect(res.statusCode).toBe(401); // Unauthorized
    expect(res.body).toHaveProperty('message', 'Acceso denegado. Token no proporcionado.'); 
  });

  it('no debería permitir crear un pedido si faltan productos o cantidades', async () => {
    const res = await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${clienteToken}`)
      .send({
        productos: [] //vacío completamente
      });
    expect(res.statusCode).toBe(400); // Bad Request por validación
    expect(res.body).toHaveProperty('message'); 
  });

  it('debería devolver el historial del cliente', async () => {
    const res = await request(app)
      .get('/api/pedidos/mis-pedidos')
      .set('Authorization', `Bearer ${clienteToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.some(p => p._id === pedidoInicialCreado._id)).toBe(true); 
  });

  it('debería permitir al admin ver todos los pedidos', async () => {
    const res = await request(app)
      .get('/api/pedidos')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.some(p => p._id === pedidoInicialCreado._id)).toBe(true); 
  });

  it('debería permitir al admin cambiar el estado del pedido', async () => {
    const pedidoId = pedidoInicialCreado._id;

    const res = await request(app)
      .put(`/api/pedidos/${pedidoId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ estado: 'enviado' });

    expect(res.statusCode).toBe(200);
    expect(res.body.estado).toBe('enviado');
    expect(res.body).toHaveProperty('_id', pedidoId); 

    // verifico directamente en la base de datos
    const updatedOrder = await Order.findById(pedidoId);
    expect(updatedOrder.estado).toBe('enviado');
  });

  it('no debería permitir a un cliente cambiar el estado del pedido', async () => {
    const pedidoId = pedidoInicialCreado._id;

    const res = await request(app)
      .put(`/api/pedidos/${pedidoId}`)
      .set('Authorization', `Bearer ${clienteToken}`) // Intento con el token de cliente
      .send({ estado: 'cancelado' });

    expect(res.statusCode).toBe(403); // Forbidden
    expect(res.body).toHaveProperty('message', 'Acceso denegado. No tienes permisos suficientes.');
  });
});
