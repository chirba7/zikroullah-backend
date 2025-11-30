import { useState } from "react";
import Button from "../components/Button";
import Header from "../components/Header";
import Input from "../components/Input";
import { API_URL } from "../config";

export default function CreateGroupPage({ user, setPage, setGroups }) {
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
    }
    
    setPage("home");
  } catch (error) {
    alert(error.message || "Erreur lors de la création du groupe");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-6">
      <Header title="Créer un groupe" />

      <div className="flex flex-col gap-4">
        <Input
          placeholder="Nom du groupe"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        
        <Button 
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? "Création..." : "Créer le groupe"}
        </Button>
        
        <Button
          className="bg-gray-300 text-gray-800 hover:bg-gray-400"
          onClick={() => setPage("home")}
        >
          Annuler
        </Button>
      </div>
    </div>
  );
}