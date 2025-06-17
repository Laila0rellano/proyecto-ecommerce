import { Container } from 'react-bootstrap';
import styles from '../styles/App.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <Container className="text-center">
        <p className="mb-1">© {new Date().getFullYear()} SKYFORM 3D</p>
        <small>LAILA ORELLANO - PROGRAMACIÓN 2 & PROGRAMACIÓN WEB 2</small>
      </Container>
    </footer>
  );
}

export default Footer;
