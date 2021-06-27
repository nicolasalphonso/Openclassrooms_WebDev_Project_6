// importation de dotenv
const dotenv = require("dotenv").config({ path: "../" });

// mportation de bcrypt
const bcrypt = require("bcrypt");

const { Hash } = require("crypto");

// importation de cryptojs -
const cryptojs = require("crypto-js");

// importation du modèle User
const User = require("../models/User");

// importation de JSONWebToken pour la gestion des tokens
const jwt = require("jsonwebtoken");

// importation de password-validator
const passwordValidator = require("password-validator");

// importation de email-validator
const validator = require("email-validator");

// enregistrement de nouveaux utilisateurs
exports.signup = (req, res, next) => {
  // Create a schema
  var schema = new passwordValidator();

  // Propriétés du mot de passe
  schema
    .is()
    .min(8) // Taille minimale 8
    .is()
    .max(12) // Taille maximale 12
    .has()
    .uppercase() // Contient au moins une majuscule
    .has()
    .lowercase() // Contient au moins une minuscule
    .has()
    .digits(2) // Doit contenir au moins 2 chiffres
    .has()
    .not()
    .spaces() // Ne doit pas contenir d'espace
    .has()
    .symbols(); // Doit contenir au moins un symbole

  const validationMDP = schema.validate(req.body.password);

  const validationEmail = validator.validate(req.body.email);

  if (validationMDP && validationEmail) {
    bcrypt
      .hash(req.body.password, 10) // on fait 10 tours de cryptage
      // enregistre l'utilisateur dans bdd avec mot de passe crypté
      .then((hash) => {
        const user = new User({
          // cryptage de l'email dans la bdd. Pas de salage pour pouvoir la récupérer
          // si besoin de faire un emailing par exemple.
          email: cryptojs
            .HmacSHA256(req.body.email, process.env.EMAIL_KEY_SECRET)
            .toString(),
          password: hash,
        });
        user
          .save()
          .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
          .catch((error) => res.status(400).json({ error }));
      })
      .catch((error) => res.status(500).json({ error }));
  } else {
    if (!validationEmail) {
      res.status(400).json({
        error:
          "L'adresse mail n'est pas valide",
      });
    } else {
      res.status(400).json({
        error:
          "Le mot de passe doit contenir au moins une minuscule, une majuscule, un caractère spécial, 2 chiffres. Il doit faire entre 8 et 12 caractères "
      });
    }
  }
};

// connexion des utilisateurs existants
exports.login = (req, res, next) => {
  // on crypte l'adresse email fournie pour la comparer ensuite à ce qui se trouve dans la bdd
  const adresseRequeteCryptee = cryptojs
    .HmacSHA256(req.body.email, process.env.EMAIL_KEY_SECRET)
    .toString();

  // on cherche dans bdd le user correspondant à l'adresse email
  User.findOne({ email: adresseRequeteCryptee })
    // on vérifie d'abord que l'utilisateur existe
    .then((user) => {
      if (!user) {
        // accès non autorisé : erreur 401
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      // on compare les hashs du mot de passe envoyé et celui de la bdd
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          // si le mot de passe est faux
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          // secret simple en production
          // token dure 24h
          // on encode userId pour appliquer à chaque objet pour éviter
          // qu'un autre utilisateur fasse des modifications
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              process.env.RANDOM_TOKEN_SECRET,
              { expiresIn: "24h" }
            ),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
