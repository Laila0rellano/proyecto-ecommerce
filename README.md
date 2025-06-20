API de E-commerce P2 y PW2
Es un proyecto de API para un sistema de e-commerce básico, construido con Node.js, Express y MongoDB. Permite gestionar usuarios (clientes y administradores), productos y pedidos, incluyendo autenticación JWT y roles de usuario.

🖤​ Características Principales

Gestión de Usuarios:

  ⋆ Registro y autenticación (login) de usuarios con bcrypt para el hash de contraseñas.

  ⋆ Roles de usuario: cliente y admin.

  ⋆ Tokens JSON (JWT) para la autenticación segura y persistente.

Gestión de Productos:

  ⋆ Operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para productos.

  ⋆ Rutas protegidas por rol de admin para la creación, actualización y eliminación de productos.

Gestión de Pedidos:

  ⋆ Creación de pedidos por parte de los clientes con productos del inventario.

  ⋆ Historial de pedidos para cada cliente.

  ⋆ Visualización de todos los pedidos y actualización de su estado por parte de los admin.

Base de Datos:

  ⋆ MongoDB como base de datos NoSQL, con Mongoose para la modelación de datos y la interacción con la base de datos.

Tests:

  ⋆ Tests de integración y unidad con Jest y Supertest para asegurar la funcionalidad de la API.

  ⋆ Base de datos en memoria para los tests (mongodb-memory-server).

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
🖤 Herramientas Utilizadas

Backend:

  ⋆ Node.js

  ⋆ Express.js 

  ⋆ Mongoose (ODM para MongoDB)

  ⋆ Bcrypt (Para hash de contraseñas)

  ⋆ JSON Web Tokens (JWT) (Para autenticación)

  ⋆ Dotenv (Para variables de entorno)

Base de Datos:

  ⋆ MongoDB

Testing:

  ⋆ Jest (Framework de testing)
 
  ⋆ Supertest (Para testear rutas HTTP)

  ⋆ Mongodb-memory-server (Base de datos en memoria para tests)

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
🖤 Configuración y Ejecución

Requisitos Previos

  ⋆ Node.js 

  ⋆ npm 

  ⋆ MongoDB 

Pasos de Instalación

1. Clonar el repositorio

2. Instalar la dependencias npm install

3. Crear un archivo .env: Copiar el contenido de .env a un nuevo archivo llamado igual en la raíz de ecommerce-api y configurar las variables de entorno.

Ejecución de la API

 ⋆ Para iniciar el servidor de la API: npm run dev 
 ⋆ La API va a estar disponible en http://localhost:3000 (o el puerto que pongan en .env).
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
🖤 Ejecución de Tests

Para ejecutar los tests: npm test

Esto ejecutará Jest, que a su vez utilizará mongodb-memory-server para una base de datos temporal, asegurando que los tests sean aislados y no afecten la base de datos real de desarrollo.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
🖤 Funcionamiento del Código

server.js: Es el punto de entrada principal de la aplicación. Se encarga de conectar la base de datos y de iniciar el servidor Express en el puerto especificado.

app.js :Configura la instancia de Express. Aquí se definen los middlewares globales y se cargan las rutas de la API (/api/usuarios, /api/productos, /api/pedidos). 

models/:Contiene los esquemas de Mongoose y los modelos para las colecciones de MongoDB: User, Product, y Order. Estos archivos definen la estructura de los datos, sus tipos, validaciones y relaciones.

controllers/ :Acá está la lógica de negocio principal. Cada archivo de controlador (userController.js, productController.js, orderController.js) contiene las funciones que se ejecutan cuando se accede a una ruta específica. Estas funciones interactúan con los modelos para realizar operaciones CRUD y manejar la lógica específica de cada recurso (crear un usuario, obtener productos, etc.).

routes/:Define los endpoints de la API y cómo responden a las peticiones HTTP (GET, POST, PUT, DELETE). Cada archivo de ruta (userRoutes.js, productRoutes.js, orderRoutes.js) asocia las URLs específicas con las funciones de los controladores correspondientes. También es donde se aplican los middlewares de autenticación y autorización a rutas específicas.

middlewares/ :Contiene funciones que se ejecutan antes de que la petición llegue a la lógica del controlador.

auth.js: Implementa el middleware para autenticar tokens JWT. Verifica la validez del token que el cliente envía y extrae la información del usuario (ID, rol) para que esté disponible en la solicitud (req.user).

verificarRol.js: Implementa el middleware de autorización. Se usa después de auth.js para asegurar que el usuario autenticado tenga el rol adecuado (por ej. admin) para acceder a una ruta específica. Si el rol no es el adecuado, la petición se rechaza con un 403 Forbidden. En el front-end redirige.

Flujo de Autenticación y Autorización

Registro/Login: Un usuario se registra o inicia sesión, y si las credenciales son válidas, la API le devuelve un JWT.

Peticiones Protegidas: Cuando el usuario hace una petición a una ruta que requiere autenticación o autorización, debe incluir este JWT en el encabezado Authorization: Bearer <token>.

auth.js: El middleware de autenticación intercepta la petición y verifica el token. 

  ⋆ Si es inválido, devuelve un 401 Unauthorized. 

  ⋆ Si es válido, decodifica la información del usuario y la adjunta al objeto req.

verificarRol.js: Si la ruta requiere un rol específico (ej. admin), el middleware verificarRol.js se ejecuta después de auth.js. 

  ⋆ Verifica si el rol del usuario autenticado (obtenido del token) coincide con alguno de los roles permitidos para la ruta específica. 

⋆ Si no, devuelve un 403 Forbidden.

Acceso a la Ruta: Si ambos middlewares pasan, la petición procede al controlador de la ruta para ejecutar la lógica de negocio.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
🖤 Video Explicativo y Demostrativo: https://youtu.be/2qAPMDfN6dg
