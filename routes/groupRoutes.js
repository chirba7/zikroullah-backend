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

// 🆕 Supprimer un membre du groupe (Admin uniquement)
router.delete("/:groupId/members/:userId", async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const { adminId } = req.body; // L'ID de l'admin qui fait la requête

    // Vérifier que le groupe existe
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Groupe non trouvé" });
    }

    // Vérifier que celui qui fait la requête est bien l'admin
    if (group.adminId.toString() !== adminId) {
      return res.status(403).json({ message: "Seul l'administrateur peut supprimer des membres" });
    }

    // Empêcher l'admin de se supprimer lui-même
    if (userId === adminId) {
      return res.status(400).json({ message: "L'administrateur ne peut pas se supprimer lui-même" });
    }

    // Vérifier que le membre existe dans le groupe
    const memberExists = group.members.some(member => 
      member.userId.toString() === userId
    );

    if (!memberExists) {
      return res.status(404).json({ message: "Membre non trouvé dans ce groupe" });
    }

    // Supprimer le membre
    group.members = group.members.filter(member => 
      member.userId.toString() !== userId
    );

    await group.save();

    res.json({
      message: "Membre supprimé avec succès",
      group: {
        id: group._id,
        name: group.name,
        key: group.key,
        adminId: group.adminId,
        members: group.members
      }
    });
  } catch (error) {
    console.error("Erreur suppression membre:", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression du membre" });
  }
});

// 🆕 Quitter un groupe (Membre non-admin uniquement)
router.post("/:groupId/leave", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    // Vérifier que le groupe existe
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Groupe non trouvé" });
    }

    // Empêcher l'admin de quitter le groupe
    if (group.adminId.toString() === userId) {
      return res.status(400).json({ 
        message: "L'administrateur ne peut pas quitter le groupe. Supprimez le groupe à la place." 
      });
    }

    // Vérifier que l'utilisateur est membre du groupe
    const isMember = group.members.some(member => 
      member.userId.toString() === userId
    );

    if (!isMember) {
      return res.status(404).json({ message: "Vous n'êtes pas membre de ce groupe" });
    }

    // Retirer l'utilisateur du groupe
    group.members = group.members.filter(member => 
      member.userId.toString() !== userId
    );

    await group.save();

    res.json({
      message: "Vous avez quitté le groupe avec succès",
      groupId: group._id
    });
  } catch (error) {
    console.error("Erreur quitter groupe:", error);
    res.status(500).json({ message: "Erreur serveur lors de la sortie du groupe" });
  }
});

// 🆕 Supprimer un groupe (Admin uniquement)
router.delete("/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { adminId } = req.body; // L'ID de l'admin qui fait la requête

    // Vérifier que le groupe existe
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Groupe non trouvé" });
    }

    // Vérifier que celui qui fait la requête est bien l'admin
    if (group.adminId.toString() !== adminId) {
      return res.status(403).json({ message: "Seul l'administrateur peut supprimer le groupe" });
    }

    // Supprimer le groupe
    await Group.findByIdAndDelete(groupId);

    res.json({
      message: "Groupe supprimé avec succès",
      groupId: groupId
    });
  } catch (error) {
    console.error("Erreur suppression groupe:", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression du groupe" });
  }
});

export default router;