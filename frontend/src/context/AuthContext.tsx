import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api, type User } from "../services/api";

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    full_name: string;
    role?: string;
  }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });

    console.log("LOGIN RESPONSE:", res);

    localStorage.setItem("token", res.accessToken);

    localStorage.setItem(
      "user",
      JSON.stringify(
        res.user || {
          email,
          role: "residente",
        },
      ),
    );

    setToken(res.accessToken);

    setUser(
      res.user ||
        ({
          email,
          role: "residente",
        } as User),
    );
  };

  const register = async (data: {
    email: string;
    password: string;
    full_name: string;
    role?: string;
  }) => {
    await api.register(data);
    await login(data.email, data.password);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  const isAuthenticated = !!token && !!user;
  const hasRole = (role: string) => user?.role === role;
  const hasAnyRole = (roles: string[]) => roles.includes(user?.role || "");

  // Durante la carga inicial renderizamos los hijos directamente.
  // Los componentes hijos manejan sus propios estados de carga,
  // así que nunca se ve pantalla en blanco.
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated,
        hasRole,
        hasAnyRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
