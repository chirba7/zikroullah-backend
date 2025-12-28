import { useState } from "react";
import Button from "../components/Button";
import Header from "../components/Header";
import Input from "../components/Input";
import { API_URL } from "../config";

export default function CreateGroupPage({ user, setPage, setGroups, refreshGroups }) {
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!groupName.trim()) {
      return alert("Veuillez entrer un nom de groupe !");
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/groups/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: groupName,
          creatorId: user.id,
          creatorName: `${user.prenom} ${user.nom}`,
          creatorPhone: user.phone
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      alert(`Groupe créé avec succès !\nClé d'invitation : ${data.group.key}`);
      
      // Recharger les groupes depuis la base
      if (refreshGroups) {
        await refreshGroups();
      } else if (setGroups) {
        // Fallback : fetch manuel si refreshGroups n'existe pas
        const groupsResponse = await fetch(`${API_URL}/groups/user/${user.id}`);
        const groupsData = await groupsResponse.json();
        setGroups(groupsData);
      }
      
      setPage("home");
    } catch (error) {
      alert(error.message || "Erreur lors de la création du groupe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      
      {/* En-tête avec bouton retour */}
      <div className="px-4 py-3 flex justify-between items-center border-b bg-white flex-shrink-0">
        <h1 className="text-lg md:text-xl font-bold text-gray-800">Créer un groupe</h1>
        <button
          onClick={() => setPage("home")}
          style={{ backgroundColor: '#f97316' }}
          className="text-white hover:opacity-90 px-3 md:px-4 py-2 rounded-lg font-medium transition-opacity text-sm md:text-base whitespace-nowrap"
        >
          ↩ Retour
        </button>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-md mx-auto">
          
          {/* Carte de création */}
          <div className="bg-white rounded-xl shadow-md border p-6 mb-4">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom du groupe
              </label>
              <Input
                placeholder="Ex: Famille, Amis, Travail..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full"
              />
            </div>

            <button
              onClick={handleCreate}
              disabled={loading || !groupName.trim()}
              style={{ backgroundColor: loading ? '#93c5fd' : '#16a34a' }}
              className="w-full text-white hover:opacity-90 py-3 rounded-lg font-semibold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              {loading ? "⏳ Création en cours..." : "✨ Créer le groupe"}
            </button>

            <button
              onClick={() => setPage("home")}
              className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300 py-3 rounded-lg font-semibold transition-colors"
            >
              Annuler
            </button>
          </div>

          {/* Informations */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <span>ℹ️</span> Information
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Une clé unique sera générée pour votre groupe</li>
              <li>• Partagez cette clé pour inviter des membres</li>
              <li>• Vous serez automatiquement l'administrateur</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}