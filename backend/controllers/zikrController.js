import Zikr from "../models/Zikr.js";
import Group from "../models/Group.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Sauvegarder une session de zikr
export const saveZikr = async (req, res) => {
  try {
    const { groupId, userId, userName, count, mode, target } = req.body;

    console.log("🕌 Sauvegarde zikr:", { groupId, userId, count });

    // Créer l'enregistrement zikr
    const zikr = await Zikr.create({
      groupId,
      userId,
      userName,
      zikrType: "Allahou Akbar",
      count,
      mode,
      target,
      duration: 0
    });

    // Mettre à jour le score dans le groupe
    const group = await Group.findById(groupId);
    if (group) {
      const memberIndex = group.members.findIndex(m => 
        m.userId.toString() === userId
      );
      
      if (memberIndex !== -1) {
        group.members[memberIndex].score += count;
        await group.save();
        console.log("✅ Score mis à jour dans le groupe");
      }
    }

    // Mettre à jour le score global de l'utilisateur
    await User.findByIdAndUpdate(userId, {
      $inc: { score: count }
    });

    console.log("✅ Zikr sauvegardé avec succès");

    res.status(201).json({
      message: "Zikr sauvegardé avec succès",
      zikr
    });

  } catch (error) {
    console.error("❌ Erreur sauvegarde zikr:", error);
    res.status(500).json({ message: "Erreur serveur lors de la sauvegarde" });
  }
};

// Récupérer l'historique des zikr d'un groupe
export const getGroupZikrHistory = async (req, res) => {
  try {
    const { groupId } = req.params;

    const zikrHistory = await Zikr.find({ groupId })
      .sort({ date: -1 })
      .limit(50);

    res.json(zikrHistory);

  } catch (error) {
    console.error("❌ Erreur récupération historique:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer les statistiques d'un groupe
export const getGroupStats = async (req, res) => {
  try {
    const { groupId } = req.params;

    const stats = await Zikr.aggregate([
      { $match: { groupId: new mongoose.Types.ObjectId(groupId) } },
      {
        $group: {
          _id: "$userId",
          totalCount: { $sum: "$count" },
          sessions: { $sum: 1 },
          userName: { $first: "$userName" }
        }
      },
      { $sort: { totalCount: -1 } }
    ]);

    res.json(stats);

  } catch (error) {
    console.error("❌ Erreur récupération stats:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};