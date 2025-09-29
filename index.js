
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const usuariosRouter = require('./routes/usuarios.routes');
const productosRouter = require('./routes/productos.routes');
const User = require('./models/User');
const Product = require('./models/Product');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para servir archivos estáticos (CSS, JS, imágenes)
app.use(express.static(path.join(__dirname, 'public')));



// API REST y páginas
app.use('/', usuariosRouter);
app.use('/', productosRouter);

// Ruta para buscar usuarios cercanos
app.get('/cercanos/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  const radio = parseInt(req.query.radio) || 5000;
  const cercanos = await User.find({
    _id: { $ne: user._id },
    location: {
      $near: {
        $geometry: user.location,
        $maxDistance: radio
      }
    }
  }).limit(20);
  res.json({users: cercanos});
 // res.json({ correos: cercanos.map(u => u.correo), users: cercanos });
});

// Ruta para enviar correo a un usuario

// Ruta para promocionar (enviar a varios)
// app.post('/promocionar', async (req, res) => {
//   const { correos, asunto, mensaje } = req.body;
//   //await transporter.sendMail({ to: correos.split(','), subject: asunto, text: mensaje });
//   res.redirect('/');
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
