import { Navigate, useNavigate } from "react-router-dom";
import { Building2, AlertCircle } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center text-white">
      <div className="text-center">
        <div className="text-6xl mb-4">🏢</div>
        <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Página no encontrada</h1>
        <p className="text-slate-400 mb-8">La página que buscas no existe.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Volver al Dashboard
        </button>
      </div>
    </div>
  );
}
