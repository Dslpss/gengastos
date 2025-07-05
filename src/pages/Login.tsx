import { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { setUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Validar se as senhas coincidem
        if (password !== confirmPassword) {
          toast.error("As senhas não coincidem");
          setIsLoading(false);
          return;
        }

        // Validar senha mínima
        if (password.length < 6) {
          toast.error("A senha deve ter pelo menos 6 caracteres");
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          toast.success("Conta criada com sucesso! Verifique seu email.");
          // Converter o user do Supabase para nosso tipo User
          const userForStore = {
            id: data.user.id,
            email: data.user.email || "",
            created_at: data.user.created_at || new Date().toISOString(),
            updated_at: data.user.updated_at || new Date().toISOString(),
          };
          setUser(userForStore);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          toast.success("Login realizado com sucesso!");
          // Converter o user do Supabase para nosso tipo User
          const userForStore = {
            id: data.user.id,
            email: data.user.email || "",
            created_at: data.user.created_at || new Date().toISOString(),
            updated_at: data.user.updated_at || new Date().toISOString(),
          };
          setUser(userForStore);
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignUp ? "Criar conta" : "Fazer login"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            GenGastos - Controle Financeiro Pessoal
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="form-input"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="form-input"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {isSignUp && password && (
                <div className="mt-1 text-sm">
                  <p
                    className={
                      password.length >= 6 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {password.length >= 6 ? "✓" : "✗"} Mínimo de 6 caracteres
                  </p>
                </div>
              )}
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Confirmar Senha
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className={`form-input ${
                    confirmPassword && password !== confirmPassword
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : confirmPassword && password === confirmPassword
                      ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                      : ""
                  }`}
                  placeholder="Confirme sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    As senhas não coincidem
                  </p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="mt-1 text-sm text-green-600">
                    Senhas coincidem ✓
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isLoading ? (
                <LoadingSpinner size="small" />
              ) : isSignUp ? (
                "Criar conta"
              ) : (
                "Entrar"
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary-600 hover:text-primary-500"
            >
              {isSignUp
                ? "Já tem uma conta? Faça login"
                : "Não tem uma conta? Cadastre-se"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
