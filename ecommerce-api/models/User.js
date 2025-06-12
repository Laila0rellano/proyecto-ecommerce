const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['admin', 'cliente'], default: 'cliente' },
}, { timestamps: true });

// Encriptar password antes de guardar
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// Método para comparar password en login
userSchema.methods.compararpassword = async function (passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};


module.exports = mongoose.model('User', userSchema);

