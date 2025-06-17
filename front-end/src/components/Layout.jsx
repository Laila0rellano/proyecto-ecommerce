// Importaciones 
import { Container } from 'react-bootstrap';
import NavBarComponent from './NavbarComponent'; 
import Footer from './Footer';                   
import styles from '../styles/App.module.css';

// Layout: a este componente lo hice como contenedor de diseño para las paginas en general.
// la idea es que todas las paginas tengan una estructura consistente y evitar poner el navbar y el footer en c/u
// las paginas se renderizan adentro del contenedor children mientras que el Navbar y el footer se mantienen fijos en sus respectivos lugares
function Layout({ children }) {
  return (
    <>
      <NavBarComponent />
      <main className={styles.layoutContent}>
        <Container>{children}</Container>
      </main>
      <Footer />
    </>
  );
}

export default Layout;