// importation de Mongoose
const mongoose = require('mongoose');

// importation de Mongoose Unique Validator
// gère l'unicité des emails dans notre cas
const uniqueValidator = require('mongoose-unique-validator');

// Schema utilisateur
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true}
})

// application du validateur au Schema avant d'en faire un modèle
userSchema.plugin(uniqueValidator);

// exportation du Schema sous forme de modèle
module.exports = mongoose.model('User', userSchema);