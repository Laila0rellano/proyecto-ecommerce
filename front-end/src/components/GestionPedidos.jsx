//Importaciones
import { useEffect, useState } from 'react';
import { Table, Button, Form, Row, Col } from 'react-bootstrap'; 
import { useAuthStore } from '../store/authStore';

//GestionPedidos: solo para los admins, ven el estado y contenido de los pedidos realizados por los usuarios. tambien pueden cambiar el estado
function GestionPedidos() {
  const { token } = useAuthStore();
  const [pedidos, setPedidos] = useState([]);

  //fetchPedidos: obtiene la lista de todos los pedidos desde el backend y actualiza el estado de los pedidos
  const fetchPedidos = () => {
    fetch('http://localhost:3000/api/pedidos', {
      headers: { Authorization: `Bearer ${token}` } // Incluye el token JWT para autenticación
    })
      .then((res) => res.json()) 
      .then((data) => setPedidos(data)) // Actualiza el estado `pedidos` con los datos recibidos
      .catch((err) => console.error('Error al obtener pedidos:', err)); 
  };

  // useEffect: cargar la lista de pedidos inicial. se reejecuta si el token cambia
  useEffect(() => {
    fetchPedidos(); 
  }, [token]); 

  // cambiarEstado: actualiza el estado de un pedido específico según su ID con una solicitud PUT 
  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`http://localhost:3000/api/pedidos/${id}`, {
        method: 'PUT', // Método HTTP PUT para actualizar
        headers: {
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ estado: nuevoEstado }) // Envía el nuevo estado en el cuerpo de la solicitud
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Error desconocido al actualizar.' }));
        throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
      }
      setPedidos((prev) =>
        prev.map((p) => (p._id === id ? { ...p, estado: nuevoEstado } : p))
      );
    } catch (err) {
      console.error('Error al cambiar estado del pedido:', err); //muestra el error en la consola
      alert(`Error al actualizar el estado del pedido: ${err.message || 'Intenta de nuevo.'}`); 
    }
  };

  // Renderizado
  return (
    <>
      <Row className="mb-3">
        <Col>
          <h4>Listado de Pedidos</h4>
        </Col>
      </Row>

      {/* Renderizado condicional: si no hay pedidos */}
      {pedidos.length === 0 ? (
        <p>No hay pedidos para mostrar.</p>
      ) : (
        // agregué la propiedad `responsive` de Table de React-Bootstrap hace que la tabla se pueda scrollear horizontalmente
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID Pedido</th> {/*para reducir el ancho de la columna acorté este ID en la línea 80 */}
              <th>Cliente</th>
              <th>Productos</th>
              <th>Estado</th>
              <th>Acción</th> {/* Columna para el selector de estado */}
            </tr>
          </thead>
          <tbody>
            {/* Todos los datos se muestran SOLAMENTE si existen y si no estan encadenados con un "dato desconocido"*/}
            {pedidos.map((pedido) => (
              <tr key={pedido._id}>
                <td>{pedido._id?.slice(-6) || 'N/A'}</td>  {/* Muestra solo los últimos 6 caracteres del ID para brevedad y responsividad */}
                <td>{pedido.usuario?.email || 'Usuario Desconocido'}</td>
                <td>
                  <ul>
                    {pedido.productos.map((prod, i) => (
                      <li key={prod.producto?._id || i}>
                        {prod.producto?.nombre || 'Producto Desconocido'} x {prod.cantidad}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>{pedido.estado}</td>
                <td>
                  {/* Selector de formulario para cambiar el estado del pedido */}
                  <Form.Select
                    value={pedido.estado}
                    onChange={(e) => cambiarEstado(pedido._id, e.target.value)}
                    style={{ width: 'auto', minWidth: '120px' }}
                  >
                    {/* Solo con las opciones de estado permitidas para los pedidos que tengo en el back*/}
                    <option value="pendiente">Pendiente</option>
                    <option value="enviado">Enviado</option>
                    <option value="cancelado">Cancelado</option>
                  </Form.Select>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}

export default GestionPedidos;