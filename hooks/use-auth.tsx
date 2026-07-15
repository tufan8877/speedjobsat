import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { LoginUser, RegisterUser, User } from "@shared/sqlite-schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginUser) => Promise<User | null>;
  register: (data: RegisterUser) => Promise<any>;
  confirmRegistration: (email: string, code: string) => Promise<any>;
  logout: () => Promise<void>;
  loginPending: boolean;
  registerPending: boolean;
  logoutPending: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  error: null,
  login: async () => null,
  register: async () => null,
  confirmRegistration: async () => null,
  logout: async () => {},
  loginPending: false,
  registerPending: false,
  logoutPending: false
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginPending, setLoginPending] = useState(false);
  const [registerPending, setRegisterPending] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiRequest("GET", "/api/user");
        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        if (err instanceof Error && !err.message.includes("401")) {
          console.error("Fehler beim Abrufen des Benutzers:", err);
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (credentials: LoginUser): Promise<User | null> => {
    setLoginPending(true);
    setError(null);

    try {
      const response = await apiRequest("POST", "/api/login", credentials);
      const userData = await response.json();
      setUser(userData);

      toast({
        title: "Erfolgreich angemeldet",
        description: "Willkommen zurück!",
      });

      return userData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ein Fehler ist aufgetreten";
      setError(errorMessage);

      toast({
        title: "Anmeldung fehlgeschlagen",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    } finally {
      setLoginPending(false);
    }
  };

  const register = async (userData: RegisterUser): Promise<any> => {
    setRegisterPending(true);
    setError(null);

    try {
      const response = await apiRequest("POST", "/api/register", userData);
      const result = await response.json();

      if ((result as any).id) {
        setUser(result);
      }

      toast({
        title: (result as any).requiresCode ? "Bestätigungscode gesendet" : "Registrierung erfolgreich",
        description: (result as any).message || "Bitte prüfen Sie Ihr E-Mail-Postfach.",
      });

      return result;
    } catch (err) {
      const errorMessage = "Der Bestätigungscode konnte momentan nicht versendet werden. Bitte versuchen Sie es später erneut.";
      setError(errorMessage);

      toast({
        title: "Registrierung fehlgeschlagen",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    } finally {
      setRegisterPending(false);
    }
  };

  const confirmRegistration = async (email: string, code: string): Promise<any> => {
    setRegisterPending(true);
    setError(null);

    try {
      const response = await apiRequest("POST", "/api/confirm-registration", { email, code });
      const result = await response.json();

      if ((result as any).user) {
        setUser((result as any).user);
      } else if ((result as any).id) {
        setUser(result);
      } else {
        const freshUserResponse = await apiRequest("GET", "/api/user");
        const freshUser = await freshUserResponse.json();
        setUser(freshUser);
      }

      toast({
        title: "Registrierung erfolgreich",
        description: "Ihr Konto wurde erstellt und Sie sind angemeldet.",
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Code konnte nicht bestätigt werden";
      setError(errorMessage);

      toast({
        title: "Code-Bestätigung fehlgeschlagen",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    } finally {
      setRegisterPending(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLogoutPending(true);
    setError(null);

    try {
      await apiRequest("POST", "/api/logout");
      setUser(null);

      toast({
        title: "Abgemeldet",
        description: "Sie wurden erfolgreich abgemeldet.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ein Fehler ist aufgetreten";
      setError(errorMessage);

      toast({
        title: "Abmeldung fehlgeschlagen",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLogoutPending(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        confirmRegistration,
        logout,
        loginPending,
        registerPending,
        logoutPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
