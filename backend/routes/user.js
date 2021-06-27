const express = require('express');
// routeur nécessaire (optimisation des fichiers du backend)
const router = express.Router();
// controlleur pour associer les fonctions aux différentes routes
const userCtrl = require('../controlers/user');

// importation de express-bouncer - force brute
const bouncer = require("express-bouncer")(30000, 90000, 3);

//routes vers les controlleurs
router.post('/signup', bouncer.block, userCtrl.signup);
router.post('/login', bouncer.block, userCtrl.login);

// Clear all logged addresses
// (Usually never really used)
bouncer.addresses = { };

// exportation des routeurs
module.exports = router;