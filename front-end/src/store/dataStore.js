import { create } from 'zustand';

//useDataStore: manejar la lógica de datos de productos, obtención y el filtrado en general
export const useDataStore = create((set) => ({
  //estados iniciales
  data: [],
  filteredData: [],
  filters: { 
    search: '', //search comun por barra de busqueda
    category: '', //filtro por categoría del producto (falta implementar la categoría en el back)
    maxPrice: '', //filtrado por precio máximo
  },
  isLoading: false,
  error: null,

  //fetchData: obtener la lista de productos de la API.  Una vez obtenidos los datos, los almacena 
  fetchData: async () => { 
    set({ isLoading: true, error: null }); 
    try {
      const token = localStorage.getItem('token'); // Obtiene el token del localStorage
      const res = await fetch('http://localhost:3000/api/productos', { 
        headers: {
          Authorization: `Bearer ${token}`, // Incluye el token en los encabezados de autorización
        },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Error del servidor.' }));
        throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
      }
      const result = await res.json(); 
      
      // Actualiza el estado con los datos obtenidos y marca la carga como finalizada
      set({
        data: result,
        filteredData: result,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error en la función fetchData:', error);  // Captura cualquier error (red, API, parsing) y actualiza el estado de error
      set({
        isLoading: false,
        error: error.message || 'Error al cargar los productos. Intenta de nuevo más tarde.',
      });
    }
  },

  // setFilters: Realiza un filtrado en cadena con filtros, aplicando cada filtro uno tras otro.
  setFilters: (newFilters) => {
    set((state) => {
      // 1. Actualiza el objeto `filters` combinando los filtros existentes con los nuevos
      const filters = { ...state.filters, ...newFilters };

      // 2. Inicia el proceso de filtrado con la lista de datos original
      let filtered = state.data;

      // 3. Aplica el filtro de búsqueda por nombre (si no existe pasa a categoría)
      if (filters.search) {
        filtered = filtered.filter((p) =>
          p.nombre.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      // 4. Aplica el filtro de categoría (si no existe pasa a precio)
      if (filters.category) {
        filtered = filtered.filter((p) =>
          p.categoria.toLowerCase().includes(filters.category.toLowerCase())
        );
      }
      // 5. Aplica el filtro de precio máximo (si existe y es un número válido)
      if (filters.maxPrice) {
        const max = parseFloat(filters.maxPrice); // Convierte el precio máximo a número
        if (!isNaN(max)) {
          filtered = filtered.filter((p) => p.precio <= max);
        }
      }

      // 6. Retorna el nuevo estado con los filtros actualizados y los datos filtrados
      return {
        filters,
        filteredData: filtered,
      };
    });
  },

  // resetFilter: Resetea todos los filtros a sus valores iniciales (vacíos/inexistentes) y restaura la lista completa de products
  resetFilter: () =>
    set((state) => ({
      filters: { search: '', category: '', maxPrice: '' }, // Resetea todos los filtros
      filteredData: state.data, // Muestra todos los productos nuevamente
    })),
}));