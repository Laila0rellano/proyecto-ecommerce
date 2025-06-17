// Importaciones
import { Navbar, Nav, Container, Button, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

//  NavBarComponent: navegación principal de la aplicación, mostrando diferentes enlaces. es distinta si sos user o admin.
function NavBarComponent() {
  const { isAuthenticated, user, logout, isInitialized } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useCartStore();
  const cantidadTotal = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  //handleLogout: es para cerrar sesión llamando al logout
  const handleLogout = () => {
    logout();    
    navigate('/login'); // Redirige al usuario a la página de inicio de sesión 
  };

  // Renderizado condicional
  // EXTRAS: Esta condición la mantengo para asegurar que el Navbar no se renderice en la página de login en un principio. no debería hacerlo ya que cambie la lógica por el layout pero lo dejo por fines practicos
  if (location.pathname === '/login') return null;

  // Muestra un spinner de carga en la barra de navegación
  if (!isInitialized) {
    return (
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand>SKYFORM 3D</Navbar.Brand> 
          <Spinner animation="border" variant="light" /> 
        </Container>
      </Navbar>
    );
  }

  // Renderizado
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="navbar">
      <Container>
        <Navbar.Brand as={Link} to="/">SKYFORM 3D</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />  {/* Botón de alternancia (toggler) para el modo responsivo (menú hamburguesa en celulares) */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto align-items-center gap-3">

            {/* Enlace para usuarios NO AUTENTICADOS */}
            {!isAuthenticated && (
              <Nav.Link as={Link} to="/login">Iniciar Sesión</Nav.Link>
            )}

            {/* Enlaces para usuarios AUTENTICADOS con rol 'cliente' */}
            {isAuthenticated && user?.rol === 'cliente' && (
              <>
                <Nav.Link as={Link} to="/dashboard">Tienda</Nav.Link>
                <Nav.Link as={Link} to="/perfil">Perfil</Nav.Link>
                <Nav.Link as={Link} to="/mis-pedidos">Mis Pedidos</Nav.Link>
                {/* Botón del Carrito con indicador de cantidad */}
                <Button variant="outline-primary" onClick={() => navigate('/carrito')}>
                  🛒 Carrito{' '}
                  {cantidadTotal > 0 && (
                    <span className="badge bg-light text-dark ms-1">{cantidadTotal}</span>
                  )}
                </Button>
              </>
            )}

            {/* Enlaces para usuarios AUTENTICADOS con rol 'admin' */}
            {isAuthenticated && user?.rol === 'admin' && (
              <>
                <Nav.Link as={Link} to="/admin">Panel Admin</Nav.Link>
                <Nav.Link as={Link} to="/dashboard">Tienda</Nav.Link>
                <Nav.Link as={Link} to="/perfil">Perfil</Nav.Link>
              </>
            )}
          </Nav>

          {isAuthenticated && (
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBarComponent;