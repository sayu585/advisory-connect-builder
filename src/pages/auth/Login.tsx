
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

// Form schema validation
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { login, user } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: LoginFormValues) => {
    await login(data.email, data.password, data.rememberMe);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Branding Section */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/90 to-purple-600 p-8 flex-col justify-between">
        <div className="flex flex-col h-full">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white">FinSecure Pro</h1>
            <p className="text-white/80 mt-2">Your financial management dashboard</p>
          </div>
          
          <div className="flex-grow flex items-center justify-center">
            <div className="text-white space-y-6 max-w-md">
              <h2 className="text-3xl font-semibold">Transform Your Financial Management</h2>
              <p className="text-white/80 text-lg">
                Our platform provides powerful tools for financial advisors
                to manage clients, track recommendations, and grow your business.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="font-medium text-xl">Client Management</h3>
                  <p className="text-white/70 mt-1">Track and manage all your clients in one place</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="font-medium text-xl">Smart Recommendations</h3>
                  <p className="text-white/70 mt-1">Provide data-driven financial advice</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="font-medium text-xl">Team Collaboration</h3>
                  <p className="text-white/70 mt-1">Work seamlessly with your entire team</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="font-medium text-xl">Secure Data</h3>
                  <p className="text-white/70 mt-1">Bank-level encryption for all client information</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <p className="text-white/80 mb-4">Follow us on social media:</p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-white hover:text-white/80 transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-white hover:text-white/80 transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-white hover:text-white/80 transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-white hover:text-white/80 transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex flex-1 items-center justify-center p-8 bg-gray-50">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="space-y-1 pb-6">
            {/* Mobile version branding */}
            <div className="md:hidden text-center mb-6">
              <h1 className="text-3xl font-bold text-primary">FinSecure Pro</h1>
              <p className="text-muted-foreground mt-1">Your financial management dashboard</p>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Keep me signed in</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <Link to="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <Button variant="outline" type="button" className="flex items-center justify-center gap-2">
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Button>
                <Button variant="outline" type="button" className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Sign Up
              </Link>
            </div>
            {/* Mobile version social links */}
            <div className="md:hidden mt-4">
              <p className="text-sm text-muted-foreground mb-2 text-center">Follow us on social media</p>
              <div className="flex justify-center space-x-4">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
