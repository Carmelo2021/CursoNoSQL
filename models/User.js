const mongoose = require('../config/connection');
const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
    },
    correo: {
        type: String,
        required: true,
    },
    location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true }
    }
});
userSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('User', userSchema);
