import { useState, useEffect } from "react";
import Button from "../components/Button";
import Header from "../components/Header";
import Input from "../components/Input";
import { API_URL } from "../config";

export default function GroupePage({ group, setPage, user, setGroups, groups, refreshGroups }) {
  const [newUserPhone, setNewUserPhone] = useState("");
  const [localGroup, setLocalGroup] = useState(group);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  console.log("🔍 GroupePage rendu - Group ID:", localGroup?._id);
  console.log("🔍 Scores actuels:", localGroup?.members?.map(m => ({
    name: m.name, 
    score: m.score
  })));
  
  // ✅ SOLUTION : Fetch direct du groupe depuis le serveur
  const fetchGroupData = async () => {
    if (!localGroup?._id) return;
    
    try {
      setIsRefreshing(true);
      console.log(`🔄 Fetch du groupe ${localGroup._id}...`);
      
      const response = await fetch(`${API_URL}/groups/${localGroup._id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const freshData = await response.json();
      console.log("✅ Données fraîches reçues:", {
        groupId: freshData._id,
        totalScore: freshData.members.reduce((acc, m) => acc + (m.score || 0), 0),
        members: freshData.members.map(m => ({ name: m.name, score: m.score }))
      });
      
      setLocalGroup(freshData);
      
      // Mettre à jour aussi dans le state global
      const updatedGroups = groups.map(g => 
        g._id === freshData._id ? freshData : g
      );
      setGroups(updatedGroups);
      
    } catch (error) {
      console.error("❌ Erreur fetch groupe:", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // ✅ Auto-refresh toutes les 2 secondes
  useEffect(() => {
    console.log("🔄 Démarrage auto-refresh pour groupe:", localGroup?._id);
    
    // Premier fetch immédiat
    fetchGroupData();
    
    // Puis toutes les 2 secondes
    const interval = setInterval(() => {
      console.log("⏰ Auto-refresh déclenché");
      fetchGroupData();
    }, 2000);

    return () => {
      console.log("🛑 Arrêt auto-refresh");
      clearInterval(interval);
    };
  }, [localGroup._id]); // Re-démarrer si l'ID du groupe change
  
  // ✅ Mettre à jour quand la prop group change
  useEffect(() => {
    if (group && group._id !== localGroup._id) {
      console.log("🔄 Changement de groupe détecté");
      setLocalGroup(group);
    }
  }, [group]);

  const isAdmin = user.id === localGroup.adminId;

  // Refresh manuel
  const handleManualRefresh = async () => {
    console.log("🔄 Refresh manuel");
    await fetchGroupData();
  };

  // Ajouter un membre manuellement (admin seulement)
  const handleAddUser = async () => {
    if (!newUserPhone.trim()) return alert("Veuillez entrer un numéro !");
    
    const exists = localGroup.members.find((m) => m.phone === newUserPhone);
    if (exists) return alert("Utilisateur déjà dans le groupe !");

    try {
      const newMember = {
        userId: Date.now(),
        name: "Utilisateur à inviter",
        phone: newUserPhone,
        score: 0,
      };
      
      const updatedMembers = [...localGroup.members, newMember];
      const updatedGroup = { ...localGroup, members: updatedMembers };
      
      setLocalGroup(updatedGroup);
      setGroups(groups.map(g => g._id === localGroup._id ? updatedGroup : g));
      setNewUserPhone("");
      alert("Utilisateur ajouté au groupe !");
      
      await fetchGroupData();
    } catch (error) {
      alert("Erreur lors de l'ajout de l'utilisateur");
    }
  };

  // Supprimer un membre (admin seulement)
  const handleRemoveUser = async (userId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur du groupe ?")) return;
    
    if (userId === user.id) {
      return alert("Vous ne pouvez pas vous supprimer vous-même du groupe !");
    }

    const updatedMembers = localGroup.members.filter((m) => m.userId !== userId);
    const updatedGroup = { ...localGroup, members: updatedMembers };
    
    setLocalGroup(updatedGroup);
    setGroups(groups.map(g => g._id === localGroup._id ? updatedGroup : g));
    alert("Utilisateur supprimé du groupe");
    
    await fetchGroupData();
  };

  // Supprimer le groupe (admin seulement)
  const handleDeleteGroup = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce groupe ?")) return;

    try {
      const response = await fetch(`${API_URL}/groups/${localGroup._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Groupe supprimé avec succès");
        
        if (refreshGroups) {
          await refreshGroups();
        }
        
        setPage("home");
      } else {
        throw new Error("Erreur lors de la suppression");
      }
    } catch (error) {
      alert("Erreur lors de la suppression du groupe");
    }
  };

  // Quitter le groupe (membre non-admin)
  const handleLeaveGroup = async () => {
    if (!window.confirm("Voulez-vous vraiment quitter ce groupe ?")) return;

    if (isAdmin) {
      return alert("En tant qu'admin, vous ne pouvez pas quitter le groupe. Vous devez d'abord le supprimer.");
    }

    try {
      const updatedGroups = groups.filter(g => g._id !== localGroup._id);
      setGroups(updatedGroups);
      
      alert("Vous avez quitté le groupe");
      setPage("home");
    } catch (error) {
      alert("Erreur lors de la sortie du groupe");
    }
  };

  // Calcul sécurisé du score total
  const totalScore = localGroup.members.reduce((acc, m) => acc + (m.score || 0), 0);

  return (
    <div className="p-6">
      <Header title={`${localGroup.name}`} />
      
      {/* Indicateur de refresh avec animation */}
      <div className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 mb-4 flex items-center justify-between">
        <p className="text-xs text-gray-600">
          {isRefreshing ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></span>
              Actualisation...
            </span>
          ) : (
            "🔄 Auto-actualisation activée (2s)"
          )}
        </p>
        <button
          onClick={handleManualRefresh}
          className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg"
          disabled={isRefreshing}
        >
          Actualiser
        </button>
      </div>
      
      {/* Indicateur Admin */}
      {isAdmin && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg mb-4">
          ⭐ Vous êtes l'administrateur de ce groupe
        </div>
      )}

      {/* Clé du groupe */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 font-semibold text-center">
          Clé d'invitation : <span className="font-mono text-lg">{localGroup.key}</span>
        </p>
      </div>

      {/* Score total du groupe */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-center">
        <p className="text-green-800 font-semibold text-2xl">
          📊 Score total du groupe : {totalScore}
        </p>
        <p className="text-green-600 text-sm mt-2">
          Cumul de tous les Zikr des membres
        </p>
      </div>

      {/* Liste des membres */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">👥 Membres ({localGroup.members.length})</h2>
        <div className="flex flex-col gap-3">
          {localGroup.members.map((m) => (
            <div
              key={m.userId || m.id}
              className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-800">
                    {m.name || `${m.firstName} ${m.lastName}`}
                  </p>
                  {m.userId === localGroup.adminId && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      Admin
                    </span>
                  )}
                  {m.userId === user.id && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      Vous
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm">{m.phone}</p>
                <p className="text-green-600 font-semibold mt-1">🎯 Score: {m.score || 0}</p>
                <p className="text-gray-500 text-xs mt-1">
                  Participation: {totalScore > 0 ? Math.round(((m.score || 0) / totalScore) * 100) : 0}%
                </p>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-2">
                {isAdmin && m.userId !== user.id && (
                  <button
                    className="text-red-600 hover:text-red-800 font-bold text-sm bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg"
                    onClick={() => handleRemoveUser(m.userId || m.id)}
                    title="Supprimer du groupe"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section Admin - Ajout manuel de membre */}
      {isAdmin && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-lg mb-3">➕ Ajouter un membre</h3>
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Numéro de téléphone"
              value={newUserPhone}
              onChange={(e) => setNewUserPhone(e.target.value)}
            />
            <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
              Inviter par numéro
            </Button>
          </div>
        </div>
      )}

      {/* Actions principales */}
      <div className="space-y-3">
        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
          onClick={() => setPage("zikr")}
        >
          🕌 Démarrer un nouveau ZIKR
        </Button>

        {/* Actions admin */}
        {isAdmin && (
          <button
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold text-lg"
            onClick={handleDeleteGroup}
          >
            🗑️ Supprimer le groupe
          </button>
        )}

        {/* Quitter le groupe (non-admin) */}
        {!isAdmin && (
          <button
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold text-lg"
            onClick={handleLeaveGroup}
          >
            👋 Quitter le groupe
          </button>
        )}

        <Button 
          onClick={() => setPage("home")}
          className="w-full bg-gray-300 text-gray-800 hover:bg-gray-400"
        >
          ↩️ Retour aux groupes
        </Button>
      </div>
    </div>
  );
}