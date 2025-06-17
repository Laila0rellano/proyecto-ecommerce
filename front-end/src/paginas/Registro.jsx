// Importaciones 
import { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/App.module.css';

// Componente Registro: 
function Registro() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const navigate = useNavigate();

  // handleChange: Función para actualizar el estado del formulario cuando un campo cambia. con name se fija cual campo actualiza
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // handleSubmit: se ejecuta al enviar el formulario de registro.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario
    setError(''); 
    setExito(''); 

    try { 
      const res = await fetch('http://localhost:3000/api/usuarios/register', { //solicitud post
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // Indica que el cuerpo de la solicitud es JSON
        body: JSON.stringify(form) 
      });
      const data = await res.json(); // Parsea la respuesta JSON del servidor

      // Si el registro no fue exitoso
      if (!res.ok) {
        setError(data.message || 'Error al registrarse. Por favor, inténtalo de nuevo.');
        return; 
      }

      // Si el registro fue exitoso redirige al usuario a la página de login después de 2 segundos
      setExito('Registro exitoso. Ahora puedes iniciar sesión.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Ocurrió un error inesperado al intentar registrarse.');
      console.error(err);
    }
  };

  return (
    // Contenedor principal para el formulario de registro, aplicando estilos específicos
    <Container className={styles.authContainers}>
      <h2 className="mb-4">Registro de Usuario</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {exito && <Alert variant="success">{exito}</Alert>}

      <Form onSubmit={handleSubmit}>
        {/* Nombre */}
        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            name="nombre" // para handlechange 
            value={form.nombre}
            onChange={handleChange}
            required // Campo requerido
          />
        </Form.Group>

        {/* Email */}
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            name="email" // para handlechange 
            type="email"
            value={form.email}
            onChange={handleChange}
            required // Campo requerido
          />
        </Form.Group>

        {/* Contraseña */}
        <Form.Group className="mb-3">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            name="password" // para handlechange 
            type="password"
            value={form.password}
            onChange={handleChange}
            required // Campo requerido
          />
        </Form.Group>

        {/* Botón de envío del formulario */}
        <Button type="submit" className={styles.botonPrimario}>
          Registrarse
        </Button>
      </Form>
    </Container>
  );
}

export default Registro;