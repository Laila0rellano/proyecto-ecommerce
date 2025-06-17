// Importaciones 
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container } from 'react-bootstrap';
import { useAuthStore } from '../store/authStore';
import styles from '../styles/App.module.css';

// Login, es el inicio de sesión con el email y la contraseña. maneja las redirecciones en base a lo que reciba
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  // handleSubmit: envia el formulacio de login y redirige
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario
    setError('');
    const success = await login(email, password);

    if (success) {
      // 1. Si el login fue exitoso, obtiene el estado actual del usuario del store
      const { user } = useAuthStore.getState();

      // 2. Redirige al usuario según su rol
      switch (user?.rol) {
        case 'admin':
          navigate('/admin');
          break;
        case 'cliente':
        case 'usuario':
          navigate('/dashboard');
          break;
        default:
          console.warn('Rol desconocido:', user?.rol);
          navigate('/login'); 
      }
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  //renderizado
  return (
    <Container className={styles.authContainers}>
      <h2 className="mb-4">Iniciar Sesión</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <Form onSubmit={handleSubmit}>

        {/* Campo de Email */}
        <Form.Group controlId="formEmail" className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required // Campo requerido
          />
        </Form.Group>

        {/* Campo de Contraseña */}
        <Form.Group controlId="formPassword" className="mb-4">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required // Campo requerido
          />
        </Form.Group>

        {/* Botón de envío del formulario */}
        <Button type="submit" className={styles.botonPrimario}>
          Entrar
        </Button>
      </Form>
    </Container>
  );
}

export default Login;