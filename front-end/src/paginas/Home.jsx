// Importaciones 
import { useEffect } from 'react';
import { Container, Button, Row, Col, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import styles from '../styles/App.module.css';

// Home: es la pantalla de inicio o de bienvenida. si el usuario esta autneticado lo redirige al dashboard. 
function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]); 

  return (
    <Container className={`text-center mt-5 ${styles.home}`}>
      <Row className="align-items-center">
        <Col md={6} className="mb-4 mb-md-0">
          <h1 className="mb-4 fw-bold">Bienvenido a SKYFORM 3D</h1>
          <p className="mb-4 text-muted">Iniciá sesión o registrate para descubrir nuestros productos</p>
          <div className="d-flex justify-content-center gap-3">
            <Button
              className={styles.botonPrimario} 
              size="lg" 
              onClick={() => navigate('/login')} 
            >
              Iniciar Sesión
            </Button>
            <Button
              className={styles.botonAdvertencia} 
              size="lg" 
              onClick={() => navigate('/registro')}
            >
              Registrarse
            </Button>
          </div>
        </Col>
        <Col md={6}>
          <Image
            src="https://tiktarh.com/storage/old/2025/01/Cart1034400www.tiktarh.com_.jpg" // url de la imagen decorativa
            alt="api-ecommerce" 
            fluid 
            style={{ maxHeight: '300px' }} 
          />
        </Col>
      </Row>
    </Container>
  );
}

export default Home;