import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, TrendingUp, ArrowRight, Loader2, Chrome } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import logo from '@/assets/logo.png';
import { Separator } from '@/components/ui/separator';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(72),
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user, userRole, signUp, signIn, signInWithGoogle, loading: authLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'student' | 'investor' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});

  

useEffect(() => {
  if (!user) return;

  // role not ready yet → wait
  if (!userRole) return;

  if (userRole === "investor") {
    navigate("/investor-dashboard", { replace: true });
  } else {
    navigate("/student-dashboard", { replace: true });
  }
}, [user, userRole, navigate]);



  const validateForm = () => {
    try {
      authSchema.parse({ 
        email, 
        password, 
        fullName: isSignUp ? fullName : undefined 
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { email?: string; password?: string; fullName?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof typeof newErrors] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (isSignUp && !selectedRole) {
      toast.error('Please select your role');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName, selectedRole!);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please sign in.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Account created successfully!');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Welcome back!');
        }
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2 mb-12">
            <img 
              src={logo} 
              alt="Vichaar Setu" 
              className="h-10 w-10 object-contain rounded-lg"
            />
            <span className="font-display text-lg font-semibold">Vichaar Setu</span>
          </Link>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">
              {isSignUp ? 'Create account' : 'Welcome back'}
            </h1>
            <p className="text-muted-foreground">
              {isSignUp 
                ? 'Join the community of builders and investors' 
                : 'Sign in to continue to your dashboard'}
            </p>
          </div>

          {/* Role Selection (Sign Up only) */}
          {isSignUp && (
            <div className="mb-6">
              <span className="label-mono mb-3 block">I am a</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('student')}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-left group ${
                    selectedRole === 'student'
                      ? 'border-accent bg-accent/5'
                      : 'border-border/60 hover:border-border hover:bg-secondary/30'
                  }`}
                >
                  <div className={`inline-flex p-2 rounded-lg mb-2 transition-colors ${
                    selectedRole === 'student' ? 'bg-accent/20' : 'bg-secondary'
                  }`}>
                    <GraduationCap className={`h-4 w-4 ${
                      selectedRole === 'student' ? 'text-accent' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <p className="font-medium text-sm">Student</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Pitch your ideas</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('investor')}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-left group ${
                    selectedRole === 'investor'
                      ? 'border-primary bg-primary/5'
                      : 'border-border/60 hover:border-border hover:bg-secondary/30'
                  }`}
                >
                  <div className={`inline-flex p-2 rounded-lg mb-2 transition-colors ${
                    selectedRole === 'investor' ? 'bg-primary/20' : 'bg-secondary'
                  }`}>
                    <TrendingUp className={`h-4 w-4 ${
                      selectedRole === 'investor' ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <p className="font-medium text-sm">Investor</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Discover startups</p>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-sm">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`h-11 bg-secondary/30 border-border/60 ${errors.fullName ? 'border-destructive' : ''}`}
                />
                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-11 bg-secondary/30 border-border/60 ${errors.email ? 'border-destructive' : ''}`}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`h-11 bg-secondary/30 border-border/60 ${errors.password ? 'border-destructive' : ''}`}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full group"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
              or continue with
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 rounded-full"
            onClick={async () => {
              if (isSignUp && !selectedRole) {
                toast.error("Please select your role first");
                return;
              }

              setGoogleLoading(true);

              const { error } = await signInWithGoogle(isSignUp ? selectedRole : undefined);

              if (error) {
                toast.error(error.message);
                setGoogleLoading(false);
              }
            }}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
              }}
              className="text-foreground font-medium hover:text-primary transition-colors"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-secondary/20 border-l border-border/40 p-12">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="text-xs font-medium text-primary">✦ Join 1,200+ founders</span>
            </div>
            <h2 className="font-display text-4xl font-bold mb-4">
              Build the future,<br />together
            </h2>
            <p className="text-muted-foreground">
              Whether you're launching your first startup or looking to invest in the next unicorn.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              { number: "89%", label: "Projects funded" },
              { number: "$2.1M", label: "Total raised" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-4">
                <div className="text-2xl font-display font-bold gradient-text">{stat.number}</div>
                <div className="label-mono mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;