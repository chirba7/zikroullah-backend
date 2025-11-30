import express from "express";
import Group from "../models/Group.js";
import { generateGroupKey } from "../utils/keyGenerator.js";

const router = express.Router();

// Créer groupe
router.post("/create", async (req, res) => {
  try {
    const { name, creatorId, creatorName, creatorPhone } = req.body;

    if (!name || !creatorId) {
      return res.status(400).json({ message: "Nom du groupe et créateur requis" });
    }

    const group = await Group.create({
      name,
      key: generateGroupKey(),
      adminId: creatorId,
      members: [{
        userId: creatorId,
        name: creatorName,
        phone: creatorPhone,
        score: 0
      }]
    });

    res.status(201).json({
      message: "Groupe créé avec succès",
      group: {
        id: group._id,
        name: group.name,
        key: group.key,
        adminId: group.adminId,
        members: group.members
      }
    });
  } catch (error) {
    console.error("Erreur création groupe:", error);
    
    if (error.code === 11000) {
      // Erreur de clé dupliquée (très rare avec generateGroupKey)
      return res.status(400).json({ message: "Erreur de génération de clé, veuillez réessayer" });
    }
    
    res.status(500).json({ message: "Erreur serveur lors de la création du groupe" });
  }
});

// Rejoindre groupe via clé
router.post("/join", async (req, res) => {
  try {
    const { key, userId, userName, userPhone } = req.body;

    if (!key || !userId) {
      return res.status(400).json({ message: "Clé et utilisateur requis" });
    }

    const group = await Group.findOne({ key });
    if (!group) {
      return res.status(404).json({ message: "Clé de groupe invalide" });
    }

    // Vérifier si l'utilisateur est déjà membre
    const isMember = group.members.some(member => 
      member.userId.toString() === userId
    );

    if (isMember) {
      return res.status(400).json({ message: "Vous êtes déjà membre de ce groupe" });
    }

    // Ajouter l'utilisateur au groupe
    group.members.push({
      userId,
      name: userName,
      phone: userPhone,
      score: 0
    });

    await group.save();

    res.json({
      message: "Groupe rejoint avec succès",
      group: {
        id: group._id,
        name: group.name,
        key: group.key,
        members: group.members
      }
    });
  } catch (error) {
    console.error("Erreur rejoindre groupe:", error);
    res.status(500).json({ message: "Erreur serveur lors de la jonction au groupe" });
  }
});

// Récupérer les groupes d'un utilisateur
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const groups = await Group.find({
      "members.userId": userId
    });

    res.json(groups);
  } catch (error) {
    console.error("Erreur récupération groupes:", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des groupes" });
  }
});

// Récupérer les détails d'un groupe
router.get("/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Groupe non trouvé" });
    }

    res.json(group);
  } catch (error) {
    console.error("Erreur récupération groupe:", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération du groupe" });
  }
});

export default router;