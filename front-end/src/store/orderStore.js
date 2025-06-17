import { create } from 'zustand';

// useOrderStore: para manejar el estado de los pedidos de un usuario. Permite obtener y almacenar la lista de pedidos desde la API.
export const useOrderStore = create((set) => ({
  //estado inicial
  orders: [],
  isLoading: false,
  error: null,

  //fetchOrders: Función asíncrona para obtener la lista de pedidos del usuario desde la API.
  fetchOrders: async (token) => {
    set({ isLoading: true, error: null });  // Establece el estado de carga y resetea cualquier error anterior
    try {
      const res = await fetch('http://localhost:3000/api/pedidos/mis-pedidos', { 
        headers: {
          Authorization: `Bearer ${token}`, //el token en los encabezados de autorización
        },
      });

      // Si la respuesta no es exitosa, lanza un error
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Error desconocido del servidor.' }));
        throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
      }
      const data = await res.json(); 

      // Actualiza el estado con los pedidos obtenidos y marca la carga como finalizada
      set({ orders: data, isLoading: false, error: null });
    } catch (error) {
      console.error('Error al obtener los pedidos:', error); // muestra el error en consola para que lo pueda revisar
      set({
        isLoading: false,
        error: error.message || 'No se pudieron cargar los pedidos. Intenta de nuevo más tarde.',
      });
    }
  },
}));