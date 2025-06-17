// Importaciones 
import React from 'react'; 
import { useAuthStore } from '../store/authStore';
import { Container, Card, Button } from 'react-bootstrap'; 
import Layout from '../components/Layout';
import styles from '../styles/App.module.css'; 

// Perfil: Muestra la información del perfil del usuario (nombre, email y rol) y para cerrar sesion tambien.
function Perfil() {
  const { user, logout } = useAuthStore();

  // handleEditClick: Por ahora, solo muestra una alerta ya que la funcionalidad de edición no está implementada.
  const handleEditClick = () => {
    alert('La funcionalidad de editar perfil está en desarrollo ;).');
  };

  // Si el usuario no está cargado (lo cual debería ser raro si la ruta está protegida), se muestra este mensaje.
  if (!user) {
    return (
      <Layout>
        <Container className="mt-5 text-center">
          <p>Cargando información del usuario o usuario no autenticado.</p>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container className="mt-5">
        <Card className={styles.authContainers}> 
          <Card.Body className="text-center"> 
            <Card.Title className="mb-4"><h3>Mi Perfil</h3></Card.Title> 

            <p><strong>Nombre:</strong> {user.nombre || 'No disponible'}</p>
            <p><strong>Email:</strong> {user.email || 'No disponible'}</p>
            <p><strong>Rol:</strong> {user.rol || 'No especificado'}</p>

            <div className="d-grid gap-2 mt-4"> 
              <Button className={styles.botonPrimario} onClick={handleEditClick}>
                Editar Perfil
              </Button>

              {/* Botón de cerrar sesión. Usa el estilo de peligro personalizado */}
              <Button className={styles.botonDanger} onClick={logout}>
                Cerrar sesión
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </Layout>
  );
}

export default Perfil;