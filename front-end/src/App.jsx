// Importaciones de React, hooks, zustand y paginas internas
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Home from './paginas/Home';
import Login from './paginas/Login';
import Dashboard from './paginas/Dashboard';
import Perfil from './paginas/Perfil';
import Carrito from './paginas/Carrito';
import Registro from './paginas/Registro';
import MisPedidos from './paginas/MisPedidos';
import AdminDashboard from './paginas/AdminDashboard';

// Importación de los estilos CSS específicos para el componente App
import styles from './styles/App.module.css';

/*Componente PrivateRoute: envuelvo las rutas y las protejo, si no esta autenticado el usuario lo lleva al login */
function PrivateRoute({ children }) {
  const { isAuthenticated, isInitialized } = useAuthStore();

  // Muestro un loader si la autenticación aún no se ha inicializado
  if (!isInitialized) {
    return <div className={styles.loader}>Cargando sesión...</div>;
  }

  // Si está autenticado, renderiza los componentes hijos, si no redirige al login
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Componente principal de la aplicación: Configuro las rutas de la aplicación y manejo la lógica inicial de autenticación //
function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    // Router de React Router DOM para habilitar la navegación
    <Router>
      <div className={styles.container}>
        <Routes>
          {/* Rutas públicas, accesibles sin autenticación */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Rutas protegidas que requieren que el usuario esté autenticado */}
          <Route
            path="/perfil"
            element={
              <PrivateRoute>
                <Perfil />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/carrito"
            element={
              <PrivateRoute>
                <Carrito />
              </PrivateRoute>
            }
          />
          <Route
            path="/mis-pedidos"
            element={
              <PrivateRoute>
                <MisPedidos />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

// Exporto el componente App
export default App;