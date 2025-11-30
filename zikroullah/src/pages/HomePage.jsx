import { useState } from "react";
import Button from "../components/Button";
import Header from "../components/Header";
import Input from "../components/Input";
import { API_URL } from "../config";

export default function HomePage({ user, groups, setGroups, setCurrentGroup, setPage, setUser }) {
  const [showGroups, setShowGroups] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [friends] = useState([
    { id: 1, firstName: "Ali", lastName: "Diallo", phone: "770000001" },
    { id: 2, firstName: "Fatou", lastName: "Sow", phone: "770000002" },
  ]);

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
    <div className="p-6">
      {/* Header avec bouton de déconnexion */}
      <div className="flex justify-between items-center mb-6">
        <Header title={`Bienvenue, ${user.prenom} ${user.nom}`} />
        <button 
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
        >
          Déconnexion
        </button>
      </div>

      {/* Profil utilisateur */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Bloc groupes */}
        <div
          className="flex-1 p-4 bg-white rounded-xl shadow-sm border hover:shadow-md cursor-pointer transition"
          onClick={() => setShowGroups(!showGroups)}
        >
          <p className="font-bold text-gray-800 text-lg">Groupes Rejoints</p>
          <p className="text-green-600 font-semibold text-xl">{groups.length}</p>
          {showGroups && (
            <ul className="mt-2 text-gray-700 list-inside">
              {groups.map((g) => (
                <li key={g.id} className="flex justify-between items-center mb-1">
                  <span>{g.name}</span>
                  <Button
                    className="text-sm py-1 px-2"
                    onClick={() => handleAccessGroup(g)}
                  >
                    Accéder
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Bloc amis */}
        <div
          className="flex-1 p-4 bg-white rounded-xl shadow-sm border hover:shadow-md cursor-pointer transition"
          onClick={() => setShowFriends(!showFriends)}
        >
          <p className="font-bold text-gray-800 text-lg">Amis</p>
          <p className="text-green-600 font-semibold text-xl">{friends.length}</p>
          {showFriends && (
            <ul className="mt-2 text-gray-700 list-disc list-inside">
              {friends.map((f) => (
                <li key={f.id}>
                  {f.firstName} {f.lastName} - <span className="text-gray-500">{f.phone}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Créer un groupe */}
      <Button
        className="mb-6 w-full"
        onClick={() => setPage("createGroup")}
      >
        Créer un nouveau groupe
      </Button>

      {/* Rejoindre un groupe via clé */}
      <div className="flex flex-col gap-2">
        <Input
          placeholder="Entrer le code du groupe (ex: A1B2C3D4)"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
        />
        <Button 
          onClick={handleJoinGroup}
          disabled={loading}
        >
          {loading ? "Rejoindre..." : "Rejoindre un groupe"}
        </Button>
      </div>
    </div>
  );
}