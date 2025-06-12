const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  usuario: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  productos: [
    {
      producto: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
      },
      cantidad: { 
        type: Number, 
        required: true, 
        min: [1, 'La cantidad debe ser al menos 1'] 
      }
    }
  ],
  estado: {
    type: String,
    enum: ['pendiente', 'enviado', 'cancelado'],
    default: 'pendiente'
  },
  total: { 
    type: Number, 
    required: true,
    min: [0, 'El total debe ser un número positivo'] 
  },
}, { 
  timestamps: true 
});

// Validar que haya al menos un producto en el pedido
orderSchema.path('productos').validate(function(value) {
  return value.length > 0;
}, 'El pedido debe contener al menos un producto.');

module.exports = mongoose.model('Order', orderSchema);
