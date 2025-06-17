// Importaciones 
import { useEffect, useState } from 'react'; 
import { Table, Button, Modal, Form, Row, Col } from 'react-bootstrap'; 
import { useAuthStore } from '../store/authStore';
import styles from '../styles/App.module.css';

// GestionProductos: gestionar el catalogo - funcionalidades para listar, agregar, editar y eliminar productos.
function GestionProductos() {
  const { token } = useAuthStore();
  const [productos, setProductos] = useState([]); 
  const [showModal, setShowModal] = useState(false); 
  // Almacena los datos del producto en el formulario (para agregar o editar)
  const [form, setForm] = useState({ nombre: '', precio: '', categoria: '', imagen: '', stock: '', _id: null });


  // fetchProductos: obtener la lista de todos los productos desde el backend y actualizar datos 
  const fetchProductos = () => {
    fetch('http://localhost:3000/api/productos')
      .then((res) => res.json()) 
      .then((data) => setProductos(data)) 
      .catch((error) => console.error('Error al obtener productos:', error)); 
  };

  useEffect(() => {
    fetchProductos(); 
  }, []);

  // handleFormChange:cambios del formulario en el modal para crear y para editar
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // guardarProducto: pasandose en el form id determina si es un form de creacion o de edición
  const guardarProducto = async () => {
    const method = form._id ? 'PUT' : 'POST';
    const url = form._id
      ? `http://localhost:3000/api/productos/${form._id}`
      : `http://localhost:3000/api/productos`;

    // Prepara el payload para enviar al backend
    const payload = {
      ...form, // Copia todos los campos del formulario
      precio: parseFloat(form.precio), // Convierte el precio a número flotante
      stock: parseInt(form.stock), // Convierte el stock a número entero
    };

    try {
      // Realiza la solicitud HTTP a la API
      const res = await fetch(url, {
        method, // Método HTTP (POST o PUT)
        headers: {
          'Content-Type': 'application/json', // Tipo de contenido JSON
          Authorization: `Bearer ${token}` // Token de autorización para proteger la ruta
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const error = await res.json(); 
        alert(`Error al guardar producto: ${error.message || res.statusText}`); 
        return; 
      }

      setShowModal(false); 
      setForm({ nombre: '', precio: '', categoria: '', imagen: '', stock: '', _id: null });
      fetchProductos(); 
    } catch (err) {
      alert('Error inesperado al guardar el producto.'); 
      console.error(err); // Loggea el error en consola 
    }
  };

  // eliminarProducto: producto especifico por el id y despues recarga la lista de productos
  const eliminarProducto = async (id) => {
    // extras: aca podria agregar una comprobacion "desea eliminar el producto" o algo así para evitar borrarlos sin querer
    try {
      await fetch(`http://localhost:3000/api/productos/${id}`, {
        method: 'DELETE', // Método HTTP DELETE
        headers: { Authorization: `Bearer ${token}` } 
      });
      fetchProductos(); 
    } catch (err) {
      alert('Error al eliminar el producto.');
      console.error(err);
    }
  };

  // abrirEditar: Abre el modal de formulario y precarga los datos de un producto para que se puedan editar.
  const abrirEditar = (producto) => {
    setForm(producto); // Carga los datos del producto en el formulario
    setShowModal(true); // Muestra el modal
  };

  // Renderizado
  return (
    <>
      <Row className="mb-3 align-items-center">
        <Col xs={12} md={8}> 
          <h4>Listado de Productos</h4>
        </Col>
        <Col xs={12} md={4} className="d-flex justify-content-md-end mt-2 mt-md-0"> 
          <Button className={styles.botonPrimario} onClick={() => { setForm({ nombre: '', precio: '', categoria: '', imagen: '', stock: '', _id: null }); setShowModal(true); }}>
            Agregar Producto
          </Button>
        </Col>
      </Row>


      <Table striped bordered hover responsive> {/* `responsive` hace que la tabla tenga scroll horizontal en pantallas mas chicas */}
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Acciones</th> 
          </tr>
        </thead>
        <tbody>
          {productos.map((prod) => (
            <tr key={prod._id}>
              <td>
                {/* Muestra la imagen del producto SOLO si existe */}
                {prod.imagen && (
                  <img
                    src={prod.imagen}
                    alt={prod.nombre || 'Imagen de producto'} 
                    style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }} 
                  />
                )}
                {prod.nombre}
              </td>
              <td>{prod.categoria}</td>
              <td>${prod.precio?.toFixed(2) || 'N/A'}</td> 
              <td>
                {/* Botón para editar el producto */}
                <Button
                  size="sm"
                  className={styles.botonAdvertencia}
                  onClick={() => abrirEditar(prod)}
                >
                  Editar
                </Button>
                {/* Botón para eliminar el producto */}
                <Button
                  className={styles.botonDanger}
                  size="sm"
                  onClick={() => eliminarProducto(prod._id)}
                  style={{ marginLeft: '5px' }} 
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal para agregar o editar productos */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{form._id ? 'Editar Producto' : 'Nuevo Producto'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control name="nombre" value={form.nombre} onChange={handleFormChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <Form.Control name="categoria" value={form.categoria} onChange={handleFormChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Precio</Form.Label>
              <Form.Control
                name="precio"
                type="number"
                step="0.01" // Permite valores decimales
                value={form.precio}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Stock</Form.Label>
              <Form.Control
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Link de imagen</Form.Label>
              <Form.Control
                name="imagen"
                value={form.imagen}
                onChange={handleFormChange}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button className={styles.botonPrimario} onClick={guardarProducto}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default GestionProductos;