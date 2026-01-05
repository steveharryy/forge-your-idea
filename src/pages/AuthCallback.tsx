import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, userRole, loading } = useAuth();
  const [dots, setDots] = useState('');

  // Animate the loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Redirect once we have user + role
  useEffect(() => {
    if (loading) return;

    // No user = go to auth
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    // User exists but role not loaded yet = wait
    if (!userRole) return;

    // Route to correct dashboard
    if (userRole === 'investor') {
      navigate('/investor-dashboard', { replace: true });
    } else {
      navigate('/student-dashboard', { replace: true });
    }
  }, [user, userRole, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center gap-6 p-8"
      >
        {/* Animated spinner with sparkle */}
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sparkles className="w-6 h-6 text-primary" />
          </motion.div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-display font-semibold"
          >
            Signing you in{dots}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-sm"
          >
            Just a moment while we set things up
          </motion.p>
        </div>

        {/* Progress hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-3 text-xs text-muted-foreground/60"
        >
          <div className="flex items-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Loading your dashboard</span>
          </div>

          {/* Helpful debug (lets you see exactly what URL the provider returned to) */}
          <details className="w-full max-w-md rounded-lg border border-border/50 bg-secondary/20 p-3 text-left">
            <summary className="cursor-pointer select-none">Having trouble? Show debug</summary>
            <div className="mt-2 space-y-1">
              <div><span className="label-mono">origin</span>: {window.location.origin}</div>
              <div className="break-all"><span className="label-mono">url</span>: {window.location.href}</div>
              <div className="break-all"><span className="label-mono">hash</span>: {window.location.hash || '(empty)'}</div>
            </div>
          </details>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthCallback;
