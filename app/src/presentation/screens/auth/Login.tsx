import React, { useState } from 'react';
import { useAuthStore } from '@/application/store';

interface LoginProps {
  onOnboarding: () => void;
}

const Login: React.FC<LoginProps> = ({ onOnboarding }) => {
  const { signIn, signUp, resendConfirmation, loading, error, emailNotConfirmed, pendingEmail } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendSuccess(false);

    try {
      if (isSignUp) {
        await signUp(email, password, name);
        // Solo ir a onboarding si NO necesita confirmación de email
        // Si necesita confirmación, signUp lanzará un error
        onOnboarding();
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      console.error('Auth error:', err);
      // El error ya está manejado en el store y se mostrará en la UI
    }
  };

  const handleResendConfirmation = async () => {
    if (!pendingEmail) return;
    
    setResendSuccess(false);
    try {
      await resendConfirmation(pendingEmail);
      setResendSuccess(true);
    } catch (err) {
      console.error('Resend error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-calm-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-calm-accent rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-calm-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-light text-white tracking-widest mb-2">ANCLA Y BRÚJULA</h1>
          <p className="text-calm-highlight text-sm">Tu espacio de calma interior</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                required
                className="w-full bg-calm-800 border border-calm-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-calm-accent focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="w-full bg-calm-800 border border-calm-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-calm-accent focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full bg-calm-800 border border-calm-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-calm-accent focus:border-transparent"
            />
            {isSignUp && (
              <p className="text-xs text-gray-500 mt-2">Mínimo 6 caracteres</p>
            )}
          </div>

          {error && (
            <div className={`border rounded-xl p-4 ${emailNotConfirmed ? 'bg-yellow-900/30 border-yellow-500/50' : 'bg-red-900/30 border-red-500/50'}`}>
              <div className={`text-sm mb-2 ${emailNotConfirmed ? 'text-yellow-200' : 'text-red-200'}`}>
                {emailNotConfirmed ? (
                  <>
                    <div className="flex items-start gap-2 mb-3">
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.054 0 1.955-.816 2.048-1.857.092-1.041-.71-1.943-1.764-1.943h-1.316l-.001-.001A3.978 3.978 0 0016 14c0-.337-.042-.664-.12-.978L13.5 7.5 11 13.022A3.978 3.978 0 0010 14c0 .876.283 1.686.76 2.343l-.001.001H9.444c-1.054 0-1.856.902-1.764 1.943.093 1.041.994 1.857 2.048 1.857z" />
                      </svg>
                      <div>
                        <p className="font-medium mb-1">📧 Email no confirmado</p>
                        <p className="text-xs opacity-90">
                          Revisa tu bandeja de entrada (y spam) de <strong>{pendingEmail}</strong> y haz clic en el enlace de confirmación.
                        </p>
                      </div>
                    </div>
                    
                    {resendSuccess ? (
                      <div className="bg-green-900/40 border border-green-500/40 rounded-lg p-3 text-green-200 text-xs">
                        ✓ Email reenviado. Revisa tu bandeja de entrada.
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendConfirmation}
                        disabled={loading}
                        className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-200 py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Reenviando...' : '📤 Reenviar email de confirmación'}
                      </button>
                    )}
                  </>
                ) : (
                  error
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-calm-accent text-calm-900 py-4 rounded-xl font-medium hover:bg-teal-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-calm-900 border-t-transparent rounded-full animate-spin"></div>
                {isSignUp ? 'Creando cuenta...' : 'Iniciando sesión...'}
              </span>
            ) : (
              isSignUp ? 'Crear cuenta' : 'Iniciar sesión'
            )}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-calm-highlight text-sm hover:text-teal-300 transition-colors"
          >
            {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-calm-800/30 border border-calm-700/30 rounded-xl p-4">
          <p className="text-xs text-gray-400 leading-relaxed text-center">
            Ancla y Brújula utiliza Terapia Cognitivo-Conductual para acompañamiento emocional. 
            <strong className="text-white"> No reemplaza ayuda profesional.</strong> Si tienes pensamientos de autolesión, busca ayuda inmediata.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
