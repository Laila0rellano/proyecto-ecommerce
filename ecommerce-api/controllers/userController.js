const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

// Roles válidos según el schema (cliente y admin)
const rolesPermitidos = ['cliente', 'admin'];

const generarToken = (user) => {
  return jwt.sign(
    { _id: user._id, rol: user.rol, nombre: user.nombre },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
};

exports.registrar = async (req, res) => {
  try {
    let { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
    // Validar rol, asignar 'cliente' si no viene o es inválido
    if (!rolesPermitidos.includes(rol)) {
      rol = 'cliente';
    }

    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const nuevoUsuario = new User({ nombre, email, password, rol });
    await nuevoUsuario.save();

    const token = generarToken(nuevoUsuario);
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await User.findOne({ email });

    if (!usuario) {
      return res.status(401).json({ message: 'Email o password incorrectos' });
    }

    const esValida = await usuario.compararpassword(password);
    if (!esValida) {
      return res.status(401).json({ message: 'Email o password incorrectos' });
    }

    const token = generarToken(usuario);
    res.json({
      token,  
      user: { // Agrego esto porque posteriormente tengo que usarlo en el front-end
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      _id: usuario._id,
  }
});

  } catch (err) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: err.message });
  }
};
