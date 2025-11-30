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
      alert(`✅ Zikr sauvegardé !\n\n${count} fois "Allahou Akbar"`);
      
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
      
      {/* ZONE HAUTE */}
      <div className="flex-1 overflow-y-auto pb-4 px-4">
        <Header title={`Zikr : ${group.name}`} />

        {/* Mode fixe uniquement */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <label className="block text-blue-800 font-semibold mb-2 text-center text-lg">
            🎯 Objectif à atteindre
          </label>
          <Input
            type="number"
            placeholder="Ex: 33, 100, 1000..."
            value={target}
            onChange={handleTargetChange}
            className="w-full text-center text-lg py-3"
            min="1"
          />
          {targetNumber > 0 && (
            <div className="mt-3 text-center">
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((count / targetNumber) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-blue-700 font-medium">
                Progression: {count} / {targetNumber} ({Math.round((count / targetNumber) * 100)}%)
              </p>
              {count >= targetNumber && targetNumber > 0 && (
                <p className="text-green-600 font-bold mt-1">🎉 Objectif atteint !</p>
              )}
            </div>
          )}
        </div>

        {/* Score */}
        <div className="text-center mb-6 bg-gray-50 rounded-2xl py-6 border">
          <p className="text-gray-600 text-lg mb-2">Votre score actuel</p>
          <p className="text-7xl font-bold text-green-700">{count}</p>
          <p className="text-gray-500 mt-2">fois </p>
        </div>

        {/* Boutons action */}
        <div className="space-y-3">
          <Button
            onClick={handleFinish}
            disabled={saving}
            className="w-full bg-red-600 hover:bg-red-700 text-lg py-4"
          >
            {saving ? "💾 Sauvegarde..." : "✅ Terminer et Sauvegarder"}
          </Button>

          {count > 0 && (
            <Button
              onClick={handleReset}
              className="w-full bg-gray-500 hover:bg-gray-600 text-lg py-3"
            >
              🔄 Réinitialiser
            </Button>
          )}

          <Button
            onClick={() => setPage("groupe")}
            className="w-full bg-gray-300 text-gray-800 hover:bg-gray-400 text-lg py-3"
          >
            ↩️ Retour au groupe
          </Button>
        </div>
      </div>

      {/* BOUTON +1 */}
      <div className="h-48 bg-green-600">
        <button
          onClick={handleIncrement}
          disabled={mode === "fixed" && count >= targetNumber && targetNumber > 0}
          className={`w-full h-full text-white text-8xl font-bold transition-colors ${
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