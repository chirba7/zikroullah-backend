import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import Header from "../components/Header";
import { API_URL } from "../config";

export default function AuthPage({ setUser, setPage }) {
  const [tab, setTab] = useState("login");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // REGISTER
  const register = async () => {
    setError("");
    setLoading(true);

    try {
      const r = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, prenom, phone, pin }),
      });

      const data = await r.json();
      console.log("📝 Réponse register:", data);

      if (!r.ok) {
        setLoading(false);
        return setError(data.message);
      }

      // Redirection après inscription
      setUser(data.user);
      setPage("home");
      
    } catch (err) {
      setLoading(false);
      setError("Erreur de connexion au serveur.");
    }
  };

  // LOGIN
  const login = async () => {
    setError("");
    setLoading(true);

    try {
      const r = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, pin }),
      });

      const data = await r.json();
      console.log("🔑 Réponse login - Status:", r.status, "Data:", data);

      if (!r.ok) {
        setLoading(false);
        return setError(data.message || "Erreur inconnue");
      }

      // VÉRIFIEZ QUE L'UTILISATEUR EST BIEN LÀ
      if (!data.user) {
        console.log("❌ Aucun utilisateur dans la réponse");
        setLoading(false);
        return setError("Données utilisateur manquantes");
      }

      console.log("✅ Utilisateur à définir:", data.user);
      
      // Définir l'utilisateur d'abord
      setUser(data.user);
      
      // Puis rediriger
      console.log("🔄 Redirection vers home...");
      setPage("home");
      
    } catch (err) {
      setLoading(false);
      console.log("❌ Erreur fetch:", err);
      setError("Erreur de connexion au serveur.");
    }
  };

  const resetForm = () => {
    setNom("");
    setPrenom("");
    setPhone("");
    setPin("");
    setError("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-gradient-to-b from-green-50 to-gray-100">
      <div className="mb-6">
        <Header title="Zikroullah" />
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-100">
        {/* Tabs */}
        <div className="flex mb-6 border-b">
          {["login", "register"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                resetForm();
              }}
              className={`flex-1 pb-2 text-lg font-semibold transition ${
                tab === t
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-400"
              }`}
            >
              {t === "login" ? "Connexion" : "Inscription"}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Login */}
        {tab === "login" && (
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Numéro de téléphone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
            <Input
              placeholder="Code PIN"
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              disabled={loading}
            />
            <Button 
              onClick={login}
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </div>
        )}

        {/* Register */}
        {tab === "register" && (
          <div className="flex flex-col gap-4">
            <Input 
              placeholder="Nom" 
              value={nom} 
              onChange={(e) => setNom(e.target.value)}
              disabled={loading}
            />
            <Input 
              placeholder="Prénom" 
              value={prenom} 
              onChange={(e) => setPrenom(e.target.value)}
              disabled={loading}
            />
            <Input 
              placeholder="Numéro de téléphone" 
              type="tel" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
            <Input 
              placeholder="Code PIN" 
              type="password" 
              maxLength={6} 
              value={pin} 
              onChange={(e) => setPin(e.target.value)}
              disabled={loading}
            />
            <Button 
              onClick={register}
              disabled={loading}
            >
              {loading ? "Inscription..." : "S'inscrire"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}