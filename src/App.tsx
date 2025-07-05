import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./stores/authStore";
import { supabase } from "./lib/supabase";
import { apiService } from "./lib/supabaseApi";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import Budgets from "./pages/Budgets";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import type { User } from "./types";

function App() {
  const { user, isLoading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // Verificar se há uma sessão ativa
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          // Converter o user do Supabase para nosso tipo User
          const userForStore: User = {
            id: session.user.id,
            email: session.user.email || "",
            created_at: session.user.created_at || new Date().toISOString(),
            updated_at: session.user.updated_at || new Date().toISOString(),
          };
          setUser(userForStore);

          // Criar categorias padrão se necessário
          try {
            await apiService.createDefaultCategories();
          } catch (error) {
            console.log(
              "Categorias padrão já existem ou erro ao criar:",
              error
            );
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Escutar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Converter o user do Supabase para nosso tipo User
        const userForStore: User = {
          id: session.user.id,
          email: session.user.email || "",
          created_at: session.user.created_at || new Date().toISOString(),
          updated_at: session.user.updated_at || new Date().toISOString(),
        };
        setUser(userForStore);

        // Criar categorias padrão se necessário
        try {
          await apiService.createDefaultCategories();
        } catch (error) {
          console.log("Categorias padrão já existem ou erro ao criar:", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
          }}
        />

        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />

          <Route
            path="/"
            element={
              user ? (
                <Layout>
                  <Dashboard />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/transactions"
            element={
              user ? (
                <Layout>
                  <Transactions />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/categories"
            element={
              user ? (
                <Layout>
                  <Categories />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/budgets"
            element={
              user ? (
                <Layout>
                  <Budgets />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/reports"
            element={
              user ? (
                <Layout>
                  <Reports />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/settings"
            element={
              user ? (
                <Layout>
                  <Settings />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
