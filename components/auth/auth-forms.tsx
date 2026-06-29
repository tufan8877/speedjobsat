import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Login Schema
const loginSchema = z.object({
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  password: z.string().min(1, "Bitte geben Sie Ihr Passwort ein")
});

// Register Schema
const registerSchema = z.object({
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
  passwordConfirm: z.string(),
  terms: z.boolean().refine((val) => val === true, {
    message: "Sie müssen die Nutzungsbedingungen akzeptieren"
  })
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwörter stimmen nicht überein",
  path: ["passwordConfirm"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="mr-2">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.69 9c0-.6.1-1.18.28-1.72V4.94H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.06l3.01-2.34z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

function GoogleLoginButton({ label }: { label: string }) {
  const [loading, setLoading] = useState(false);

  const startGoogleLogin = () => {
    setLoading(true);
    window.location.href = "/api/auth/google";
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
      onClick={startGoogleLogin}
      disabled={loading}
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
      {label}
    </Button>
  );
}

function Divider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-white px-2 text-gray-500">oder</span>
      </div>
    </div>
  );
}

export function LoginForm() {
  const { login, loginPending } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoginError(null);
    console.log("LOGIN FORM onSubmit called with:", values);
    console.log("Login function available?", typeof login);
    
    try {
      const result = await login({
        email: values.email,
        password: values.password
      });
      
      if (!result) {
        setLoginError("Anmeldung fehlgeschlagen");
      }
    } catch (error) {
      console.error("Login Error:", error);
      if (error instanceof Error) {
        setLoginError(error.message);
      } else {
        setLoginError("Ein unbekannter Fehler ist aufgetreten");
      }
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Anmelden</h2>
        
        {loginError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{loginError}</AlertDescription>
          </Alert>
        )}

        <GoogleLoginButton label="Mit Google anmelden" />
        <Divider />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">E-Mail Adresse</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="beispiel@email.at" 
                      className="text-gray-900 placeholder:text-gray-500 bg-white border-gray-300" 
                      {...field} 
                    />
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
                  <FormLabel className="text-gray-700 font-medium">Passwort</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Ihr Passwort" 
                      className="text-gray-900 placeholder:text-gray-500 bg-white border-gray-300" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white"
              disabled={loginPending}
            >
              {loginPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Anmelden
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export function RegisterForm() {
  const { register, registerPending } = useAuth();
  const [registerError, setRegisterError] = useState<string | null>(null);
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
      terms: false,
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setRegisterError(null);
    console.log("REGISTER FORM onSubmit called with:", values);
    console.log("Register function available?", typeof register);
    
    try {
      const result = await register({
        email: values.email,
        password: values.password,
        passwordConfirm: values.passwordConfirm
      });
      
      if (!result) {
        setRegisterError("Registrierung fehlgeschlagen");
      }
    } catch (error) {
      console.error("Register Error:", error);
      if (error instanceof Error) {
        setRegisterError(error.message);
      } else {
        setRegisterError("Ein unbekannter Fehler ist aufgetreten");
      }
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Registrieren</h2>
        
        {registerError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{registerError}</AlertDescription>
          </Alert>
        )}

        <GoogleLoginButton label="Mit Google registrieren" />
        <Divider />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">E-Mail Adresse</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="beispiel@email.at" 
                      className="text-gray-900 placeholder:text-gray-500 bg-white border-gray-300" 
                      {...field} 
                    />
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
                  <FormLabel className="text-gray-700 font-medium">Passwort</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Mindestens 8 Zeichen" 
                      className="text-gray-900 placeholder:text-gray-500 bg-white border-gray-300" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="passwordConfirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Passwort bestätigen</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Passwort wiederholen" 
                      className="text-gray-900 placeholder:text-gray-500 bg-white border-gray-300" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm text-gray-700">
                      Ich akzeptiere die Nutzungsbedingungen und Datenschutzerklärung
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white"
              disabled={registerPending}
            >
              {registerPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrieren
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
