const request = require('supertest');
const app = require('../app');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const User = require('../models/User');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

let adminToken;
let userToken;

beforeAll(async () => {
  await connect();

  // Crear admin
  const admin = await User.create({
    nombre: 'Admin',
    email: 'admin@test.com',
    password: '123456',
    rol: 'admin'
  });

  adminToken = jwt.sign(
    { id: admin._id, rol: admin.rol, nombre: admin.nombre },
    process.env.JWT_SECRET || 'secreto',
    { expiresIn: '1h' }
  );

  // Crear usuario normal
  const user = await User.create({
    nombre: 'Cliente',
    email: 'cliente@test.com',
    password: '123456',
    rol: 'cliente'
  });

  userToken = jwt.sign(
    { id: user._id, rol: user.rol, nombre: user.nombre },
    process.env.JWT_SECRET || 'secreto',
    { expiresIn: '1h' }
  );
});

afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Gestión de Productos', () => {
  it('debería crear un producto como admin', async () => {
    const res = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Producto 1',
        descripcion: 'Descripción 1',
        precio: 100,
        stock: 10
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.nombre).toBe('Producto 1');
  });

  it('no debería crear producto sin token', async () => {
    const res = await request(app)
      .post('/api/productos')
      .send({
        nombre: 'Producto sin token',
        descripcion: 'Test',
        precio: 50,
        stock: 5
      });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  it('no debería crear producto con rol no admin', async () => {
    const res = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        nombre: 'Producto no admin',
        descripcion: 'Test',
        precio: 50,
        stock: 5
      });
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message');
  });

  it('debería fallar si falta el nombre', async () => {
    const res = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        descripcion: 'Falla',
        precio: 100,
        stock: 5
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('debería fallar si precio es negativo', async () => {
    const res = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Producto precio negativo',
        descripcion: 'Test',
        precio: -10,
        stock: 5
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('debería obtener lista de productos', async () => {
    await Product.create({
      nombre: 'Producto 2',
      descripcion: 'Otro',
      precio: 50,
      stock: 5
    });

    const res = await request(app).get('/api/productos');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('debería obtener un producto por id', async () => {
    const prod = await Product.create({
      nombre: 'Producto 3',
      descripcion: 'Descripción 3',
      precio: 30,
      stock: 7
    });

    const res = await request(app).get(`/api/productos/${prod._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.nombre).toBe('Producto 3');
  });

  it('debería actualizar un producto como admin', async () => {
    const prod = await Product.create({
      nombre: 'Producto 4',
      descripcion: 'Desc 4',
      precio: 60,
      stock: 8
    });

    const res = await request(app)
      .put(`/api/productos/${prod._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Producto 4 actualizado',
        precio: 70
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.nombre).toBe('Producto 4 actualizado');
    expect(res.body.precio).toBe(70);
  });

  it('no debería actualizar producto con rol no admin', async () => {
    const prod = await Product.create({
      nombre: 'Producto 5',
      descripcion: 'Desc 5',
      precio: 20,
      stock: 3
    });

    const res = await request(app)
      .put(`/api/productos/${prod._id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ nombre: 'Intento de update' });

    expect(res.statusCode).toBe(403);
  });

  it('debería eliminar un producto como admin', async () => {
    const prod = await Product.create({
      nombre: 'Producto 6',
      descripcion: 'Desc 6',
      precio: 15,
      stock: 2
    });

    const res = await request(app)
      .delete(`/api/productos/${prod._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('no debería eliminar producto con rol no admin', async () => {
    const prod = await Product.create({
      nombre: 'Producto 7',
      descripcion: 'Desc 7',
      precio: 10,
      stock: 1
    });

    const res = await request(app)
      .delete(`/api/productos/${prod._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
  });
});
