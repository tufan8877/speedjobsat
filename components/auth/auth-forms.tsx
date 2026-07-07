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
import { apiRequest } from "@/lib/queryClient";

const loginSchema = z.object({
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  password: z.string().min(1, "Bitte geben Sie Ihr Passwort ein")
});

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

const codeSchema = z.object({
  code: z.string().min(6, "Bitte geben Sie den 6-stelligen Code ein").max(6, "Der Code hat 6 Stellen"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type CodeFormValues = z.infer<typeof codeSchema>;

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
    
    try {
      const result = await login({
        email: values.email,
        password: values.password
      });
      
      if (!result) {
        setLoginError("Anmeldung fehlgeschlagen");
      }
    } catch (error) {
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
  const { register, registerPending, login } = useAuth();
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerInfo, setRegisterInfo] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [confirmPending, setConfirmPending] = useState(false);
  const [resendPending, setResendPending] = useState(false);
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
      terms: false,
    },
  });

  const codeForm = useForm<CodeFormValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setRegisterError(null);
    setRegisterInfo(null);
    
    try {
      const result = await register({
        email: values.email,
        password: values.password,
        passwordConfirm: values.passwordConfirm
      });
      
      if (!result) {
        setRegisterError("Registrierung fehlgeschlagen");
        return;
      }

      if (result.requiresCode) {
        setPendingEmail(result.email || values.email);
        setRegisterInfo(result.message || "Wir haben Ihnen einen 6-stelligen Bestätigungscode per E-Mail gesendet.");
        return;
      }
    } catch (error) {
      if (error instanceof Error) {
        setRegisterError(error.message);
      } else {
        setRegisterError("Ein unbekannter Fehler ist aufgetreten");
      }
    }
  };

  const confirmCode = async (values: CodeFormValues) => {
    if (!pendingEmail) return;

    setConfirmPending(true);
    setRegisterError(null);
    setRegisterInfo(null);

    try {
      const response = await apiRequest("POST", "/api/confirm-registration", {
        email: pendingEmail,
        code: values.code,
      });
      const data = await response.json();
      setRegisterInfo(data.message || "E-Mail bestätigt. Sie werden angemeldet.");

      const password = form.getValues("password");
      const loggedInUser = await login({ email: pendingEmail, password });

      if (!loggedInUser) {
        setRegisterError("Konto wurde erstellt, aber automatische Anmeldung war nicht möglich. Bitte melden Sie sich normal an.");
        return;
      }

      window.setTimeout(() => {
        window.location.href = "/profil";
      }, 300);
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : "Code konnte nicht bestätigt werden");
    } finally {
      setConfirmPending(false);
    }
  };

  const resendCode = async () => {
    if (!pendingEmail) return;

    setResendPending(true);
    setRegisterError(null);
    setRegisterInfo(null);

    try {
      const response = await apiRequest("POST", "/api/resend-registration-code", {
        email: pendingEmail,
      });
      const data = await response.json();
      setRegisterInfo(data.message || "Neuer Code wurde gesendet.");
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : "Code konnte nicht erneut gesendet werden");
    } finally {
      setResendPending(false);
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

        {registerInfo && (
          <Alert className="mb-4 bg-blue-50 border-blue-200 text-blue-800">
            <AlertDescription>{registerInfo}</AlertDescription>
          </Alert>
        )}

        {pendingEmail ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              Code gesendet an: <strong>{pendingEmail}</strong>
              <p className="mt-2 text-xs text-gray-600">
                Bitte prüfen Sie auch Ihren Spam- oder Junk-Ordner, falls die E-Mail nicht im Posteingang erscheint.
              </p>
            </div>

            <Form {...codeForm}>
              <form onSubmit={codeForm.handleSubmit(confirmCode)} className="space-y-4">
                <FormField
                  control={codeForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Bestätigungscode</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="6-stelliger Code"
                          className="text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 tracking-widest"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={confirmPending}>
                  {confirmPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  E-Mail bestätigen und automatisch anmelden
                </Button>

                <Button type="button" variant="outline" className="w-full" disabled={resendPending} onClick={resendCode}>
                  {resendPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Code erneut senden
                </Button>
              </form>
            </Form>
          </div>
        ) : (
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
                Registrierungscode senden
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
