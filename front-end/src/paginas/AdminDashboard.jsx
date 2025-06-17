// Importaciones 
import { useEffect } from 'react';
import { Button, Container, Nav, Tab, Row, Col } from 'react-bootstrap'; 
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import GestionPedidos from '../components/GestionPedidos';
import GestionProductos from '../components/GestionProductos';
import Layout from '../components/Layout';
import styles from '../styles/App.module.css';

// AdminDashboard: panel principal para los usuarios con rol de 'admin'. interfaz de pestañas para gestionar pedidos y productos.
// como es ruta protegida redirige al login si no son admins
function AdminDashboard() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  // useEffect para la protección de ruta
  useEffect(() => {
    // Verifica si el usuario NO está autenticado O si está autenticado pero su rol no es admin
    if (!isAuthenticated || user?.rol !== 'admin') {  // El user?.rol usa encadenamiento opcional para evitar errores si `user` es nulo o undefined.
      navigate('/login'); 
    }
  }, [isAuthenticated, user, navigate]); 

  return (
    <Layout>
      <Container className="mt-5">
        <Row className="mb-4">
          <Col>
            <h2>Panel de Administración</h2>
          </Col>
        </Row>
        {/* Componente Tab.Container de React-Bootstrap para la navegación por pestañas */}
        <Tab.Container defaultActiveKey="pedidos"> {/* 'pedidos' es la pestaña activa por defecto */}
          <Row>
            <Col>
              <Nav variant="tabs" className="flex-column flex-md-row"> {/* `flex-md-row` para que sean horizontales en pantallas medianas y grandes */}
                <Nav.Item>
                  <Nav.Link className={styles.botonSecundario} eventKey="pedidos">
                    Gestión de Pedidos
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link className={styles.botonSecundario} eventKey="productos">
                    Gestión de Productos
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col>
              <Tab.Content>
                {/* renderiza el componente GestionPedidos */}
                <Tab.Pane eventKey="pedidos">
                  <GestionPedidos />
                </Tab.Pane>
                {/* renderiza el componente GestionProductos */}
                <Tab.Pane eventKey="productos">
                  <GestionProductos />
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Container>
    </Layout>
  );
}

export default AdminDashboard;