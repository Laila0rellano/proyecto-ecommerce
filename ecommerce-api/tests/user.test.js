const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app'); // donde exportás tu Express
const { connect, closeDatabase, clearDatabase } = require('./setup');
const User = require('../models/User'); // asegurate de que la ruta sea correcta

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Registro y login de usuarios', () => {
  it('debería registrar un nuevo usuario', async () => {
    const res = await request(app).post('/api/usuarios/register').send({
      nombre: 'Test',
      email: 'test@test.com',
      password: '123456'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  it('debería loguear un usuario existente', async () => {
    await request(app).post('/api/usuarios/register').send({
      nombre: 'Test',
      email: 'test@test.com',
      password: '123456'
    });

    const res = await request(app).post('/api/usuarios/login').send({
      email: 'test@test.com',
      password: '123456'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});

describe('Validaciones y seguridad en usuarios', () => {
  it('no debería registrar usuario con email duplicado', async () => {
    await request(app).post('/api/usuarios/register').send({
      nombre: 'Test',
      email: 'test@test.com',
      password: '123456'
    });

    const res = await request(app).post('/api/usuarios/register').send({
      nombre: 'Test2',
      email: 'test@test.com',
      password: '654321'
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('no debería registrar usuario sin email, nombre o password', async () => {
    const res = await request(app).post('/api/usuarios/register').send({
      nombre: '',
      email: '',
      password: ''
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message'); // ajustá a 'errors' si usás express-validator
  });

  it('debería guardar la contraseña hasheada y no en texto plano', async () => {
    const rawPassword = '123456';
    await request(app).post('/api/usuarios/register').send({
      nombre: 'Test',
      email: 'test2@test.com',
      password: rawPassword
    });

    const user = await User.findOne({ email: 'test2@test.com' });
    expect(user).not.toBeNull();
    expect(user.password).not.toBe(rawPassword); // debe estar hasheada
  });

  it('el token JWT debe contener el rol correcto', async () => {
    await request(app).post('/api/usuarios/register').send({
      nombre: 'AdminUser',
      email: 'admin@test.com',
      password: '123456',
      rol: 'admin'
    });

    const loginRes = await request(app).post('/api/usuarios/login').send({
      email: 'admin@test.com',
      password: '123456'
    });

    expect(loginRes.statusCode).toBe(200);
    const token = loginRes.body.token;
    expect(token).toBeDefined();

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secreto');
    expect(payload).toHaveProperty('rol');
    expect(payload.rol).toBe('admin');
  });

  it('debería proteger rutas y rechazar acceso sin token', async () => {
    const res = await request(app).get('/api/usuarios/perfil');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  it('debería rechazar acceso a rutas con rol insuficiente', async () => {
    const userRes = await request(app).post('/api/usuarios/register').send({
      nombre: 'Cliente',
      email: 'cliente2@test.com',
      password: '123456',
      rol: 'cliente'
    });

    const token = userRes.body.token;

    const res = await request(app)
      .get('/api/usuarios/admin')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message');
  });
});