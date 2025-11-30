import { useState } from "react";
import Button from "../components/Button";
import Header from "../components/Header";
import Input from "../components/Input";
import { API_URL } from "../config";

export default function HomePage({ user, groups, setGroups, setCurrentGroup, setPage, setUser, refreshGroups }) {
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

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

      alert("Groupe rejoint avec succès !");
      
      // Recharger les groupes depuis la base
      if (refreshGroups) {
        await refreshGroups();
      }
      
      setJoinCode("");
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
              {loading ? "Rejoindre..." : "🔗 Rejoindre un groupe"}
            </button>
          </div>
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
                const totalScore = group.members?.reduce((acc, m) => acc + (m.score || 0), 0) || 0;
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
                          {group.members?.length || 0}
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