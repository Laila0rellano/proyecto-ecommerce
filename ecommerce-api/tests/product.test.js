const request = require('supertest');
const app = require('../app');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const User = require('../models/User');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

let adminToken;
let userToken;

// Conectar a la base de datos en memoria UNA VEZ al inicio de todos los tests
beforeAll(async () => {
  await connect();
});

// Se ejecuta ANTES de CADA test individual en este archivo
beforeEach(async () => {
  await clearDatabase(); 

  const admin = await User.create({
    nombre: 'Veronica',
    email: 'vero@test.com',
    password: 'administradora',
    rol: 'admin'
  });

  adminToken = jwt.sign(
    { _id: admin._id, rol: admin.rol, nombre: admin.nombre },
    process.env.JWT_SECRET || 'secreto',
    { expiresIn: '1h' }
  );

  const user = await User.create({
    nombre: 'Lara',
    email: 'lara10@gmail.com',
    password: 'lari24',
    rol: 'cliente'
  });

  userToken = jwt.sign(
    { _id: user._id, rol: user.rol, nombre: user.nombre },
    process.env.JWT_SECRET || 'secreto',
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  await closeDatabase();
});

describe('Gestión de Productos CRUD - crear ver actualizar y borrar', () => {

  // Test de Creación
  it('debería crear un producto como admin', async () => {
    const res = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Impresora ender 2 pro',
        descripcion: 'ender 2 pro',
        precio: 100,
        stock: 10
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.nombre).toBe('Impresora ender 2 pro');
    expect(res.body.precio).toBe(100);
  });

  it('no debería crear producto sin token', async () => {
    const res = await request(app)
      .post('/api/productos')
      .send({
        nombre: 'PLA Gris grilon3',
        descripcion: 'pla gris marca grilon',
        precio: 50,
        stock: 5
      });
    expect(res.statusCode).toBe(401); // Unauthorized
    expect(res.body).toHaveProperty('message', 'Acceso denegado. Token no proporcionado.');
  });

  it('no debería crear producto con rol no admin', async () => {
    const res = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${userToken}`) // Intento con token de cliente
      .send({
        nombre: 'Producto Random',
        descripcion: 'token de cliente',
        precio: 50,
        stock: 5
      });
    expect(res.statusCode).toBe(403); // Forbidden
    expect(res.body).toHaveProperty('message', 'Acceso denegado. Rol no autorizado.');
  });

  it('debería fallar si faltan campos obligatorios al crear producto', async () => {
    // sin nombre y sin precio
    const res = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        descripcion: 'no hay descripción',
        stock: 5
      });

    expect(res.statusCode).toBe(400); // Bad Request por validación
    expect(res.body).toHaveProperty('message', 'Faltan Campos Obligatorios'); 
  });

  // Tests de Leer
  it('debería obtener todos los productos', async () => {
    // Crear algunos productos
    await Product.create({ nombre: 'Laptop', precio: 1200, stock: 5 });
    await Product.create({ nombre: 'Teclado', precio: 75, stock: 20 });

    const res = await request(app).get('/api/productos');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body.some(p => p.nombre === 'Laptop')).toBe(true);
  });

  it('debería obtener un producto por ID', async () => {
    const newProduct = await Product.create({
      nombre: 'Monitor Gamer',
      descripcion: 'Monitor de alta resolución samsung',
      precio: 350,
      stock: 15
    });

    const res = await request(app).get(`/api/productos/${newProduct._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', newProduct._id.toString());
    expect(res.body.nombre).toBe('Monitor Gamer');
  });

  it('debería devolver 404 si el producto no se encuentra por ID', async () => {
    const nonExistentId = '605c3c0d6f7b8a001c8e0e0e'; // id random de un producto que borré en postman

    const res = await request(app).get(`/api/productos/${nonExistentId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Producto no encontrado');
  });


  // Tests de Actualización
  it('debería actualizar un producto como admin', async () => {
    const productToUpdate = await Product.create({
      nombre: 'Producto a Actualizar',
      descripcion: 'Vieja descripción',
      precio: 50,
      stock: 5
    });

    const res = await request(app)
      .put(`/api/productos/${productToUpdate._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Producto Actualizado',
        precio: 60,
        stock: 7 
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', productToUpdate._id.toString());
    expect(res.body.nombre).toBe('Producto Actualizado');
    expect(res.body.precio).toBe(60);
    expect(res.body.stock).toBe(7);
  });

  it('no debería actualizar producto con rol no admin', async () => {
    const productToUpdate = await Product.create({
      nombre: 'Monitor Philips',
      precio: 100,
      stock: 10
    });

    const res = await request(app)
      .put(`/api/productos/${productToUpdate._id}`)
      .set('Authorization', `Bearer ${userToken}`) // Intento con token de cliente
      .send({ nombre: 'Intento de update' });

    expect(res.statusCode).toBe(403); // Forbidden
    expect(res.body).toHaveProperty('message', 'Acceso denegado. Rol no autorizado.');
  });

  // Tests de Eliminación
  it('debería eliminar un producto como admin', async () => {
    const productToDelete = await Product.create({
      nombre: 'Producto para borrar',
      precio: 20,
      stock: 2
    });

    const res = await request(app)
      .delete(`/api/productos/${productToDelete._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Producto eliminado con éxito.');

    // Verificar que el producto ya no existe en la base de datos por si las dudas
    const deletedProduct = await Product.findById(productToDelete._id);
    expect(deletedProduct).toBeNull();
  });

  it('no debería eliminar producto con rol no admin', async () => {
    const productToDelete = await Product.create({
      nombre: 'Producto Eliminar No Admin',
      precio: 30,
      stock: 3
    });

    const res = await request(app)
      .delete(`/api/productos/${productToDelete._id}`)
      .set('Authorization', `Bearer ${userToken}`); // Intento con token de cliente

    expect(res.statusCode).toBe(403); // Forbidden
    expect(res.body).toHaveProperty('message', 'Acceso denegado. Rol no autorizado.');
  });
});
