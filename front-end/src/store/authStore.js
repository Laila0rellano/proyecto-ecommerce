import { create } from 'zustand';

// useAuthStore: Almaceno si el usuario está autenticado, la información del usuario, el token de sesión y un estado de inicialización para controlar la carga de la aplicación //
export const useAuthStore = create((set) => ({
  //estados iniciales
  isAuthenticated: false, 
  user: null, 
  token: null,
  isInitialized: false,

  initializeAuth: () => {
    try {
      // Intenta obtener el token y la información del usuario de localStorage
      const storedToken = localStorage.getItem('token');
      const storedUserRaw = localStorage.getItem('user');
      const storedUser = storedUserRaw && storedUserRaw !== 'undefined' ? JSON.parse(storedUserRaw) : null; // acá manejo casos donde el user podría ser 'undefined' o nulo.

      // Actualiza el estado inicial del store con la info de localstorage
      set({
        isAuthenticated: !!storedToken, // '!!' convierte el valor a booleano
        user: storedUser,
        token: storedToken,
        isInitialized: true, // cambia el inicio a TRUE o sea que completa el inicio de sesión 
      });
    } catch (error) {
      console.error('Error al inicializar la sesión:', error);  // para guiarme en caso de error y poder ver en consola
      set({ isInitialized: true }); // para que no cargue para siempre
    }
  },

  // login: Función asíncrona para manejar el inicio de sesión del usuario.
  login: async (email, password) => {
    try {
      const res = await fetch('http://localhost:3000/api/usuarios/login', {  // Realiza una solicitud POST a la API de login - tomo la solicitud de lo que realice en postman
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' // Indica que el cuerpo de la solicitud es JSON
        },
        body: JSON.stringify({ email, password }) // Convierte las credenciales a JSON para el cuerpo
      });
      if (!res.ok) {
        console.error('Error en la respuesta del servidor al iniciar sesión:', res.status, res.statusText);//error en el back 401 de no autorizado o 404 de no encontrado
        return false;
      }
      const data = await res.json();

      // Guardo el token y la información del usuario en localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Actualiza el estado del store con los DATOS del usuario logueado
      set({
        isAuthenticated: true,
        user: data.user,
        token: data.token,
        isInitialized: true, // marca como iniciado 
      });
      return true; 
    } catch (error) {
      console.error('Error al iniciar sesión:', error);  // para ver en consola errores de red de solicitud etc
      return false;
    }
  },

  // logout: Función para cerrar la sesión del usuario
  logout: () => {
    // Elimina los ítems del localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Resetea el estado del authstore
    set({ isAuthenticated: false, user: null, token: null });
  },
}));