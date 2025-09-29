const express = require('express');
const router = express.Router();
const usuariosController = require('../controller/usuarios.controller');

// Página de inicio con navegación
router.get('/', async (req, res) => {
  res.render('home');
});

// Página del mapa con usuarios de Medellín
router.get('/mapa', async (req, res) => {
  // Solo usuarios con coordenadas en Medellín (rango aproximado)
  const users = await require('../models/User').find({
    'location.coordinates.0': { $gte: -75.6, $lte: -75.54 },
    'location.coordinates.1': { $gte: 6.23, $lte: 6.29 }
  });
  res.render('mapa', { users });
});

// CRUD API
router.get('/api/usuarios', usuariosController.getAllUsers);
router.get('/api/usuarios/:id', usuariosController.getUserById);
router.post('/api/usuarios', usuariosController.createUser);
router.put('/api/usuarios/:id', usuariosController.updateUser);
router.delete('/api/usuarios/:id', usuariosController.deleteUser);

module.exports = router;
