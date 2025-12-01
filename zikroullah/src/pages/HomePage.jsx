import { useState, useEffect } from "react";
import Button from "../components/Button";
import Header from "../components/Header";
import Input from "../components/Input";
import { API_URL } from "../config";

export default function HomePage({ user, groups, setGroups, setCurrentGroup, setPage, setUser, refreshGroups }) {
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [showInvitations, setShowInvitations] = useState(false);

  // Fetch des invitations
  const fetchInvitations = async () => {
    if (!user?.id) return;
    
    try {
      console.log(`🔔 Fetch des invitations pour user ${user.id}...`);
      
      const response = await fetch(`${API_URL}/groups/invitations/${user.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ Invitations reçues:", data);
      
      setInvitations(data);
      
    } catch (error) {
      console.error("❌ Erreur fetch invitations:", error);
    }
  };

  // Fetch des groupes
  const fetchGroupsData = async () => {
    if (!user?.id) return;
    
    try {
      setIsRefreshing(true);
      console.log(`🔄 Fetch des groupes pour user ${user.id}...`);
      
      const response = await fetch(`${API_URL}/groups/user/${user.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const freshData = await response.json();
      
      // Filtrer pour ne garder que les groupes où l'utilisateur est actif
      const activeGroups = freshData.filter(group => {
        const member = group.members.find(m => m.userId === user.id);
        return member && member.status === 'active';
      });
      
      console.log("✅ Groupes actifs:", activeGroups);
      setGroups(activeGroups);
      
    } catch (error) {
      console.error("❌ Erreur fetch groupes:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh groupes et invitations
  useEffect(() => {
    console.log("🔄 Démarrage auto-refresh pour HomePage");
    
    fetchGroupsData();
    fetchInvitations();
    
    const interval = setInterval(() => {
      console.log("⏰ Auto-refresh déclenché");
      fetchGroupsData();
      fetchInvitations();
    }, 2000);

    return () => {
      console.log("🛑 Arrêt auto-refresh");
      clearInterval(interval);
    };
  }, [user.id]);

  // Accepter une invitation
  const handleAcceptInvitation = async (groupId) => {
    try {
      console.log(`✅ Acceptation invitation groupe ${groupId}`);
      
      const response = await fetch(`${API_URL}/groups/invitations/${groupId}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'acceptation");
      }

      alert("Vous avez rejoint le groupe avec succès !");
      
      // Rafraîchir les données
      await fetchInvitations();
      await fetchGroupsData();
      
    } catch (error) {
      console.error("❌ Erreur acceptation:", error);
      alert(error.message || "Erreur lors de l'acceptation de l'invitation");
    }
  };

  // Refuser une invitation
  const handleDeclineInvitation = async (groupId) => {
    if (!window.confirm("Voulez-vous vraiment refuser cette invitation ?")) return;
    
    try {
      console.log(`❌ Refus invitation groupe ${groupId}`);
      
      const response = await fetch(`${API_URL}/groups/invitations/${groupId}/decline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors du refus");
      }

      alert("Invitation refusée");
      
      // Rafraîchir les invitations
      await fetchInvitations();
      
    } catch (error) {
      console.error("❌ Erreur refus:", error);
      alert(error.message || "Erreur lors du refus de l'invitation");
    }
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) return alert("Veuillez entrer un code !");
    
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/groups/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: joinCode.trim(),
          userId: user.id,
          userName: `${user.prenom} ${user.nom}`,
          userPhone: user.phone
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      console.log("🔄 Rafraîchissement des groupes après jonction...");
      await fetchGroupsData();
      
      alert("Groupe rejoint avec succès !");
      setJoinCode("");
      
      if (data.group) {
        setCurrentGroup(data.group);
        setPage("groupe");
      }
      
    } catch (error) {
      alert(error.message || "Erreur lors de la jonction au groupe");
    } finally {
      setLoading(false);
    }
  };

  const handleAccessGroup = (group) => {
    setCurrentGroup(group);
    setPage("groupe");
  };

  const handleLogout = () => {
    if (window.confirm("Voulez-vous vous déconnecter ?")) {
      setUser(null);
      setPage("auth");
    }
  };

  const handleManualRefresh = async () => {
    console.log("🔄 Refresh manuel");
    await fetchGroupsData();
    await fetchInvitations();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      
      {/* Header avec bouton de déconnexion */}
      <div className="flex justify-between items-center px-4 md:px-6 py-4 bg-white border-b flex-shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Bienvenue, {user.prenom}
          </h1>
          <p className="text-sm text-gray-500">{user.phone}</p>
        </div>
        <button 
          onClick={handleLogout}
          style={{ backgroundColor: '#dc2626' }}
          className="text-white hover:opacity-90 py-2 px-3 md:px-4 rounded-lg font-semibold transition-opacity text-sm md:text-base"
        >
          Déconnexion
        </button>
      </div>

      {/* Contenu principal scrollable */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
        
        {/* 🆕 Section Invitations */}
        {invitations.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowInvitations(!showInvitations)}
              className="w-full bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 rounded-xl p-4 flex justify-between items-center transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔔</span>
                <div className="text-left">
                  <h2 className="text-base md:text-lg font-bold text-orange-800">
                    Invitations en attente
                  </h2>
                  <p className="text-sm text-orange-600">
                    {invitations.length} invitation{invitations.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <span 
                className="text-2xl transition-transform duration-300 text-orange-600" 
                style={{ transform: showInvitations ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                ▼
              </span>
            </button>
            
            <div 
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ 
                maxHeight: showInvitations ? '600px' : '0',
                opacity: showInvitations ? '1' : '0'
              }}
            >
              <div className="mt-3 space-y-3">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.groupId}
                    className="bg-white rounded-xl shadow-md border-2 border-orange-200 p-4"
                  >
                    <div className="mb-3">
                      <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                        🎯 {invitation.groupName}
                      </h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>👥 {invitation.membersCount} membre{invitation.membersCount > 1 ? 's' : ''}</p>
                        <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded inline-block">
                          🔑 {invitation.groupKey}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAcceptInvitation(invitation.groupId)}
                        style={{ backgroundColor: '#16a34a' }}
                        className="text-white hover:opacity-90 py-2 rounded-lg font-semibold transition-opacity text-sm"
                      >
                        ✓ Accepter
                      </button>
                      <button
                        onClick={() => handleDeclineInvitation(invitation.groupId)}
                        style={{ backgroundColor: '#dc2626' }}
                        className="text-white hover:opacity-90 py-2 rounded-lg font-semibold transition-opacity text-sm"
                      >
                        ✗ Refuser
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setPage("createGroup")}
            style={{ backgroundColor: '#16a34a' }}
            className="text-white hover:opacity-90 py-4 rounded-xl font-semibold transition-opacity text-base md:text-lg shadow-md"
          >
            ➕ Créer un nouveau groupe
          </button>

          <div className="bg-white rounded-xl shadow-md border p-4">
            <Input
              placeholder="Code du groupe (ex: A1B2C3D4)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="mb-2 text-center font-mono"
            />
            <button 
              onClick={handleJoinGroup}
              disabled={loading}
              style={{ backgroundColor: loading ? '#93c5fd' : '#3b82f6' }}
              className="w-full text-white hover:opacity-90 py-2 rounded-lg font-semibold transition-opacity disabled:opacity-50"
            >
              {loading ? "⏳ Rejoindre..." : "🔗 Rejoindre un groupe"}
            </button>
          </div>
        </div>

        {/* Bouton actualiser */}
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

        {/* Liste des groupes */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg md:text-xl font-bold text-gray-800">
              📚 Mes Groupes ({groups.length})
            </h2>
          </div>

          {groups.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
              <p className="text-gray-500 mb-4">Vous n'avez rejoint aucun groupe</p>
              <p className="text-sm text-gray-400">
                Créez un groupe ou rejoignez-en un avec un code d'invitation
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {groups.map((group) => {
                const activeMembers = group.members?.filter(m => m.status === 'active') || [];
                const totalScore = activeMembers.reduce((acc, m) => acc + (m.score || 0), 0);
                const isAdmin = user.id === group.adminId;
                
                return (
                  <button
                    key={group._id || group.id}
                    onClick={() => handleAccessGroup(group)}
                    className="bg-white rounded-xl shadow-md border hover:shadow-lg hover:border-green-400 transition-all p-4 text-left"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-800 text-base md:text-lg flex-1 truncate">
                        {group.name}
                      </h3>
                      {isAdmin && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0">
                          Admin
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">👥 Membres</span>
                        <span className="font-semibold text-gray-800">
                          {activeMembers.length}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">📊 Score total</span>
                        <span className="font-semibold text-green-600">
                          {totalScore}
                        </span>
                      </div>

                      <div className="bg-gray-100 rounded-lg px-3 py-2 mt-3">
                        <p className="text-xs text-gray-600 text-center">
                          🔑 Clé : <span className="font-mono font-semibold">{group.key}</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <div className="text-center">
                        <span 
                          style={{ backgroundColor: '#16a34a' }}
                          className="inline-block text-white px-4 py-2 rounded-lg text-sm font-semibold"
                        >
                          Accéder au groupe →
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}