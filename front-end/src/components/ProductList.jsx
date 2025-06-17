//Importaciones
import { useState, useEffect } from 'react'; 
import { Table, Form, Button, Spinner, Row, Col } from 'react-bootstrap'; 

// ProductList muestra los productos y permite filtrarlos por nombre categoria y precio máximo
export default function ProductList({ products, filters, setFilters, loading }) {
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    let result = products; // Inicializa el resultado con la lista completa de productos.

    // Aplica filtro por categoría si está definido
    if (filters.category) {
      result = result.filter(p => p.category.toLowerCase().includes(filters.category.toLowerCase()));
    }
    // Aplica filtro por búsqueda de nombre si está definido
    if (filters.search) {
      result = result.filter(p => p.name.toLowerCase().includes(filters.search.toLowerCase()));
    }
    // Aplica filtro por precio máximo si está definido
    if (filters.maxPrice) {
      const max = parseFloat(filters.maxPrice); 
      if (!isNaN(max)) { 
        result = result.filter(p => p.price <= max);
      }
    }

    setFilteredProducts(result); // Actualiza el estado con los productos filtrados.
  }, [products, filters]); 

  // handleChange: Maneja los cambios en los inputs del formulario de filtros.
  const handleChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // handleClear: Reinicia todos los filtros a sus valores iniciales vacíos
  const handleClear = () => {
    setFilters({ category: '', search: '', maxPrice: '' });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando productos...</span>
        </Spinner>
      </div>
    );
  }

  // Renderizado principal
  return (
    <>
      <Form className="mb-3">
        <Row className="g-2"> 
          <Col xs={12} sm={6} md={3}> 
            <Form.Control
              placeholder="Buscar por nombre"
              name="search"
              value={filters.search}
              onChange={handleChange}
            />
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Form.Control
              placeholder="Filtrar por categoría"
              name="category"
              value={filters.category}
              onChange={handleChange}
            />
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Form.Control
              type="number"
              placeholder="Precio máximo"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleChange}
            />
          </Col>
          <Col xs={12} sm={6} md={3} className="d-grid"> 
            <Button variant="secondary" onClick={handleClear}>Limpiar filtros</Button>
          </Col>
        </Row>
      </Form>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
          {/* Renderizado condicional: si hay productos filtrados, los mapea de lo contrario, muestra un mensaje */}
          {filteredProducts.length ? filteredProducts.map(p => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>${p.price.toFixed(2)}</td> {/* Formatea el precio a 2 decimales */}
            </tr>
          )) : (
            // Mensaje si no hay productos después de aplicar los filtros
            <tr><td colSpan="3" className="text-center">No hay productos que coincidan con los filtros.</td></tr>
          )}
        </tbody>
      </Table>
    </>
  );
}