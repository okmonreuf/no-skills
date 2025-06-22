import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/contexts/AppContext";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AdminPanel from "./pages/AdminPanel";
import ModeratorPanel from "./pages/ModeratorPanel";
import BanPage from "./pages/BanPage";
import MediaManager from "./pages/MediaManager";
import SearchMessages from "./pages/SearchMessages";
import Notifications from "./pages/Notifications";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Composant pour protéger les routes authentifiées
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useApp();
  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/connexion" replace />
  );
};

// Composant pour protéger les routes admin/modérateur
const ModeratorRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace />;
  }

  if (!user || !["moderator", "admin", "owner"].includes(user.role)) {
    return <Navigate to="/chat" replace />;
  }

  return <>{children}</>;
};

// Composant pour protéger les routes admin uniquement
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace />;
  }

  if (!user || !["admin", "owner"].includes(user.role)) {
    return <Navigate to="/chat" replace />;
  }

  return <>{children}</>;
};

// Composant pour rediriger les utilisateurs connectés
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useApp();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/chat" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Redirection de la racine */}
      <Route path="/" element={<Navigate to="/connexion" replace />} />

      {/* Routes publiques */}
      <Route
        path="/connexion"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/inscription"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Page de bannissement (accessible même si non connecté) */}
      <Route path="/banni" element={<BanPage />} />

      {/* Pages légales accessibles à tous */}
      <Route path="/cgu" element={<TermsOfService />} />
      <Route path="/confidentialite" element={<PrivacyPolicy />} />
      <Route path="/contact" element={<Contact />} />

      {/* Routes protégées pour utilisateurs connectés */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profil"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parametres"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fichiers"
        element={
          <ProtectedRoute>
            <MediaManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recherche"
        element={
          <ProtectedRoute>
            <SearchMessages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      {/* Routes protégées pour modérateurs et admins */}
      <Route
        path="/moderation"
        element={
          <ModeratorRoute>
            <ModeratorPanel />
          </ModeratorRoute>
        }
      />

      {/* Routes protégées pour admins uniquement */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        }
      />

      {/* Route de fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
