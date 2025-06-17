// Importaciones 
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Container, Card, ListGroup, Spinner, Alert, Button } from 'react-bootstrap';
import Layout from '../components/Layout';

// Componente MisPedidos: Muestra al usuario una lista de sus pedidos realizados y los puede gestionar
function MisPedidos() {
  const { token } = useAuthStore();
  const [pedidos, setPedidos] = useState([]); 
  const [cargando, setCargando] = useState(true); 
  const [error, setError] = useState(null); 
  const [eliminandoId, setEliminandoId] = useState(null); 

  // useEffect para obtener los pedidos del usuario
  useEffect(() => {
    const fetchPedidos = async () => {
      setError(null);
      setCargando(true);

      // 1. Verificar token de autenticación
      if (!token) {
        setError('No estás autenticado. Por favor, inicia sesión para ver tus pedidos.');
        setCargando(false);
        return;
      }

      // 2. Realizar la solicitud a la API
      try {
        const res = await fetch('http://localhost:3000/api/pedidos/mis-pedidos', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // 3. Manejo de errores en la respuesta de la API 
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: 'Error desconocido del servidor.' }));
          throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
        }

        // 4. Procesar la respuesta exitosa
        const data = await res.json(); 
        setPedidos(data); // Actualiza el estado con los pedidos obtenidos
      } catch (err) {
        console.error('Error al obtener pedidos:', err);
        setError(err.message || 'No se pudieron cargar tus pedidos. Intenta de nuevo más tarde.');
      } finally {
        setCargando(false);
      }
    };

    fetchPedidos(); 
  }, [token]); // Dependencia - el efecto se re-ejecuta si el token cambia

  // handleEliminarPedido: eliminar pedidos especificos si soy el que realizo esos pedidos
  const handleEliminarPedido = async (id) => {
    // 1. pedir confirmación del usuario
    if (!window.confirm('¿Estás seguro de que querés eliminar este pedido? Esta acción es irreversible.')) {
      return;
    }
    setEliminandoId(id);
    setError(null); 

    // 2. Realizar la solicitud DELETE a la API
    try {
      const res = await fetch(`http://localhost:3000/api/pedidos/mis-pedidos/${id}`, {
        method: 'DELETE', 
        headers: {
          Authorization: `Bearer ${token}`, // Requiere el token para autorizarlo a borrar
        },
      });
      const data = await res.json(); 
      if (!res.ok) {
        throw new Error(data?.message || 'No se pudo eliminar el pedido. Revisa el estado del pedido.'); 
      }

      // 3. Si la eliminación fue exitosa
      alert('Pedido eliminado con éxito.'); 
      setPedidos((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error('Error al eliminar el pedido:', error);
      setError('Error al eliminar el pedido: ' + error.message);
    } finally {
      setEliminandoId(null);
    }
  };

  // Muestra un spinner mientras los pedidos están cargando inicialmente (lo puse para ver si funcionaba)
  if (cargando) {
    return (
      <Layout> 
        <Container className="mt-5 text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando pedidos...</span>
          </Spinner>
          <p className="mt-2">Cargando tus pedidos...</p>
        </Container>
      </Layout>
    );
  }

  // EXTRAS: Muestra un mensaje de error si ocurrió alguno al cargar los pedidos
  if (error) {
    return (
      <Layout>
        <Container className="mt-5">
          <Alert variant="danger">
            {error}
          </Alert>
          {/* Opcional: Botón para recargar la página o ir al login si falta el token */}
          {!token && (
            <Button onClick={() => window.location.href = '/login'} className="mt-3">
              Ir a Iniciar Sesión
            </Button>
          )}
          {token && ( // Solo si hay token y falló la carga
            <Button onClick={() => window.location.reload()} className="mt-3">
              Reintentar Carga
            </Button>
          )}
        </Container>
      </Layout>
    );
  }

  // Renderizado principal
  return (
    <Layout>
      <Container className="mt-5">
        <h2>Mis Pedidos</h2>

        {pedidos.length === 0 ? (
          <p>No tenés pedidos realizados aún.</p>
        ) : (
          // Mapea y renderiza cada pedido en una Card
          pedidos.map((pedido) => (
            <Card key={pedido._id} className="mb-4">
              <Card.Header>
                <strong>Pedido #{pedido._id.slice(-6)}</strong> – Estado: <em>{pedido.estado}</em>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {/* Mapea y renderiza cada producto dentro de un pedido */}
                  {pedido.productos.map((item, idx) => (
                    <ListGroup.Item key={item.producto?._id || idx} className="d-flex align-items-center">
                      <img
                        src={item.producto?.imagen || 'https://via.placeholder.com/60'} // Fallback si no hay imagen (esto para corregir si borro productos y evitar errores en la página)
                        alt={item.producto?.nombre || 'Producto desconocido'} // Fallback si no hay nombre
                        style={{ width: '60px', height: '60px', objectFit: 'cover', marginRight: '1rem' }}
                      />
                      <div>
                        <div><strong>{item.producto?.nombre || 'Producto desconocido'}</strong></div>
                        <div>Cantidad: {item.cantidad}</div>
                        <div>
                          Precio unitario: ${item.producto?.precio ? item.producto.precio.toFixed(2) : 'N/A'}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <div className="mt-3">
                  <strong>Total:</strong> ${pedido.total.toFixed(2)} <br />
                  <small>Fecha: {new Date(pedido.createdAt).toLocaleString()}</small>
                </div>
                {/* Botón de eliminar pedido, visible solo para pedidos en estado de pendiente, los enviados no se pueden borrrar */}
                {pedido.estado === 'pendiente' && (
                  <div className="mt-3">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleEliminarPedido(pedido._id)}
                      disabled={eliminandoId === pedido._id}
                    >
                      {eliminandoId === pedido._id ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                          {' '}Eliminando...
                        </>
                      ) : (
                        'Eliminar pedido'
                      )}
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          ))
        )}
      </Container>
    </Layout>
  );
}

export default MisPedidos;