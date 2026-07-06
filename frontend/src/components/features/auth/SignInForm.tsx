import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatedInput } from "@/components/common/AnimatedInput";
import { ApiRequestError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { SocialLoginButton } from "./SocialLoginButton";

export function SignInForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <AnimatedInput
        label="Email"
        type="email"
        placeholder="you@example.com"
        icon={<Mail size={16} />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <AnimatedInput
        label="Password"
        type="password"
        placeholder="••••••••"
        icon={<Lock size={16} />}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {/* Forgot password only */}
      <div className="flex justify-end">
        <button
          type="button"
          className="text-sm font-medium text-brand transition-colors hover:text-brand-dark"
        >
          Forgot password?
        </button>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive"
        >
          {error}
        </motion.p>
      )}

      {/* Premium CTA Button */}
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.01 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        className="relative w-full h-12 rounded-xl overflow-hidden font-semibold text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
        style={{
          background: loading
            ? "var(--color-brand)"
            : "linear-gradient(135deg, #FBA15A 0%, #f08c38 60%, #e87820 100%)",
          boxShadow: loading ? "none" : "0 4px 20px rgba(251,161,90,0.35)",
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Signing in…</span>
          </div>
        ) : (
          <span className="relative z-10">Sign In</span>
        )}
      </motion.button>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-3 text-muted-foreground">
            or continue with
          </span>
        </div>
      </div>

      {/* Social login */}
      <div className="flex flex-col gap-3">
        <SocialLoginButton provider="google" />
      </div>
    </motion.form>
  );
}