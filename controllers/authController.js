import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    console.log("=== DÉBUT REGISTER ===");
    console.log("Body reçu:", req.body);
    
    const { nom, prenom, phone, pin } = req.body;

    // Vérifier que tous les champs sont présents
    if (!nom || !prenom || !phone || !pin) {
      console.log("Champs manquants:", { nom, prenom, phone, pin });
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    console.log("Données reçues à l'inscription:", { nom, prenom, phone, pin });

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      console.log("Numéro déjà utilisé:", phone);
      return res.status(400).json({ message: "Numéro déjà utilisé" });
    }

    // Hasher le PIN
    const hashedPin = await bcrypt.hash(pin, 10);
    console.log("PIN hashé créé");

    // Créer l'utilisateur
    const user = await User.create({
      nom,
      prenom,
      phone,
      password: hashedPin,
      score: 0
    });

    console.log("Utilisateur créé avec succès:", user._id);

    return res.status(201).json({ 
      message: "Inscription réussie",
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        phone: user.phone,
        score: user.score
      }
    });

  } catch (err) {
    console.error("ERREUR COMPLÈTE inscription:", err);
    console.error("Stack trace:", err.stack);
    res.status(500).json({ message: "Erreur serveur: " + err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { phone, pin } = req.body;

    console.log("🔐 Tentative de connexion:", { phone, pin });

    const user = await User.findOne({ phone });
    if (!user) {
      console.log("❌ Utilisateur non trouvé");
      return res.status(400).json({ message: "Utilisateur introuvable" });
    }

    const match = await bcrypt.compare(pin, user.password);
    if (!match) {
      console.log("❌ PIN incorrect");
      return res.status(400).json({ message: "Code PIN incorrect" });
    }

    console.log("✅ Connexion réussie pour:", user.prenom, user.nom);

    res.json({
      message: "Connexion réussie",
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        phone: user.phone,
        score: user.score
      }
    });
  } catch (err) {
    console.error("🔥 Erreur login:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};