const request = require('supertest');
const app = require('../app');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const User = require('../models/User');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

let clienteToken;
let adminToken;
let producto;
let pedidoCreado;

beforeAll(async () => {
  await connect();

  // Crear usuarios una vez
  const cliente = await User.create({
    nombre: 'Cliente',
    email: 'cliente@test.com',
    password: '123456',
    rol: 'cliente'
  });

  const admin = await User.create({
    nombre: 'Admin',
    email: 'admin@test.com',
    password: '123456',
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
});

beforeEach(async () => {
  // Limpiar base y crear producto nuevo antes de cada test
  await clearDatabase();

  producto = await Product.create({
    nombre: 'Producto Pedido',
    descripcion: 'Para prueba',
    precio: 20,
    stock: 10
  });

  // Crear pedido para usar en tests
  const res = await request(app)
    .post('/api/pedidos')
    .set('Authorization', `Bearer ${clienteToken}`)
    .send({
      productos: [
        { producto: producto._id.toString(), cantidad: 1 }
      ]
    });

  pedidoCreado = res.body;
});

afterAll(async () => await closeDatabase());

describe('Gestión de Pedidos', () => {
  it('debería permitir crear un pedido con productos válidos', async () => {
    const res = await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${clienteToken}`)
      .send({
        productos: [
          { producto: producto._id.toString(), cantidad: 2 }
        ]
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.total).toBe(40);
  });

  it('debería devolver el historial del cliente', async () => {
    const res = await request(app)
      .get('/api/pedidos/mis-pedidos')
      .set('Authorization', `Bearer ${clienteToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('debería permitir al admin ver todos los pedidos', async () => {
    const res = await request(app)
      .get('/api/pedidos')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('debería permitir al admin cambiar el estado del pedido', async () => {
    const pedidoId = pedidoCreado._id;

    const res = await request(app)
      .put(`/api/pedidos/${pedidoId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ estado: 'enviado' });

    expect(res.statusCode).toBe(200);
    expect(res.body.estado).toBe('enviado');
  });
});
