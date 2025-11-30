import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { nom, prenom, phone, pin } = req.body;

    if (!nom || !prenom || !phone || !pin) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    // Vérifier si numéro déjà utilisé
    const exists = await User.findOne({ phone });
    if (exists) {
      return res.status(400).json({ message: "Ce numéro existe déjà." });
    }

    // Hasher le PIN avant de sauvegarder
    const hashedPin = await bcrypt.hash(pin, 10);

    const user = await User.create({ 
      nom, 
      prenom, 
      phone, 
      password: hashedPin  // Sauvegarder le PIN hashé
    });

    return res.json({
      message: "Inscription réussie",
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        phone: user.phone
      }
    });
  } catch (err) {
    console.log("Erreur inscription:", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { phone, pin } = req.body;

    // Trouver l'utilisateur par phone seulement
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé." });
    }

    // Comparer le PIN hashé
    const isPinValid = await bcrypt.compare(pin, user.password);
    
    if (!isPinValid) {
      return res.status(400).json({ message: "Code PIN incorrect." });
    }

    return res.json({
      message: "Connexion réussie",
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        phone: user.phone
      }
    });
  } catch (err) {
    console.log("Erreur connexion:", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
});

export default router;