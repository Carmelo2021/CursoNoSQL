# MongoDB Learning App - Proyecto Educativo para Secundaria

## 📚 Descripción

Esta aplicación educativa está diseñada para enseñar MongoDB de forma práctica a estudiantes de secundaria, demostrando dos conceptos fundamentales:

1. **Consultas Geoespaciales**: Usando GeoJSON y operadores de proximidad
2. **Filtros y Operadores**: Aplicando filtros complejos en un catálogo de productos

## 🏗️ Estructura del Proyecto

```
NodeparacursoNoSQL/
├── index.js                    # Servidor principal
├── package.json                # Dependencias y scripts
├── .env                        # Variables de entorno
├── inventario.json             # Datos de productos para cargar
├── cargar-inventario.js        # Script para cargar datos
├── config/
│   └── connection.js           # Conexión a MongoDB
├── models/
│   ├── User.js                 # Modelo de usuarios (geoespacial)
│   └── Product.js             # Modelo de productos (filtros)
├── controller/
│   ├── usuarios.controller.js  # Controlador de usuarios
│   └── productos.controller.js # Controlador de productos (educativo)
├── routes/
│   ├── usuarios.routes.js      # Rutas de usuarios y mapa
│   └── productos.routes.js     # Rutas de productos y filtros
└── views/
    ├── home.ejs               # Página de inicio
    ├── mapa.ejs               # Mapa interactivo con usuarios
    └── catalogo.ejs           # Catálogo con filtros educativos
```

## 🚀 Instalación y Configuración

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
Asegúrate de que el archivo `.env` contenga:
```
MONGODB_URI=tu_cadena_de_conexion_mongodb
PORT=4000
```

### 3. Cargar Datos de Ejemplo
```bash
npm run cargar-inventario
```
Este comando carga 35 productos de ejemplo desde `inventario.json` a MongoDB.

### 4. Iniciar la Aplicación
```bash
# Modo desarrollo (con reinicio automático)
npm run dev

# Modo producción
npm start
```

## 📖 Módulos Educativos

### Módulo 1: Consultas Geoespaciales
**Acceso**: `/mapa`

#### Conceptos que se enseñan:
- **Índices 2dsphere**: Para consultas geoespaciales eficientes
- **Formato GeoJSON**: Estructura Point con coordenadas [longitud, latitud]
- **Operador $near**: Búsqueda por proximidad geográfica
- **Operador $maxDistance**: Limiting búsquedas por distancia

#### APIs Disponibles:
- `GET /mapa` - Visualizar usuarios en mapa de Medellín
- `GET /cercanos/:id?radio=5000` - Encontrar usuarios cercanos
- `GET /api/usuarios` - CRUD básico de usuarios

### Módulo 2: Filtros y Operadores
**Acceso**: `/catalogo`

#### Operadores que se demuestran:
- **Comparación**: `$eq`, `$ne`, `$gt`, `$lt`, `$gte`, `$lte`
- **Lógicos**: `$and`, `$or`
- **Búsqueda de texto**: `$regex` con opciones
- **Arrays**: `$in`, `$nin`
- **Ordenamiento**: `$sort`
- **Limitación**: `$limit`

#### APIs Educativas:
- `POST /api/productos/filtrar` - Aplicar filtros complejos
- `GET /api/productos/ejemplos-operadores` - Ejemplos de cada operador
- `GET /api/productos/categoria/:categoria` - Filtro por categoría
- `GET /api/productos/precios?min=1000&max=5000` - Rango de precios
- `GET /api/productos/estadisticas` - Agregaciones educativas

## 🎯 Funcionalidades Educativas Especiales

### 1. Visualización de Consultas en Tiempo Real
El catálogo muestra la consulta MongoDB generada cada vez que se aplican filtros:
```javascript
// Ejemplo de query generada
db.productos.find({
  "categoria": "Lácteos",
  "precio_unitario": { "$gte": 3000, "$lte": 8000 }
}).sort({ "precio_unitario": 1 })
```

### 2. Explicaciones Contextuales
Cada operador incluye explicaciones en español:
- `$gte`: "mayor o igual a"
- `$regex`: "búsqueda por texto"
- `$and`: "todas las condiciones deben cumplirse"

### 3. Logging Educativo
En la consola del servidor se muestran las consultas ejecutadas:
```
📚 CONSULTA EDUCATIVA: Obteniendo productos por categoría
🔍 MongoDB Query ejecutada: { categoria: "Bebidas", precio_unitario: { $lte: 6000 } }
```

## 📊 Datos de Ejemplo

### Usuarios (Geoespaciales)
- Usuarios ubicados en Medellín, Colombia
- Coordenadas en formato GeoJSON Point
- Índice 2dsphere para consultas de proximidad

### Productos (35 productos en 17 categorías)
```json
{
  "_id": "uuid",
  "producto": "Arroz Diana 1Kg",
  "categoria": "Granos",
  "precio_unitario": 3200,
  "stock_actual": 114
}
```

#### Categorías disponibles:
- Granos, Aceites, Lácteos, Huevos, Panadería
- Cafés, Endulzantes, Dulces, Enlatados, Condimentos  
- Pasta, Salsas, Harinas, Bebidas, Aseo, Frutas, Verduras

## 🔧 APIs para Testing

### Consultas de Ejemplo
```bash
# Productos por categoría
curl "http://localhost:4000/api/productos/categoria/Lácteos"

# Búsqueda por texto
curl "http://localhost:4000/api/productos/buscar/Arroz"

# Rango de precios
curl "http://localhost:4000/api/productos/precios?min=3000&max=6000"

# Filtros complejos
curl -X POST "http://localhost:4000/api/productos/filtrar" \
  -H "Content-Type: application/json" \
  -d '{
    "query": {
      "categoria": "Bebidas",
      "precio_unitario": { "$lte": 5000 }
    },
    "options": {
      "sort": { "precio_unitario": 1 },
      "limit": 5
    }
  }'
```

## 📈 Casos de Uso Educativo

### Para Profesores:
1. Mostrar diferencias entre SQL y NoSQL
2. Explicar índices y performance
3. Demostrar consultas geoespaciales
4. Enseñar agregaciones MongoDB

### Para Estudiantes:
1. Experimentar con filtros en tiempo real
2. Ver consultas MongoDB generadas
3. Entender operadores lógicos
4. Practicar con datos reales

## 🛠️ Personalización

### Agregar Nuevos Productos
1. Editar `inventario.json`
2. Ejecutar `npm run cargar-inventario`

### Agregar Nuevos Filtros
1. Modificar `views/catalogo.ejs` (frontend)
2. Actualizar `controller/productos.controller.js` (backend)

### Cambiar Ubicación Geográfica
1. Modificar coordenadas en `routes/usuarios.routes.js`
2. Actualizar centro del mapa en `views/mapa.ejs`

## 🐛 Troubleshooting

### Error de Conexión a MongoDB
```
Error de conexión: MongoNetworkError
```
**Solución**: Verificar `MONGODB_URI` en `.env`

### No se cargan productos
```
No se encontraron productos
```
**Solución**: Ejecutar `npm run cargar-inventario`

### Puerto en uso
```
Error: listen EADDRINUSE :::4000
```
**Solución**: Cambiar `PORT` en `.env` o cerrar proceso existente

## 📝 Notas Técnicas

- **Motor de Base de Datos**: MongoDB con Mongoose ODM
- **Frontend**: EJS + Bootstrap 5 + Leaflet
- **Backend**: Node.js + Express
- **Índices**: 2dsphere para geoespacial, text para búsqueda
- **Logging**: Console educativo para debug

## 🎓 Objetivos de Aprendizaje

Al completar este módulo, los estudiantes comprenderán:
- ✅ Diferencias entre bases de datos relacionales y NoSQL
- ✅ Uso práctico de operadores MongoDB
- ✅ Consultas geoespaciales con GeoJSON
- ✅ Agregaciones y pipeline de transformación
- ✅ Índices y optimización de consultas

---

**Versión**: 2.0 (Módulos Geoespacial + Filtros)  
**Dirigido a**: Estudiantes de secundaria  
**Tiempo estimado**: 4-6 horas de práctica