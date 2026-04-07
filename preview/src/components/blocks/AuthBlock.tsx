import { useState } from "react";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function validateEmail(value: string) {
  if (!value) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address.";
  return "";
}

function validatePassword(value: string) {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  return "";
}

export function AuthBlock() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1600));
    setIsLoading(false);
    setIsSuccess(true);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setEmail("");
    setPassword("");
    setEmailError("");
    setPasswordError("");
  };

  return (
    <div className="flex h-full items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-sm shadow-lg">
        {isSuccess ? (
          <SuccessState onReset={handleReset} email={email} />
        ) : (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>Sign in to your account to continue</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Social buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full" type="button">
                  <GithubIcon className="h-4 w-4" />
                  GitHub
                </Button>
                <Button variant="outline" className="w-full" type="button">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">or continue with</span>
                <Separator className="flex-1" />
              </div>

              <form id="auth-form" onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="auth-email">Email</Label>
                  <Input
                    id="auth-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailError(validateEmail(email))}
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? "auth-email-error" : undefined}
                    className={cn(emailError && "border-destructive focus-visible:ring-destructive")}
                  />
                  {emailError && (
                    <p id="auth-email-error" role="alert" className="text-xs text-destructive">
                      {emailError}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auth-password">Password</Label>
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="auth-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setPasswordError(validatePassword(password))}
                      aria-invalid={!!passwordError}
                      aria-describedby={passwordError ? "auth-password-error" : undefined}
                      className={cn("pr-10", passwordError && "border-destructive focus-visible:ring-destructive")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p id="auth-password-error" role="alert" className="text-xs text-destructive">
                      {passwordError}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox id="auth-remember" />
                  <Label htmlFor="auth-remember" className="text-sm font-normal cursor-pointer">
                    Remember me for 30 days
                  </Label>
                </div>
              </form>
            </CardContent>

            <CardFooter className="flex-col gap-3">
              <Button
                type="submit"
                form="auth-form"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Don't have an account?{" "}
                <button className="text-foreground font-medium hover:underline cursor-pointer">
                  Sign up
                </button>
              </p>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}

function SuccessState({ onReset, email }: { onReset: () => void; email: string }) {
  return (
    <div className="flex flex-col items-center gap-5 px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <CheckCircle className="h-7 w-7 text-primary" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Signed in successfully</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back — you're now logged in as{" "}
          <span className="font-medium text-foreground">{email}</span>.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onReset}>
        Sign out & reset
      </Button>
    </div>
  );
}
