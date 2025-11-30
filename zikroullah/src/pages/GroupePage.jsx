import { useState, useEffect } from "react";
import Button from "../components/Button";
import Header from "../components/Header";
import Input from "../components/Input";
import { API_URL } from "../config";

export default function GroupePage({ group, setPage, user, setGroups, groups, refreshGroups }) {
  const [newUserPhone, setNewUserPhone] = useState("");
  const [localGroup, setLocalGroup] = useState(group);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  
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
  }, [localGroup._id]);
  
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
      setShowAddMember(false);
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
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      
      {/* En-tête avec bouton retour orange en haut à droite */}
      <div className="px-4 py-3 flex justify-between items-center border-b bg-white flex-shrink-0">
        <h1 className="text-lg md:text-xl font-bold text-gray-800 truncate mr-2">{localGroup.name}</h1>
        <button
          onClick={() => setPage("home")}
          style={{ backgroundColor: '#f97316' }}
          className="text-white hover:opacity-90 px-3 md:px-4 py-2 rounded-lg font-medium transition-opacity text-sm md:text-base whitespace-nowrap"
        >
          ↩️ Retour
        </button>
      </div>

      {/* Contenu principal - scrollable uniquement */}
      <div className="flex-1 overflow-y-auto p-4">
        
        {/* Indicateur Admin compact */}
        {isAdmin && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded-lg mb-3 text-sm">
            ⭐ Administrateur
          </div>
        )}

        {/* Grille responsive 2 colonnes sur desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          
          {/* Clé du groupe */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 font-semibold text-center text-sm md:text-base">
              🔑 Clé : <span className="font-mono">{localGroup.key}</span>
            </p>
          </div>

          {/* Score total du groupe */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <p className="text-green-800 font-semibold text-sm md:text-base">
              📊 Score total : <span className="text-lg md:text-xl">{totalScore}</span>
            </p>
          </div>
        </div>

        {/* Bouton actualiser compact */}
        <div className="mb-3">
          <button
            onClick={handleManualRefresh}
            style={{ backgroundColor: '#3b82f6' }}
            className="w-full text-white hover:opacity-90 px-3 py-2 rounded-lg transition-opacity text-sm flex items-center justify-center gap-2"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Actualisation...
              </>
            ) : (
              "🔄 Actualiser"
            )}
          </button>
        </div>

        {/* Liste des membres - Accordéon */}
        <div className="mb-3">
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="w-full bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg p-3 flex justify-between items-center transition-colors"
          >
            <h2 className="text-base md:text-lg font-semibold">👥 Membres ({localGroup.members.length})</h2>
            <span 
              className="text-xl transition-transform duration-300" 
              style={{ transform: showMembers ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              ▼
            </span>
          </button>
          
          <div 
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{ 
              maxHeight: showMembers ? '400px' : '0',
              opacity: showMembers ? '1' : '0'
            }}
          >
            <div className="overflow-y-auto max-h-96 mt-2 space-y-2 pr-1">
              {localGroup.members.map((m) => (
                <div
                  key={m.userId || m.id}
                  className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold text-gray-800 text-sm md:text-base truncate">
                        {m.name || `${m.firstName} ${m.lastName}`}
                      </p>
                      {m.userId === localGroup.adminId && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                          Admin
                        </span>
                      )}
                      {m.userId === user.id && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                          Vous
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-xs md:text-sm">{m.phone}</p>
                    <div className="flex gap-3 mt-1 text-xs md:text-sm">
                      <p className="text-green-600 font-semibold">🎯 {m.score || 0}</p>
                      <p className="text-gray-500">
                        {totalScore > 0 ? Math.round(((m.score || 0) / totalScore) * 100) : 0}%
                      </p>
                    </div>
                  </div>

                  {isAdmin && m.userId !== user.id && (
                    <button
                      className="text-red-600 hover:text-red-800 font-bold text-sm bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg ml-2 flex-shrink-0"
                      onClick={() => handleRemoveUser(m.userId || m.id)}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section Admin - Ajout membre en accordéon */}
        {isAdmin && (
          <div className="mb-3">
            <button
              onClick={() => setShowAddMember(!showAddMember)}
              className="w-full bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg p-3 flex justify-between items-center transition-colors"
            >
              <h3 className="font-semibold text-base">➕ Ajouter un membre</h3>
              <span 
                className="text-xl transition-transform duration-300" 
                style={{ transform: showAddMember ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                ▼
              </span>
            </button>
            
            <div 
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ 
                maxHeight: showAddMember ? '200px' : '0',
                opacity: showAddMember ? '1' : '0'
              }}
            >
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <Input
                  placeholder="Numéro de téléphone"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  className="mb-2"
                />
                <button
                  onClick={handleAddUser}
                  style={{ backgroundColor: '#3b82f6' }}
                  className="w-full text-white hover:opacity-90 py-2 rounded-lg font-medium transition-opacity text-sm"
                >
                  Inviter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Actions principales - Grille responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <button
            onClick={() => setPage("zikr")}
            style={{ backgroundColor: '#16a34a' }}
            className="w-full text-white hover:opacity-90 py-3 rounded-lg font-semibold transition-opacity text-sm md:text-base"
          >
            🕌 Nouveau ZIKR
          </button>

          {isAdmin ? (
            <button
              style={{ backgroundColor: '#dc2626' }}
              className="w-full text-white hover:opacity-90 py-3 rounded-lg font-semibold transition-opacity text-sm md:text-base"
              onClick={handleDeleteGroup}
            >
              🗑️ Supprimer
            </button>
          ) : (
            <button
              style={{ backgroundColor: '#4b5563' }}
              className="w-full text-white hover:opacity-90 py-3 rounded-lg font-semibold transition-opacity text-sm md:text-base"
              onClick={handleLeaveGroup}
            >
              👋 Quitter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}