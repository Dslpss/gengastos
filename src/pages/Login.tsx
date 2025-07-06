import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [hasEmailError, setHasEmailError] = useState(false);
  const { setUser } = useAuthStore();

  useEffect(() => {
    // Componente carregado
  }, []);

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
          navigate("/");
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
          navigate("/");
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);

      // Tratamento específico para erro de confirmação de email
      if (error.message && error.message.includes("Email not confirmed")) {
        console.log("🚨 ERRO DE CONFIRMAÇÃO DE EMAIL DETECTADO!");
        setHasEmailError(true);

        // Mostrar instruções específicas para conta antiga
        toast.error(
          "Esta conta foi criada antes da configuração. Crie uma nova conta com email diferente.",
          { duration: 8000 }
        );

        console.log("💡 SOLUÇÃO: Crie uma nova conta com email diferente");
        console.log(
          "Exemplos: demo@teste.com, usuario@exemplo.com, teste@gengastos.com"
        );

        // Configuração verificada
        console.log("Verificando configuração atual...");

        return;
      }

      // Outros erros
      setHasEmailError(false);
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

        {/* Mensagem de boas-vindas */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="text-center">
            <h3 className="text-sm font-medium text-blue-800">
              💰 Bem-vindo ao GenGastos
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Seu sistema de controle financeiro pessoal está pronto para uso!
            </p>
          </div>
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

          {/* Botão de ajuda para erro de email */}
          {hasEmailError && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-yellow-800">
                    🔍 Conta Antiga Detectada
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Esta conta foi criada antes da configuração. Use uma conta
                    nova com email diferente.
                  </p>
                  <div className="mt-3 space-y-2">
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className="w-full flex justify-center py-2 px-4 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      ✨ Criar Nova Conta
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        toast.success(
                          "Tente criar uma nova conta com email diferente"
                        );
                        setHasEmailError(false);
                      }}
                      className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      � Criar Nova Conta
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
