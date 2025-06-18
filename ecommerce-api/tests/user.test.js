const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const User = require('../models/User'); 

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Gestión Usuarios', () => {

  // Test de Registro y Login
  it('debería permitir registrar un nuevo usuario y loguearlo', async () => {
    // Registro
    const registerRes = await request(app).post('/api/usuarios/register').send({
      nombre: 'Armin',
      email: 'arminrarlert@gmail.com',
      password: 'armin123'
    });

    expect(registerRes.statusCode).toBe(201);
    expect(registerRes.body).toHaveProperty('token');
    const registeredUserToken = registerRes.body.token;

    // Login con el usuario recién registrado
    const loginRes = await request(app).post('/api/usuarios/login').send({
      email: 'arminrarlert@gmail.com',
      password: 'armin123'
    });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
    expect(loginRes.body.token).toBeDefined();
  });

  // Test de Validaciones y Seguridad
  it('no debería registrar usuario con email duplicado', async () => {
    await request(app).post('/api/usuarios/register').send({
      nombre: 'Levi',
      email: 'leviackerman@hotmail.com',
      password: '12333'
    });
    const res = await request(app).post('/api/usuarios/register').send({
      nombre: 'Duplicado',
      email: 'leviackerman@hotmail.com',
      password: '12333'
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('debería guardar la contraseña hasheada y no en texto plano', async () => {
    const rawPassword = 'Contraseñasecreta';
    await request(app).post('/api/usuarios/register').send({
      nombre: 'Hasheado',
      email: 'hash@test.com',
      password: rawPassword
    });

    const userInDb = await User.findOne({ email: 'hash@test.com' });
    expect(userInDb).not.toBeNull();
    expect(userInDb.password).not.toBe(rawPassword);
  });

  it('debería proteger rutas y rechazar acceso sin token', async () => {
    const res = await request(app).get('/api/usuarios/perfil');
    expect(res.statusCode).toBe(401); // Unauthorized
    expect(res.body).toHaveProperty('message', 'Acceso denegado. Token no proporcionado.');
  });

  it('debería rechazar acceso a rutas con rol insuficiente', async () => {
    const userRes = await request(app).post('/api/usuarios/register').send({
      nombre: 'Cliente',
      email: 'cliente@nuevo.com',
      password: '4567',
      rol: 'cliente'
    });
    const clienteToken = userRes.body.token;
    const res = await request(app)
      .get('/api/usuarios/admin')
      .set('Authorization', `Bearer ${clienteToken}`);

    expect(res.statusCode).toBe(403); // Forbidden
    expect(res.body).toHaveProperty('message', 'Acceso denegado. No tienes permisos suficientes.');
  });
});
