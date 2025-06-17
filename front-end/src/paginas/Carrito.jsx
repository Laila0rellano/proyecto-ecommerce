//Importaciones
import { useCartStore } from '../store/cartStore'; 
import { useAuthStore } from '../store/authStore'; 
import { Container, Table, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

// Carrito: muestra los productos que el usuario ha añadido, permite que ajuste la cantidad de cada producto, elimine o vacie el carrito.
// tambien puede finalizar la ompra enviandole el pedido a la API y se lo redirige a "mis-pedidos"
function Carrito() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const { token } = useAuthStore();
  const navigate = useNavigate();

  // handleCheckout: maneja el checkout/finalizacion de la compra
  const handleCheckout = async () => {
    // Si el carrito está vacío, muestra una alerta y detiene la función
    if (cartItems.length === 0) {
      alert('Tu carrito está vacío.');
      return;
    }

    try {
      // Mapea los ítems del carrito al formato que mi backend espera para el pedido
      const pedidoData = {
        productos: cartItems.map((item) => ({
          producto: item._id, 
          cantidad: item.quantity,
        })),
      };

      // Imprimo en consola los datos que se enviarán al backend (solo para depuración)
      console.log("Productos que se mandan al backend:", cartItems);

      const res = await fetch('http://localhost:3000/api/pedidos', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json', // Indica que el cuerpo de la solicitud es JSON
          Authorization: `Bearer ${token}`, // Incluye el token JWT para autenticación
        },
        body: JSON.stringify(pedidoData), 
      });
      const data = await res.json();

      // Imprime en consola la respuesta recibida del backend (solo para depuración)
      console.log('Respuesta del backend al crear pedido:', data);

      if (!res.ok) {
        throw new Error(data?.mensaje || 'No se pudo procesar el pedido');
      }

      // Si el pedido se creó con éxito vacia el carrito y redirige a mis pedidos
      clearCart(); 
      alert('¡Pedido creado con éxito!'); 
      navigate('/mis-pedidos'); 
    } catch (err) {
      console.error('Error al finalizar la compra:', err); 
      alert('Hubo un problema al procesar tu pedido.'); 
    }
  };

  // Calcula el total del carrito sumando el precio de cada item multiplicado por su cantidad
  const total = cartItems.reduce((acc, item) => acc + item.precio * item.quantity, 0);

  return (
    <Layout>
      <Container className="mt-5">
        <h2 className="mb-4">Tu Carrito</h2>
        {/* Renderizado condicional: Si el carrito está vacío, muestra un mensaje */}
        {cartItems.length === 0 ? (
          <p>El carrito está vacío.</p>
        ) : (
          <>
             {/* si el carrito tiene productos: */}
            <Table bordered hover responsive>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th></th> {/* Columna para el botón "Quitar" */}
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item._id}> 
                    <td>{item.nombre}</td>
                    <td>{item.categoria}</td>
                    <td>${item.precio.toFixed(2)}</td> {/* Formatea el precio a 2 decimales */}
                    <td>
                      <Form.Control
                        type="number"
                        min={1} // La cantidad mínima que se puede seleccionar es 1
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item._id, parseInt(e.target.value)) // Convierte el valor del input a un entero
                        }
                        style={{ width: '80px' }}
                      />
                    </td>
                    <td>${(item.precio * item.quantity).toFixed(2)}</td> 
                    <td>
                      <Button variant="danger" size="sm" onClick={() => removeFromCart(item._id)}>
                        Quitar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Sección inferior con el total y botones de acción del carrito */}
            <div className="d-flex justify-content-between align-items-center mt-4">
              <h4>Total: ${total.toFixed(2)}</h4>
              <div>
                <Button variant="secondary" onClick={clearCart} className="me-2">
                  Vaciar carrito
                </Button>
                <Button variant="success" onClick={handleCheckout}>
                  Finalizar compra
                </Button>
              </div>
            </div>
          </>
        )}
      </Container>
    </Layout>
  );
}

export default Carrito;