// Application utilisant le framework Express
// utilise mongoose pour la gestion de la base de données MongoDB
const express = require("express"); // importation d'Express
const dotenv = require("dotenv").config(); // importation de dotenv
const helmet = require('helmet'); // importation de Helmet - sécurisation des entêtes HTTP
const xss = require('xss-clean'); // importation de XSS Clean contre les attaques XSS
const mongoose = require("mongoose"); // importation de Mongoose
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
const mongoSanitize = require('express-mongo-sanitize'); // importation de mongo-express-sanitize - prévention des injections SQL
const toobusy = require('toobusy-js'); // importation de toobusy-js : prévention des attaques DoS (Denial of Service)
// importation de morgan et fs pour la génération et l'écriture des logs
const morgan = require('morgan');
const fs = require('fs');
// importation de express-session - stocke les données de session sur le serveur
// en production, il faut des configurations supplémentaires
const session = require('express-session');
// importation de path pour accéder au path de notre serveur
const path = require('path');

// Routeurs pour les "sauces" et les "utilisateurs"
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

const app = express(); // notre application

// too busy - prévention de DoS
app.use(function(req, res, next) {
  if (toobusy()) {
      res.status(503, "Le serveur est surchargé");
  } else {
  next();
  }
});

// Connexion à la base de données MongoDB
// Les mots de passes et login sont pour la phase de production ;)
mongoose
  .connect(
    process.env.BDD_PATH,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

  // headers pour éviter les erreurs CORS - appliqué à toutes les routes
  // nous souhaitons que nos deux serveurs puissent communiquer
  // Cross Origin Resource sharing
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    next(); // passe l'exécution au middleware suivant
  });
  
  // transforme le corps de la requête en objet JSON
  app.use(express.json());

  // Log de toutes les requêtes
  const accessLogs = fs.createWriteStream(path.join(__dirname, 'requetes.log'), { flags: 'a'});
  app.use(morgan('combined', { stream: accessLogs}));

  // Stockage de manière persistante du JSON Web token durant 15 minutes
  app.use(session({ secret: process.env.COOKIE_KEY_SECRET, resave: false, saveUninitialized: true, cookie: { maxAge: 900000}}));

  // Nettoyage des entrées utilisateurs
  app.use(mongoSanitize());

  // Sécurisation des entêtes
  app.use(helmet());

  // Prévention des attaques XSS
  app.use(xss());
  
  // répond aux requêtes à /images en rendant notre dossier images statique 
  app.use('/images', express.static(path.join(__dirname, 'images')));

  // routes de base du chemin des routeurs
  app.use('/api/sauces', sauceRoutes); 
  app.use('/api/auth', userRoutes);


// exportation de l'application pour pouvoir y accéder depuis
// d'autres fichiers notamment le serveur node
module.exports = app;
