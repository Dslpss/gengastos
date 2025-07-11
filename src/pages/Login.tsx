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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-green-100 relative overflow-hidden">
      {/* SVG decorativo de moedas e gráfico no fundo - canto inferior direito */}
      <svg
        className="absolute right-0 bottom-0 w-[420px] h-[320px] opacity-30 pointer-events-none select-none"
        viewBox="0 0 420 320"
        fill="none"
      >
        <ellipse cx="350" cy="270" rx="60" ry="30" fill="#fde047" />
        <ellipse cx="270" cy="300" rx="30" ry="15" fill="#fbbf24" />
        <ellipse cx="390" cy="310" rx="20" ry="10" fill="#facc15" />
        <rect x="60" y="260" width="40" height="20" rx="6" fill="#fde047" />
        <rect x="120" y="240" width="40" height="40" rx="8" fill="#fde047" />
        <path
          d="M80 280 L140 220 L200 260 L260 160 L320 240"
          stroke="#22c55e"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="80" cy="280" r="10" fill="#22c55e" />
        <circle cx="140" cy="220" r="10" fill="#22c55e" />
        <circle cx="200" cy="260" r="10" fill="#22c55e" />
        <circle cx="260" cy="160" r="10" fill="#22c55e" />
        <circle cx="320" cy="240" r="10" fill="#22c55e" />
      </svg>
      {/* SVG decorativo de gráfico no fundo - canto superior esquerdo */}
      <svg
        className="absolute left-0 top-0 w-[220px] h-[120px] opacity-20 pointer-events-none select-none"
        viewBox="0 0 220 120"
        fill="none"
      >
        <ellipse cx="60" cy="40" rx="40" ry="15" fill="#fbbf24" />
        <ellipse cx="120" cy="60" rx="20" ry="8" fill="#fde047" />
        <path
          d="M20 100 L60 60 L100 80 L140 30 L180 70"
          stroke="#22c55e"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="100" r="7" fill="#22c55e" />
        <circle cx="60" cy="60" r="7" fill="#22c55e" />
        <circle cx="100" cy="80" r="7" fill="#22c55e" />
        <circle cx="140" cy="30" r="7" fill="#22c55e" />
        <circle cx="180" cy="70" r="7" fill="#22c55e" />
      </svg>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 relative z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-br from-green-500 to-yellow-400 rounded-full p-3 mb-2 shadow-md">
            {/* Ícone de maleta de dinheiro (administração financeira) */}
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="7"
                width="18"
                height="13"
                rx="3"
                fill="#fff"
                stroke="#22c55e"
                strokeWidth="2"
              />
              <rect x="7" y="2" width="10" height="5" rx="2" fill="#22c55e" />
              <rect x="10" y="11" width="4" height="2" rx="1" fill="#fde047" />
              <path
                d="M7 7V4a3 3 0 013-3h4a3 3 0 013 3v3"
                stroke="#22c55e"
                strokeWidth="2"
              />
              <circle cx="12" cy="16" r="2" fill="#22c55e" />
              <path
                d="M12 15v2m0 0h1m-1 0h-1"
                stroke="#fff"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isSignUp ? "Criar conta" : "Fazer login"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            GenGastos - Controle Financeiro Pessoal
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
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
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirmar Senha
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
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
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-primary-600 to-green-500 hover:from-primary-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-200"
          >
            {isLoading ? (
              <LoadingSpinner size="small" />
            ) : isSignUp ? (
              "Criar conta"
            ) : (
              "Entrar"
            )}
          </button>
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary-600 hover:text-primary-500 underline"
            >
              {isSignUp
                ? "Já tem uma conta? Faça login"
                : "Não tem uma conta? Cadastre-se"}
            </button>
          </div>
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
                      Voltar
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
