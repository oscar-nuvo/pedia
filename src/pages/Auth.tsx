import { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function Auth() {
  const { user, signUp, signIn } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  // Get email from query params (from demo redirect)
  const prefillEmail = searchParams.get('email') || '';

  // Default to signup if email is prefilled (coming from demo)
  const [isSignUp, setIsSignUp] = useState(!!prefillEmail);

  // Update form state when URL changes (handle browser back/forward)
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setIsSignUp(true);
    }
  }, [searchParams]);

  // Redirect if already authenticated - send to onboarding which will check completion status
  if (user) {
    return <Navigate to="/onboarding" replace />;
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    try {
      const validation = signUpSchema.parse(data);

      const { error } = await signUp(validation.email, validation.password, {
        first_name: validation.firstName,
        last_name: validation.lastName,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign up failed",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    try {
      const validation = signInSchema.parse(data);

      const { error } = await signIn(validation.email, validation.password);

      if (error) {
        throw error;
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign in failed",
          description: error.message || "Invalid email or password",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rezzy-cream px-4 pt-12 pb-8 md:pt-16">
      <div className="w-full max-w-md mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 bg-rezzy-sage rounded-xl" />
            <div className="absolute top-1.5 left-1.5 w-4 h-4 bg-rezzy-cream rounded-lg" />
          </div>
          <span className="text-rezzy-ink font-display font-semibold text-2xl tracking-tight">
            Rezzy
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-rezzy-ink mb-2">
            {isSignUp ? 'Unlock unlimited access' : 'Welcome back'}
          </h1>
          {prefillEmail && isSignUp && (
            <p className="text-rezzy-ink-muted text-sm">
              You asked 3 questions. Keep going.
            </p>
          )}
          {!prefillEmail && !isSignUp && (
            <p className="text-rezzy-ink-muted text-sm">
              Sign in to your account
            </p>
          )}
        </div>

        {/* Form */}
        {isSignUp ? (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-rezzy-ink-muted text-sm">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  required
                  className="bg-white border-rezzy-cream-deep text-rezzy-ink
                           placeholder:text-rezzy-ink-light focus:border-rezzy-sage
                           focus:ring-rezzy-sage/20 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-rezzy-ink-muted text-sm">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  required
                  className="bg-white border-rezzy-cream-deep text-rezzy-ink
                           placeholder:text-rezzy-ink-light focus:border-rezzy-sage
                           focus:ring-rezzy-sage/20 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-rezzy-ink-muted text-sm">
                Email
              </Label>
              <Input
                id="signup-email"
                name="email"
                type="email"
                placeholder="john@example.com"
                defaultValue={prefillEmail}
                required
                className="bg-white border-rezzy-cream-deep text-rezzy-ink
                         placeholder:text-rezzy-ink-light focus:border-rezzy-sage
                         focus:ring-rezzy-sage/20 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password" className="text-rezzy-ink-muted text-sm">
                Password
              </Label>
              <Input
                id="signup-password"
                name="password"
                type="password"
                placeholder="Minimum 8 characters"
                required
                className="bg-white border-rezzy-cream-deep text-rezzy-ink
                         placeholder:text-rezzy-ink-light focus:border-rezzy-sage
                         focus:ring-rezzy-sage/20 rounded-xl"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-rezzy-sage text-white font-semibold
                       hover:bg-rezzy-sage-light rounded-full h-11 mt-2"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email" className="text-rezzy-ink-muted text-sm">
                Email
              </Label>
              <Input
                id="signin-email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                className="bg-white border-rezzy-cream-deep text-rezzy-ink
                         placeholder:text-rezzy-ink-light focus:border-rezzy-sage
                         focus:ring-rezzy-sage/20 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password" className="text-rezzy-ink-muted text-sm">
                Password
              </Label>
              <Input
                id="signin-password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                className="bg-white border-rezzy-cream-deep text-rezzy-ink
                         placeholder:text-rezzy-ink-light focus:border-rezzy-sage
                         focus:ring-rezzy-sage/20 rounded-xl"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-rezzy-sage text-white font-semibold
                       hover:bg-rezzy-sage-light rounded-full h-11 mt-2"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        )}

        {/* Toggle link */}
        <div className="text-center mt-6">
          {isSignUp ? (
            <p className="text-rezzy-ink-muted text-sm">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="text-rezzy-sage hover:text-rezzy-sage-light font-medium
                         transition-colors focus:outline-none focus:underline"
              >
                Sign in
              </button>
            </p>
          ) : (
            <p className="text-rezzy-ink-muted text-sm">
              Need an account?{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="text-rezzy-sage hover:text-rezzy-sage-light font-medium
                         transition-colors focus:outline-none focus:underline"
              >
                Sign up
              </button>
            </p>
          )}
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-8 text-rezzy-ink-muted text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-rezzy-sage rounded-full" />
            No credit card
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-rezzy-sage rounded-full" />
            Cancel anytime
          </span>
        </div>
      </div>
    </div>
  );
}
