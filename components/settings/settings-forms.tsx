import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Key, Shield, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";

// E-Mail Änderungsformular
const emailSchema = z.object({
  email: z.string().email("Gültige E-Mail-Adresse erforderlich"),
  password: z.string().min(1, "Passwort ist erforderlich"),
});

// Passwort Änderungsformular
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Aktuelles Passwort ist erforderlich"),
  newPassword: z.string().min(6, "Neues Passwort muss mindestens 6 Zeichen haben"),
  confirmPassword: z.string().min(6, "Passwort muss mindestens 6 Zeichen haben"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"]
});

export function AccountSettings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  // E-Mail Änderungsformular
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Passwort Änderungsformular
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // E-Mail-Änderung Mutation
  const changeEmailMutation = useMutation({
    mutationFn: async (data: z.infer<typeof emailSchema>) => {
      const res = await apiRequest("POST", "/api/change-email", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "E-Mail geändert",
        description: "Ihre E-Mail wurde erfolgreich geändert.",
      });
      emailForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "E-Mail konnte nicht geändert werden.",
        variant: "destructive",
      });
    }
  });

  // Passwort-Änderung Mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof passwordSchema>) => {
      const res = await apiRequest("POST", "/api/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Passwort geändert",
        description: "Ihr Passwort wurde erfolgreich geändert.",
      });
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Passwort konnte nicht geändert werden.",
        variant: "destructive",
      });
    }
  });

  // Konto löschen Mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", "/api/delete-account");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Konto gelöscht",
        description: "Ihr Konto wurde erfolgreich gelöscht.",
      });
      // Nach erfolgreicher Löschung ausloggen und zur Startseite weiterleiten
      window.location.href = "/";
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Konto konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  });

  // E-Mail ändern
  const onEmailSubmit = (data: z.infer<typeof emailSchema>) => {
    changeEmailMutation.mutate(data);
  };

  // Passwort ändern
  const onPasswordSubmit = (data: z.infer<typeof passwordSchema>) => {
    changePasswordMutation.mutate(data);
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kontoeinstellungen</CardTitle>
          <CardDescription>Nicht eingeloggt</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Sie müssen eingeloggt sein, um Ihre Kontoeinstellungen zu ändern.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kontoeinstellungen</CardTitle>
        <CardDescription>
          Verwalten Sie Ihr Konto und Sicherheitseinstellungen
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* E-Mail Änderung */}
        <div>
          <h3 className="text-lg font-medium mb-2">E-Mail-Adresse ändern</h3>
          <p className="text-gray-600 mb-4">
            Aktuelle E-Mail: <span className="font-medium">{user.email}</span>
          </p>
          
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Neue E-Mail-Adresse</FormLabel>
                    <FormControl>
                      <Input placeholder="neue@email.at" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={emailForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aktuelles Passwort</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormDescription>
                      Zur Bestätigung der Änderung ist Ihr aktuelles Passwort erforderlich.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                disabled={changeEmailMutation.isPending}
                className="flex items-center gap-2"
              >
                {changeEmailMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    E-Mail wird geändert...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    E-Mail ändern
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>

        <Separator />

        {/* Passwort Änderung */}
        <div>
          <h3 className="text-lg font-medium mb-2">Passwort ändern</h3>
          <p className="text-gray-600 mb-4">
            Ändern Sie regelmäßig Ihr Passwort, um Ihr Konto zu schützen.
          </p>
          
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aktuelles Passwort</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Neues Passwort</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormDescription>
                      Mindestens 6 Zeichen lang
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passwort bestätigen</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                disabled={changePasswordMutation.isPending}
                className="flex items-center gap-2"
              >
                {changePasswordMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Passwort wird geändert...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Passwort ändern
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>

        <Separator />

        {/* Konto löschen */}
        <div>
          <h3 className="text-lg font-medium mb-2 text-red-600">Konto löschen</h3>
          <p className="text-gray-600 mb-4">
            Wenn Sie Ihr Konto löschen, werden alle Ihre Daten permanent entfernt.
            Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
          
          <Button 
            variant="destructive" 
            className="flex items-center gap-2"
            onClick={() => {
              if (window.confirm("Sind Sie sicher, dass Sie Ihr Konto löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.")) {
                deleteAccountMutation.mutate();
              }
            }}
            disabled={deleteAccountMutation.isPending}
          >
            {deleteAccountMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Konto wird gelöscht...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Konto löschen
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}