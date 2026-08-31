import * as React from "react";
import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Eye } from "lucide-react";

export default function LoginPage() {
  return (
    <AuthSplitLayout headerLinkText="Sign up" headerLinkHref="/signup">
      <div className="flex flex-col gap-6 w-full">
        <h1 className="text-[28px] font-semibold text-foreground tracking-tight leading-tight mb-2">
          Sign in to your account
        </h1>

        {/* OAuth Buttons */}
        <div className="flex flex-col gap-3">
          <Button variant="outline" className="w-full relative bg-white border-border text-foreground hover:bg-muted/50 rounded-sm">
            <svg viewBox="0 0 24 24" className="size-4 absolute left-4" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </Button>
          <Button variant="outline" className="w-full relative bg-white border-border text-foreground hover:bg-muted/50 rounded-sm">
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
        <form className="flex flex-col gap-4">
          <Input 
            type="email" 
            placeholder="Email" 
            className="h-11 rounded-sm border-border bg-white placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:ring-1"
          />
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Input 
                type="password" 
                placeholder="Password" 
                className="h-11 rounded-sm border-border bg-white placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:ring-1 pr-10"
              />
              <button 
                type="button" 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Show password"
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

          {/* Submit Button */}
          <Button type="button" className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 rounded-sm mt-2 flex items-center justify-center gap-2">
            Sign in
            <ArrowRight className="size-4" />
          </Button>
        </form>

        {/* Bottom Link */}
        <p className="text-center text-[13px] text-muted-foreground mt-4">
          Don't have an account?{" "}
          <Link href="/signup" className="font-medium text-foreground underline underline-offset-2">
            Create one
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}

