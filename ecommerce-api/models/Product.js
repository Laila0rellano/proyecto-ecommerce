const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: true, 
    trim: true,
    validate: {
      validator: (v) => v.trim().length > 0,
      message: 'El nombre no puede estar vacío.'
    }
  },
  descripcion: { type: String, trim: true },
  precio: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0 },
  imagen: { type: String }, // ahí va la URL o nombre del archivo
}, { timestamps: true });

productSchema.index({ nombre: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);
