// Importaciones 
import { useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap'; 
import { useDataStore } from '../store/dataStore';
import { useAuthStore } from '../store/authStore'; 
import { useCartStore } from '../store/cartStore'; 
import { useNavigate } from 'react-router-dom';
import styles from '../styles/App.module.css';
import Layout from '../components/Layout';

// Dashboard: es la pagina principal para los usuarios comunes. muestra una lista de productos, permite filtrarlos y ponerlos o quitarlos del carrito
function Dashboard() {
  const { isAuthenticated } = useAuthStore();
  const { filteredData, filters, setFilters, resetFilter, fetchData, isLoading, error } = useDataStore(); // Se añadió isLoading y error
  const { addToCart, removeFromCart, isInCart } = useCartStore();
  const navigate = useNavigate();

  // useEffect para manejar la autenticación Si el usuario NO está autenticado, lo redirige a la página de login.
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchData(); 
    }
  }, [isAuthenticated, fetchData, navigate]);

  const handleChange = (e) => {
    setFilters({ [e.target.name]: e.target.value });
  };

  const handleClear = () => {
    resetFilter(); 
  };

  // Renderizado condicional
  if (isLoading) {
    return (
      <Layout>
        <Container className="mt-5 text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando productos...</span>
          </Spinner>
          <p className="mt-2">Cargando productos...</p>
        </Container>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Container className="mt-5">
          <Alert variant="danger">
            Error al cargar los productos: {error}
          </Alert>
          <Button onClick={fetchData} className="mt-3">
            Reintentar
          </Button>
        </Container>
      </Layout>
    );
  }

  // Tenderizado principal
  return (
    <Layout>
      <Container className="mt-5">
        <h2 className="mb-4">Nuestros Productos</h2>

       {/* Sección de filtros */}
        <Form className="mb-4 d-flex gap-2 flex-wrap">
          <Form.Control
            type="text"
            placeholder="Buscar por nombre..."
            name="search"
            value={filters.search}
            onChange={handleChange}
            style={{ maxWidth: '250px' }}
          />
          <Form.Control
            type="text"
            placeholder="Filtrar por categoría"
            name="category"
            value={filters.category}
            onChange={handleChange}
            style={{ maxWidth: '200px' }}
          />
          <Form.Control
            type="number"
            placeholder="Precio máximo"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleChange}
            style={{ maxWidth: '150px' }}
          />
          <Button variant="secondary" onClick={handleClear}>
            Limpiar filtros
          </Button>
        </Form>

        {/* Sección de productos */}
        <Row>
          {filteredData.length > 0 ? (
            filteredData.map((producto) => (
              <Col md={4} key={producto._id} className="mb-4">
                <Card className={styles.card}>
                  {/* Imagen del producto (con encadenamiento opcional) */}
                  {producto.imagen && (
                    <Card.Img
                      variant="top"
                      src={producto.imagen}
                      alt={producto.nombre || 'Imagen de producto'} // Fallback 
                      style={{ maxHeight: '200px', objectFit: 'cover' }}
                    />
                  )}
                  <Card.Body>
                    <Card.Title>{producto.nombre}</Card.Title>
                    <Card.Text>Categoría: {producto.categoria}</Card.Text>
                    <Card.Text>Precio: ${producto.precio?.toFixed(2) || 'N/A'}</Card.Text> 

                    {/* Botones para añadir/quitar del carrito */}
                    {isInCart(producto._id) ? (
                      <>
                        <Button variant="success" disabled className="me-2">Agregado</Button>
                        <Button variant="danger" onClick={() => removeFromCart(producto._id)}>Quitar</Button>
                      </>
                    ) : (
                      <Button className={styles.botonPrimario} onClick={() => addToCart(producto)}>Agregar al carrito</Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col>
              <p className="text-center">No hay productos que coincidan con los filtros.</p>
            </Col>
          )}
        </Row>
      </Container>
    </Layout>
  );
}

export default Dashboard;