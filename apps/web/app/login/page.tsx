"use client";

import * as React from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Eye } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isRegistered = searchParams.get("registered") === "true";

  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/auth/signin`,
        formData
      );

      // Success, store token and redirect to dashboard
      localStorage.setItem("sprintly_token", res.data.token);
      router.push("/org/create");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message || "An error occurred during sign in");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred during sign in");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthSplitLayout headerLinkText="Sign up" headerLinkHref="/signup">
        <div className="flex flex-col gap-6 w-full">
          <h1 className="text-[28px] font-semibold text-foreground tracking-tight leading-tight mb-2">
            Sign in to your account
          </h1>
          
          {isRegistered && (
            <div className="bg-green-50 text-green-700 text-sm p-3 rounded-sm border border-green-200">
              Account created successfully. Please sign in.
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="flex flex-col gap-3">
            <Button type="button" variant="outline" className="w-full relative bg-white border-border text-foreground hover:bg-muted/50 rounded-sm">
              <svg viewBox="0 0 24 24" className="size-4 absolute left-4" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </Button>
            <Button type="button" variant="outline" className="w-full relative bg-white border-border text-foreground hover:bg-muted/50 rounded-sm">
              <svg viewBox="0 0 24 24" className="size-4 absolute left-4" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Sign in with X
            </Button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center py-2">
            <Separator className="flex-1 bg-border/60" />
            <span className="mx-4 text-[13px] text-muted-foreground lowercase">or</span>
            <Separator className="flex-1 bg-border/60" />
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Email" 
              className="h-11 rounded-sm border-border bg-white placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:ring-1"
            />
            <div className="flex flex-col gap-2">
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Password" 
                  className="h-11 rounded-sm border-border bg-white placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:ring-1 pr-10"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <Eye className="size-4" />
                </button>
              </div>
              
              {/* Forgot password */}
              <div className="flex justify-end">
                <Link href="#" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>
            
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Submit Button */}
            <Button disabled={isLoading} type="submit" className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 rounded-sm mt-2 flex items-center justify-center gap-2">
              {isLoading ? "Signing in..." : "Sign in"}
              {!isLoading && <ArrowRight className="size-4" />}
            </Button>
          </form>

          {/* Bottom Link */}
          <p className="text-center text-[13px] text-muted-foreground mt-4">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-foreground underline underline-offset-2">
              Create one
            </Link>
          </p>
        </div>
      </AuthSplitLayout>
    </React.Suspense>
  );
}

