import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Building3D from "./components/Building3D";
import ApartmentPanel from "./components/ApartmentPanel";
import Maintenance from "./components/Maintenance";
import CommonAreas from "./components/CommonAreas";
import Users from "./components/Users";
import { api, type Building, type Apartment } from "./services/api";

function withAuth(Component: React.ComponentType<{}>, allowedRoles?: string[]) {
  return function Wrapper({}: {}) {
    const { isAuthenticated, hasAnyRole } = useAuth();
    const navigate = useNavigate();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (allowedRoles && !hasAnyRole(allowedRoles)) {
      navigate("/dashboard");
      return null;
    }
    return React.createElement(Component);
  };
}

const DashboardRoute = withAuth(DashboardPage);
const BuildingRoute = withAuth(BuildingPage);
const MaintenanceRoute = withAuth(MaintenancePage);
const CommonAreasRoute = withAuth(CommonAreasPage);
const UsersRoute = withAuth(Users, ["admin"]);
const AdminRoute = withAuth(AdminPage, ["admin"]);

function DashboardPage(): JSX.Element {
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
}

function BuildingPage(): JSX.Element {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedApt, setSelectedApt] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBuildings()
      .then((data) => {
        setBuildings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center text-slate-400">Cargando edificio...</div>;

  return (
    <Layout>
      <div className="h-full flex flex-col">
        <Building3D buildings={buildings} onApartmentSelect={setSelectedApt} />
        {selectedApt && <ApartmentPanel apartment={selectedApt} onClose={() => setSelectedApt(null)} />}
      </div>
    </Layout>
  );
}

function MaintenancePage(): JSX.Element {
  return (
    <Layout>
      <Maintenance />
    </Layout>
  );
}

function CommonAreasPage(): JSX.Element {
  return (
    <Layout>
      <CommonAreas />
    </Layout>
  );
}

function AdminPage(): JSX.Element {
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
}

export default function App(): JSX.Element {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardRoute />} />
          <Route path="/edificio" element={<BuildingRoute />} />
          <Route path="/mantenimientos" element={<MaintenanceRoute />} />
          <Route path="/areas-comunes" element={<CommonAreasRoute />} />
          <Route path="/usuarios" element={<UsersRoute />} />
          <Route path="/admin" element={<AdminRoute />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
