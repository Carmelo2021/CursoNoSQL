const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)  //keep this line
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Error de conexión:', err));

module.exports = mongoose;