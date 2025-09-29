/**
 * SCRIPT PARA CARGAR DATOS DE INVENTARIO A MONGODB
 * Este script carga los productos del archivo inventario.json
 * a la base de datos MongoDB para usar en el catálogo educativo
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const inventario = require('./inventario.json');

async function cargarInventario() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar colección existente
    console.log('🧹 Limpiando colección de productos...');
    await Product.deleteMany({});
    
    // Insertar productos del inventario
    console.log('📦 Insertando productos del inventario...');
    const productosInsertados = await Product.insertMany(inventario);
    
    console.log(`✅ Se insertaron ${productosInsertados.length} productos exitosamente`);
    
    // Mostrar estadísticas
    const stats = await Product.aggregate([
      {
        $group: {
          _id: "$categoria",
          cantidad: { $sum: 1 },
          precioPromedio: { $avg: "$precio_unitario" }
        }
      },
      {
        $sort: { cantidad: -1 }
      }
    ]);
    
    console.log('\n📊 ESTADÍSTICAS POR CATEGORÍA:');
    stats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.cantidad} productos (Precio promedio: $${Math.round(stat.precioPromedio)})`);
    });
    
    console.log('\n🎓 DATOS CARGADOS PARA USO EDUCATIVO');
    console.log('   - Ahora puedes usar el catálogo para demostrar filtros MongoDB');
    console.log('   - Accede a /catalogo para ver la interfaz');
    console.log('   - Usa /api/productos/ejemplos-operadores para ver ejemplos');
    
  } catch (error) {
    console.error('❌ Error al cargar inventario:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  cargarInventario();
}

module.exports = cargarInventario;