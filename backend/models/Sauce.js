const mongoose = require("mongoose"); //import de Mongoose

// Schéma d'une sauce
// champs dont le Schéma aura besoin
const sauceSchema = mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, min: 1, max: 10, required: true },
  likes: { type: Number, default:0, min: 0 },
  dislikes: { type: Number, default:0},
  usersLiked: { type: [String], default:[]},
  usersDisliked: { type: [String], default:[]},
});

// export du modèle grâce à la fonction model
module.exports = mongoose.model("Sauce", sauceSchema);
