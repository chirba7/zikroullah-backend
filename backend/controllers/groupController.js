import Group from "../models/Group.js";
import { generateGroupKey } from "../utils/keyGenerator.js";

export const createGroup = async (req, res) => {
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
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const joinGroup = async (req, res) => {
  try {
    const { key, userId, userName, userPhone } = req.body;

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
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getUserGroups = async (req, res) => {
  try {
    const { userId } = req.params;

    const groups = await Group.find({
      "members.userId": userId
    });

    res.json(groups);
  } catch (error) {
    console.error("Erreur récupération groupes:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};