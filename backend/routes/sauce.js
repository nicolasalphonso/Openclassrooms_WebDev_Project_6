const express = require('express');
// routeur nécessaire (optimisation des fichiers du backend)
const router = express.Router();

// importation du middleware d'authentification
const auth = require('../middleware/auth');
// importation du middleware de gestion des fichiers
const multer = require('../middleware/multer-config');

// les logiques métier sont dans le fichier controler sauce
const sauceCtrl = require('../controlers/sauce');
const { validate } = require('../models/User');

// les requêtes sont authentifiées (auth)
// route de récupération de l'ensemble des sauces
router.get('/', auth, sauceCtrl.getAllSauces);
//route de création d'une sauce
router.post('/', auth, multer, sauceCtrl.createSauce);
//route de récupération d'une sauce
// les ":" avant id signifie que cette partie de la route est dynamique
router.get('/:id', auth, sauceCtrl.getOneSauce);
// route de modification d'une sauce
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
// route de suppression d'une sauce
router.delete('/:id', auth, sauceCtrl.deleteSauce);
// route de gestion des likes
router.post('/:id/like', auth, sauceCtrl.likesManagement);

// on exporte le routeur
module.exports = router;