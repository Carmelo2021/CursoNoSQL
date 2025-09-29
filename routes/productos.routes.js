const express = require('express');
const router = express.Router();
const productosController = require('../controller/productos.controller');

/**
 * RUTAS EDUCATIVAS PARA DEMOSTRAR FILTROS MONGODB
 * Estas rutas están diseñadas para enseñar el uso práctico
 * de operadores y consultas en MongoDB
 */

// Página principal del catálogo
router.get('/catalogo', async (req, res) => {
  try {
    console.log('📚 ACCESO AL CATÁLOGO DE PRODUCTOS');
    res.render('catalogo',);
  } catch (err) {
    res.status(500).render('error', { 
      error: 'Error al cargar el catálogo',
      details: err.message 
    });
  }
});

// === API ENDPOINTS EDUCATIVOS ===

// 1. Obtener todos los productos (consulta básica)
router.get('/api/productos', productosController.getAllProducts);

// 2. Aplicar filtros (función principal educativa)
router.post('/api/productos/filtrar', productosController.filtrarProductos);

// 3. Ejemplos de operadores MongoDB
router.get('/api/productos/ejemplos-operadores', productosController.ejemplosOperadores);

// 4. Búsqueda por categoría específica
router.get('/api/productos/categoria/:categoria', productosController.buscarPorCategoria);

// 5. Búsqueda por rango de precios
router.get('/api/productos/precios', productosController.buscarPorRangoPrecios);

// 6. Estadísticas con agregaciones
router.get('/api/productos/estadisticas', productosController.obtenerEstadisticas);

// === RUTAS EDUCATIVAS ADICIONALES ===

// Demostración de operador $regex
router.get('/api/productos/buscar/:termino', async (req, res) => {
  try {
    const { termino } = req.params;
    const { caseSensitive = false } = req.query;
    
    console.log(`📚 BÚSQUEDA CON $regex: "${termino}"`);
    
    const query = {
      producto: { 
        $regex: termino, 
        $options: caseSensitive ? '' : 'i' 
      }
    };
    
    const Product = require('../models/Product');
    const productos = await Product.find(query);
    
    res.json({
      success: true,
      termino,
      caseSensitive,
      query,
      count: productos.length,
      productos,
      explicacion: `Busca productos cuyo nombre contenga "${termino}" ${caseSensitive ? '(sensible a mayúsculas)' : '(insensible a mayúsculas)'}`
    });
    
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Demostración de operadores de comparación
router.get('/api/productos/comparacion/:operador/:campo/:valor', async (req, res) => {
  try {
    const { operador, campo, valor } = req.params;
    
    const operadoresValidos = ['gt', 'gte', 'lt', 'lte', 'eq', 'ne'];
    if (!operadoresValidos.includes(operador)) {
      return res.status(400).json({
        success: false,
        error: `Operador no válido. Usa: ${operadoresValidos.join(', ')}`
      });
    }
    
    console.log(`📚 OPERADOR DE COMPARACIÓN: $${operador}`);
    
    const query = {};
    query[campo] = { [`$${operador}`]: isNaN(valor) ? valor : Number(valor) };
    
    const Product = require('../models/Product');
    const productos = await Product.find(query).limit(10);
    
    res.json({
      success: true,
      operador: `$${operador}`,
      campo,
      valor,
      query,
      count: productos.length,
      productos,
      explicacion: generarExplicacionOperador(operador, campo, valor)
    });
    
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Demostración de operadores lógicos ($and, $or)
router.post('/api/productos/logicos', async (req, res) => {
  try {
    const { operador, condiciones } = req.body;
    
    if (!['and', 'or'].includes(operador)) {
      return res.status(400).json({
        success: false,
        error: 'Operador debe ser "and" u "or"'
      });
    }
    
    console.log(`📚 OPERADOR LÓGICO: $${operador}`);
    
    const query = {};
    query[`$${operador}`] = condiciones;
    
    const Product = require('../models/Product');
    const productos = await Product.find(query);
    
    res.json({
      success: true,
      operador: `$${operador}`,
      condiciones,
      query,
      count: productos.length,
      productos,
      explicacion: operador === 'and' 
        ? 'Todas las condiciones deben cumplirse simultáneamente'
        : 'Al menos una de las condiciones debe cumplirse'
    });
    
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Demostración de agregaciones educativas
router.get('/api/productos/agregacion/:tipo', async (req, res) => {
  try {
    const { tipo } = req.params;
    const Product = require('../models/Product');
    let pipeline = [];
    let explicacion = '';
    
    switch (tipo) {
      case 'group':
        pipeline = [
          {
            $group: {
              _id: "$categoria",
              total: { $sum: 1 },
              precioPromedio: { $avg: "$precio_unitario" }
            }
          },
          { $sort: { total: -1 } }
        ];
        explicacion = '$group agrupa documentos por categoría y calcula totales y promedios';
        break;
        
      case 'match':
        pipeline = [
          { $match: { precio_unitario: { $gte: 5000 } } },
          { $sort: { precio_unitario: 1 } },
          { $limit: 10 }
        ];
        explicacion = '$match filtra documentos antes de otras operaciones (como WHERE en SQL)';
        break;
        
      case 'project':
        pipeline = [
          {
            $project: {
              producto: 1,
              categoria: 1,
              precio_unitario: 1,
              esCaros: { $gte: ["$precio_unitario", 8000] },
              stockStatus: {
                $cond: {
                  if: { $gte: ["$stock_actual", 100] },
                  then: "Alto",
                  else: "Bajo"
                }
              }
            }
          },
          { $limit: 10 }
        ];
        explicacion = '$project selecciona campos y crea campos calculados';
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: 'Tipo de agregación no válido. Usa: group, match, project'
        });
    }
    
    console.log(`📚 PIPELINE DE AGREGACIÓN (${tipo}):`, JSON.stringify(pipeline, null, 2));
    
    const resultado = await Product.aggregate(pipeline);
    
    res.json({
      success: true,
      tipo,
      pipeline,
      count: resultado.length,
      resultado,
      explicacion
    });
    
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Función auxiliar para explicar operadores
function generarExplicacionOperador(operador, campo, valor) {
  const explicaciones = {
    'gt': `${campo} mayor que ${valor}`,
    'gte': `${campo} mayor o igual a ${valor}`,
    'lt': `${campo} menor que ${valor}`,
    'lte': `${campo} menor o igual a ${valor}`,
    'eq': `${campo} exactamente igual a ${valor}`,
    'ne': `${campo} diferente de ${valor}`
  };
  
  return explicaciones[operador] || 'Operador no reconocido';
}

module.exports = router;