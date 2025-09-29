const Product = require('../models/Product');

/**
 * CONTROLADOR EDUCATIVO DE PRODUCTOS
 * Este controlador demuestra el uso práctico de operadores MongoDB
 * para filtrar y consultar colecciones de productos
 */

// Obtener todos los productos
exports.getAllProducts = async (req, res) => {
  try {
    console.log('📚 CONSULTA EDUCATIVA: Obteniendo todos los productos');
    console.log('Query MongoDB: db.productos.find({})');
    
    const productos = await Product.find({});
    
    res.json({
      success: true,
      count: productos.length,
      productos: productos,
      queryExplanation: 'Esta consulta obtiene todos los documentos de la colección productos'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message,
      explanation: 'Error al ejecutar la consulta en MongoDB'
    });
  }
};

// Función principal para aplicar filtros (EDUCATIVA)
exports.filtrarProductos = async (req, res) => {
  try {
    const { query = {}, options = {} } = req.body;
    
    console.log('📚 FILTROS APLICADOS:', JSON.stringify(query, null, 2));
    console.log('📚 OPCIONES:', JSON.stringify(options, null, 2));

    // Construir la consulta de MongoDB
    let mongoQuery = Product.find(query);
    
    // Aplicar opciones de ordenamiento
    if (options.sort) {
      mongoQuery = mongoQuery.sort(options.sort);
      console.log('📚 ORDENAMIENTO aplicado:', options.sort);
    }
    
    // Aplicar límite si se especifica
    if (options.limit) {
      mongoQuery = mongoQuery.limit(options.limit);
      console.log('📚 LÍMITE aplicado:', options.limit);
    }

    const productos = await mongoQuery.exec();
    
    // Generar explicación educativa
    const explanation = generarExplicacionQuery(query, options);
    
    res.json({
      success: true,
      count: productos.length,
      productos: productos,
      queryUsada: query,
      opcionesUsadas: options,
      explicacionEducativa: explanation
    });

  } catch (err) {
    console.error('❌ Error en filtrarProductos:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      explanation: 'Error al aplicar los filtros en la consulta MongoDB'
    });
  }
};

// Consultas educativas específicas por operador
exports.ejemplosOperadores = async (req, res) => {
  try {
    const ejemplos = {};

    // 1. Operador $eq (igualdad)
    ejemplos.igualdad = await Product.find({ categoria: { $eq: "Lácteos" } }).limit(3);
    
    // 2. Operador $regex (expresión regular)
    ejemplos.busquedaTexto = await Product.find({ 
      producto: { $regex: "Arroz", $options: "i" } 
    }).limit(3);
    
    // 3. Operadores de comparación numérica
    ejemplos.precioMayor = await Product.find({ precio_unitario: { $gt: 10000 } }).limit(3);
    ejemplos.precioMenor = await Product.find({ precio_unitario: { $lt: 5000 } }).limit(3);
    
    // 4. Operador $and (múltiples condiciones)
    ejemplos.condicionesMultiples = await Product.find({
      $and: [
        { categoria: "Bebidas" },
        { precio_unitario: { $lte: 6000 } }
      ]
    }).limit(3);
    
    // 5. Operador $or (condiciones alternativas)
    ejemplos.condicionesAlternativas = await Product.find({
      $or: [
        { stock_actual: { $lt: 30 } },
        { categoria: "Frutas" }
      ]
    }).limit(3);
    
    // 6. Operador $in (valores en array)
    ejemplos.categoriasMultiples = await Product.find({
      categoria: { $in: ["Granos", "Pasta", "Harinas"] }
    }).limit(3);

    res.json({
      success: true,
      message: "Ejemplos educativos de operadores MongoDB",
      ejemplos: ejemplos,
      explicaciones: {
        "$eq": "Busca documentos donde el campo es exactamente igual al valor",
        "$regex": "Busca documentos donde el campo coincide con una expresión regular",
        "$gt/$lt": "Busca documentos donde el campo es mayor/menor que el valor",
        "$and": "Todas las condiciones deben cumplirse",
        "$or": "Al menos una condición debe cumplirse",
        "$in": "El valor del campo debe estar en el array proporcionado"
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Consulta por categoría (educativa)
exports.buscarPorCategoria = async (req, res) => {
  try {
    const { categoria } = req.params;
    
    console.log(`📚 BÚSQUEDA POR CATEGORÍA: ${categoria}`);
    console.log(`Query: db.productos.find({ categoria: "${categoria}" })`);
    
    const productos = await Product.findByCategory(categoria);
    
    res.json({
      success: true,
      categoria: categoria,
      count: productos.length,
      productos: productos,
      operadorUsado: "$eq (igualdad exacta)",
      explicacion: `Esta consulta busca todos los productos cuya categoría sea exactamente "${categoria}"`
    });
    
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Búsqueda por rango de precios (educativa)
exports.buscarPorRangoPrecios = async (req, res) => {
  try {
    const { min, max } = req.query;
    
    let query = {};
    let explicacion = [];
    
    if (min) {
      query.precio_unitario = { ...query.precio_unitario, $gte: parseInt(min) };
      explicacion.push(`precio >= ${min} (operador $gte)`);
    }
    
    if (max) {
      query.precio_unitario = { ...query.precio_unitario, $lte: parseInt(max) };
      explicacion.push(`precio <= ${max} (operador $lte)`);
    }
    
    console.log('📚 RANGO DE PRECIOS:', JSON.stringify(query, null, 2));
    
    const productos = await Product.find(query).sort({ precio_unitario: 1 });
    
    res.json({
      success: true,
      filtros: { min, max },
      count: productos.length,
      productos: productos,
      queryGenerada: query,
      explicacion: explicacion.join(' Y '),
      ordenamiento: "Ordenado por precio ascendente (sort: { precio_unitario: 1 })"
    });
    
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Estadísticas educativas
exports.obtenerEstadisticas = async (req, res) => {
  try {
    console.log('📚 GENERANDO ESTADÍSTICAS CON AGREGACIONES');
    
    // Agregación para contar productos por categoría
    const porCategoria = await Product.aggregate([
      {
        $group: {
          _id: "$categoria",
          cantidad: { $sum: 1 },
          precioPromedio: { $avg: "$precio_unitario" },
          stockTotal: { $sum: "$stock_actual" }
        }
      },
      {
        $sort: { cantidad: -1 }
      }
    ]);
    
    // Agregación para rangos de precio
    const rangosPrecios = await Product.aggregate([
      {
        $bucket: {
          groupBy: "$precio_unitario",
          boundaries: [0, 3000, 6000, 10000, 20000],
          default: "20000+",
          output: {
            cantidad: { $sum: 1 },
            productos: { $push: "$producto" }
          }
        }
      }
    ]);
    
    res.json({
      success: true,
      estadisticas: {
        porCategoria,
        rangosPrecios
      },
      explicacionAgregacion: {
        "$group": "Agrupa documentos por un campo y calcula valores",
        "$sum": "Suma valores numéricos",
        "$avg": "Calcula promedio de valores numéricos",
        "$sort": "Ordena los resultados",
        "$bucket": "Agrupa documentos en rangos específicos"
      }
    });
    
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Función auxiliar para generar explicaciones educativas
function generarExplicacionQuery(query, options) {
  let explicaciones = [];
  
  // Explicar filtros
  Object.keys(query).forEach(campo => {
    const valor = query[campo];
    
    if (typeof valor === 'string') {
      explicaciones.push(`${campo} es exactamente "${valor}" (operador implícito $eq)`);
    } else if (typeof valor === 'object') {
      Object.keys(valor).forEach(operador => {
        switch (operador) {
          case '$regex':
            explicaciones.push(`${campo} contiene "${valor[operador]}" (búsqueda de texto con $regex)`);
            break;
          case '$gte':
            explicaciones.push(`${campo} mayor o igual a ${valor[operador]} (operador $gte)`);
            break;
          case '$lte':
            explicaciones.push(`${campo} menor o igual a ${valor[operador]} (operador $lte)`);
            break;
          case '$lt':
            explicaciones.push(`${campo} menor que ${valor[operador]} (operador $lt)`);
            break;
          case '$gt':
            explicaciones.push(`${campo} mayor que ${valor[operador]} (operador $gt)`);
            break;
          case '$eq':
            explicaciones.push(`${campo} es exactamente ${valor[operador]} (operador $eq)`);
            break;
        }
      });
    }
  });
  
  // Explicar opciones
  if (options.sort) {
    const sortField = Object.keys(options.sort)[0];
    const sortOrder = options.sort[sortField] === 1 ? 'ascendente' : 'descendente';
    explicaciones.push(`Resultados ordenados por ${sortField} en orden ${sortOrder}`);
  }
  
  if (options.limit) {
    explicaciones.push(`Limitado a ${options.limit} resultados máximo`);
  }
  
  return explicaciones.length > 0 ? explicaciones : ['Consulta sin filtros - obtiene todos los documentos'];
}

module.exports = exports;