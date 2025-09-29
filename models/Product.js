const mongoose = require('../config/connection');

// Esquema para productos del inventario
const productSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    producto: {
        type: String,
        required: true,
        trim: true,
        // Índice de texto para búsquedas
        text: true
    },
    categoria: {
        type: String,
        required: true,
        enum: [
            'Granos', 'Aceites', 'Lácteos', 'Huevos', 'Panadería',
            'Cafés', 'Endulzantes', 'Dulces', 'Enlatados', 'Condimentos',
            'Pasta', 'Salsas', 'Harinas', 'Bebidas', 'Aseo', 'Frutas', 'Verduras'
        ]
    },
    precio_unitario: {
        type: Number,
        required: true,
        min: 0
    },
    stock_actual: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    }
}, {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    collection: 'productos' // Nombre específico de la colección
});

// Índices para optimizar consultas educativas
productSchema.index({ categoria: 1 }); // Índice simple para filtro por categoría
productSchema.index({ precio_unitario: 1 }); // Índice para ordenamiento por precio
productSchema.index({ stock_actual: 1 }); // Índice para filtros de stock
productSchema.index({ producto: 'text' }); // Índice de texto para búsqueda por nombre

// Índice compuesto para consultas complejas (categoria + precio)
productSchema.index({ categoria: 1, precio_unitario: 1 });

// Métodos estáticos para consultas educativas
productSchema.statics.findByCategory = function(categoria) {
    return this.find({ categoria: categoria });
};

productSchema.statics.findByPriceRange = function(min, max) {
    const query = {};
    if (min !== undefined) query.$gte = min;
    if (max !== undefined) query.$lte = max;
    return this.find({ precio_unitario: query });
};

productSchema.statics.findLowStock = function(threshold = 50) {
    return this.find({ stock_actual: { $lt: threshold } });
};

productSchema.statics.searchByName = function(searchTerm) {
    return this.find({
        producto: { $regex: searchTerm, $options: 'i' }
    });
};

// Método de instancia para verificar disponibilidad
productSchema.methods.isAvailable = function() {
    return this.stock_actual > 0;
};

productSchema.methods.getStockStatus = function() {
    if (this.stock_actual === 0) return 'Agotado';
    if (this.stock_actual < 50) return 'Stock Bajo';
    if (this.stock_actual <= 100) return 'Stock Medio';
    return 'Stock Alto';
};

// Middleware para logging educativo (mostrar qué consultas se ejecutan)
productSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function() {
    console.log('🔍 MongoDB Query ejecutada:', this.getQuery());
});

// Virtual para mostrar precio formateado
productSchema.virtual('precioFormateado').get(function() {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP'
    }).format(this.precio_unitario);
});

// Asegurar que los virtuals se incluyan en JSON
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);