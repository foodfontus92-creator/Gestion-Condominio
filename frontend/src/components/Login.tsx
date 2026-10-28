import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User as UserIcon, AlertTriangle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("residente");

  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await register({
        email,
        password,
        full_name: fullName,
        role,
      });

      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar");
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-900 flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isRegister ? "Crear cuenta" : "Iniciar sesión"}
          </h2>

          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            {isRegister
              ? "¿Ya tienes cuenta? Inicia sesión"
              : "¿No tienes cuenta? Regístrate"}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        <form
          onSubmit={isRegister ? handleRegister : handleLogin}
          className="space-y-4"
        >
          {isRegister ? (
            <>
              <div className="flex items-center gap-3 pl-3 border-l-4 border-blue-500">
                <UserIcon size={20} className="text-blue-400" />
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pl-3 border-l-4 border-blue-500">
                <Mail size={20} className="text-blue-400" />
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pl-3 border-l-4 border-blue-500">
                <Lock size={20} className="text-blue-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Rol</label>

                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
                >
                  <option value="residente">Residente</option>
                  <option value="portero">Portero</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 pl-3 border-l-4 border-blue-500">
                <Mail size={20} className="text-blue-400" />
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pl-3 border-l-4 border-blue-500">
                <Lock size={20} className="text-blue-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
          >
            {isRegister ? "Registrarse" : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
