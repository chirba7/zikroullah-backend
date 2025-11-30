import { useState, useEffect } from "react";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import CreateGroupPage from "./pages/CreateGroupPage";
import GroupePage from "./pages/GroupePage";
import ZikrPage from "./pages/ZikrPage";
import { API_URL } from "./config";

function App() {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [page, setPage] = useState("auth");
  const [loading, setLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);



  // ⭐ NOUVEAU : Test de connexion API
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        console.log("🔗 Test connexion API...");
        const response = await fetch(API_URL.replace('/api', ''));
        const data = await response.json();
        console.log("✅ API Production connectée:", data);
        setApiConnected(true);
      } catch (error) {
        console.error("❌ Erreur connexion API:", error);
        setApiConnected(false);
      }
    };
    
    testApiConnection();
  }, []);

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    const savedUser = localStorage.getItem("zikroullah_user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setPage("home");
      } catch (error) {
        console.error("Erreur parsing user:", error);
        localStorage.removeItem("zikroullah_user");
      }
    }
  }, []);

  // Charger les groupes quand l'utilisateur change
  useEffect(() => {
    if (user && user.id) {
      fetchUserGroups(user.id);
    }
  }, [user]);

  const fetchUserGroups = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/groups/user/${userId}`);
      if (response.ok) {
        const userGroups = await response.json();
        setGroups(userGroups);
      }
    } catch (error) {
      console.error("Erreur chargement groupes:", error);
    } finally {
      setLoading(false);
    }
  };

// Dans le composant parent
const refreshGroups = async () => {
  if (!user) return;
  
  try {
    console.log("🔄 refreshGroups appelé - Rechargement depuis API...");
    
    const response = await fetch(`${API_URL}/groups/user/${user.id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const updatedGroups = await response.json();
    console.log("✅ Nouvelles données reçues:", updatedGroups);
    
    // IMPORTANT: Bien mettre à jour le state
    setGroups(updatedGroups);
    
  } catch (error) {
    console.error("❌ Erreur dans refreshGroups:", error);
  }
};

  // Sauvegarder l'utilisateur quand il change
  useEffect(() => {
    if (user) {
      localStorage.setItem("zikroullah_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("zikroullah_user");
      setGroups([]);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

   // ⭐ AJOUT : Message de statut API
  if (!apiConnected && page === "auth") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Connexion à l'API...
          </h1>
          <p className="text-gray-600 mb-4">
            Tentative de connexion à: {API_URL}
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  console.log("🔍 Page actuelle:", page);
  console.log("🔍 CurrentGroup:", currentGroup);
  console.log("🔍 User:", user);
  console.log("🔍 API Connected:", apiConnected);


  // Rendu conditionnel selon la page
  if (page === "auth") {
    return <AuthPage setUser={setUser} setPage={setPage} />;
  }

  if (page === "home") {
    return (
      <HomePage
        user={user}
        groups={groups}
        setGroups={setGroups}
        setCurrentGroup={setCurrentGroup}
        setPage={setPage}
        setUser={setUser}
      />
    );
  }

  if (page === "createGroup") {
    return (
      <CreateGroupPage
        user={user}
        setPage={setPage}
        setGroups={setGroups}
      />
    );
  }

  // ✅ CORRECTION : UNE SEULE CONDITION POUR "groupe"
  if (page === "groupe") {
    return (
      <GroupePage
        group={currentGroup}
        user={user}
        setPage={setPage}
        setGroups={setGroups}
        groups={groups}
        refreshGroups={refreshGroups}
      />
    );
  }

  // ✅ AJOUT : CONDITION POUR "zikr" QUI MANQUAIT
  if (page === "zikr") {
    return (
      <ZikrPage
        group={currentGroup}
        user={user}
        setPage={setPage}
        refreshGroups={refreshGroups}
      />
    );
  }

  // Page non trouvée
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Page non trouvée</h1>
        <p className="text-gray-600 mb-4">La page "{page}" n'existe pas</p>
        <button 
          onClick={() => setPage("home")}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}

export default App;