import { useState } from "react";
import Button from "../components/Button";
import Header from "../components/Header";
import Input from "../components/Input";
import { API_URL } from "../config";

export default function ZikrPage({ group, user, setPage, refreshGroups }) {
  const [mode, setMode] = useState("fixed");
  const [target, setTarget] = useState("");
  const [count, setCount] = useState(0);
  const [pressed, setPressed] = useState(false);
  const [saving, setSaving] = useState(false);

  console.log("🔍 ZikrPage rendu - Group:", group, "User:", user);

  // Gestion de l'input pour empêcher les 0 au début
  const handleTargetChange = (e) => {
    const value = e.target.value;
    
    // Si la valeur commence par 0, on la supprime
    if (value.startsWith('0') && value.length > 1) {
      setTarget(value.replace(/^0+/, ''));
    } else {
      setTarget(value);
    }
  };

  // Convertir en nombre pour les calculs
  const targetNumber = Number(target) || 0;

  // Vérification des props
  if (!group || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Erreur</h1>
          <p className="text-gray-600">Données manquantes</p>
          <Button onClick={() => setPage("home")} className="mt-4">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  const handleIncrement = () => {
    setPressed(true);
    setTimeout(() => setPressed(false), 150);

    if (mode === "fixed" && count >= targetNumber && targetNumber > 0) return;
    setCount(count + 1);
  };

  const handleFinish = async () => {
    if (count === 0) {
      return alert("Vous n'avez pas fait de Zikr !");
    }

    if (!window.confirm(`Voulez-vous terminer ce ZIKR ?\n\nScore: ${count} fois`)) return;

    setSaving(true);

    try {
      const requestBody = {
        groupId: group._id,
        userId: user.id,
        userName: `${user.prenom} ${user.nom}`,
        count: count,
        mode: mode,
        target: targetNumber,
        duration: 0
      };

      console.log("📤 Envoi Zikr:", requestBody);

      const response = await fetch(`${API_URL}/zikr/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Erreur serveur: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.message || `Erreur ${response.status}`);
      }

      // ✅ CRITIQUE : Rafraîchir AVANT d'afficher l'alerte
      console.log("🔄 Rafraîchissement des groupes...");
      if (refreshGroups) {
        await refreshGroups();
      }
      
      // Maintenant que les données sont rafraîchies, on peut afficher l'alerte
      alert(`✅ Zikr sauvegardé !\n\n${count} fois`);
      
      setCount(0);
      setTarget("");
      setPage("groupe"); // Retour à la page groupe avec données fraîches

    } catch (error) {
      console.error("❌ Erreur sauvegarde:", error);
      alert("Erreur lors de la sauvegarde: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (count > 0 && !window.confirm("Voulez-vous réinitialiser ?")) return;
    setCount(0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      
      {/* En-tête avec bouton retour en haut à droite */}
      <div className="px-4 py-3 flex justify-between items-center border-b">
        <h1 className="text-xl font-bold text-gray-800">Zikr : {group.name}</h1>
        <button
          onClick={() => setPage("groupe")}
          style={{ backgroundColor: '#f97316' }}
          className="text-white hover:opacity-90 px-4 py-2 rounded-lg font-medium transition-opacity"
        >
          ↩️ Retour
        </button>
      </div>

      {/* ZONE PRINCIPALE - Sans scroll */}
      <div className="flex-1 flex flex-col justify-between px-4 py-4">
        
        {/* Objectif */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <label className="block text-blue-800 font-semibold mb-2 text-center">
            🎯 Objectif à atteindre
          </label>
          <Input
            type="number"
            placeholder="Ex: 33, 100, 1000..."
            value={target}
            onChange={handleTargetChange}
            className="w-full text-center text-lg py-2"
            min="1"
          />
          {targetNumber > 0 && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((count / targetNumber) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-blue-700 font-medium mt-1 text-center">
                {count} / {targetNumber} ({Math.round((count / targetNumber) * 100)}%)
              </p>
              {count >= targetNumber && (
                <p className="text-green-600 font-bold text-center text-sm">🎉 Objectif atteint !</p>
              )}
            </div>
          )}
        </div>

        {/* Score */}
        <div className="text-center bg-gray-50 rounded-2xl py-6 border my-4">
          <p className="text-gray-600 text-sm mb-1">Votre score actuel</p>
          <p className="text-6xl font-bold text-green-700">{count}</p>
          <p className="text-gray-500 mt-1 text-sm">fois</p>
        </div>

        {/* Boutons action */}
        <div className="space-y-2 mb-4">
          <button
            onClick={handleFinish}
            disabled={saving}
            style={{ backgroundColor: saving ? '#93c5fd' : '#2563eb' }}
            className="w-full text-white text-base py-3 rounded-lg font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {saving ? "💾 Sauvegarde..." : "✅ Terminer et Sauvegarder"}
          </button>

          {count > 0 && (
            <button
              onClick={handleReset}
              style={{ backgroundColor: '#dc2626' }}
              className="w-full text-white text-base py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              🔄 Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* BOUTON +1 */}
      <div className="h-40">
        <button
          onClick={handleIncrement}
          disabled={mode === "fixed" && count >= targetNumber && targetNumber > 0}
          className={`w-full h-full text-white text-7xl font-bold transition-colors ${
            pressed ? "bg-green-700" : "bg-green-600"
          } ${
            mode === "fixed" && count >= targetNumber && targetNumber > 0 
              ? "opacity-50 cursor-not-allowed" 
              : "hover:bg-green-700"
          }`}
        >
          +1
        </button>
      </div>
    </div>
  );
}