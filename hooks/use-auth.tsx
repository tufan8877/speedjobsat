import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { LoginUser, RegisterUser, User } from "@shared/sqlite-schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginUser) => Promise<User | null>;
  register: (data: RegisterUser) => Promise<User | null>;
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
  logout: async () => {},
  loginPending: false,
  registerPending: false,
  logoutPending: false,
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
        const authToken = localStorage.getItem("authToken");

        if (!authToken && !document.cookie.includes("speedjobs.sid")) {
          setIsLoading(false);
          return;
        }

        const response = await apiRequest("GET", "/api/user");
        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        if (err instanceof Error && !err.message.includes("401")) {
          console.error("Fehler beim Abrufen des Benutzers:", err);
        }
        localStorage.removeItem("authToken");
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

      if ((userData as any).authToken) {
        localStorage.setItem("authToken", (userData as any).authToken);
        const { authToken, ...userWithoutToken } = userData as any;
        setUser(userWithoutToken);
      } else {
        setUser(userData);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      toast({
        title: "Erfolgreich angemeldet",
        description: (userData as any).emailVerified || userData.isAdmin
          ? "Willkommen zurück!"
          : "Bitte bestätigen Sie noch Ihre E-Mail-Adresse.",
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

  const register = async (userData: RegisterUser): Promise<User | null> => {
    setRegisterPending(true);
    setError(null);

    try {
      const response = await apiRequest("POST", "/api/register", userData);
      const newUser = await response.json();

      if ((newUser as any).authToken) {
        localStorage.setItem("authToken", (newUser as any).authToken);
        const { authToken, ...userWithoutToken } = newUser as any;
        setUser(userWithoutToken);
      } else {
        setUser(newUser);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      toast({
        title: "Registrierung erfolgreich",
        description: "Ihr Konto wurde erstellt. Bitte prüfen Sie Ihr E-Mail-Postfach und bestätigen Sie Ihre Adresse.",
      });

      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ein Fehler ist aufgetreten";
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

  const logout = async (): Promise<void> => {
    setLogoutPending(true);
    setError(null);

    try {
      await apiRequest("POST", "/api/logout");
      setUser(null);
      localStorage.removeItem("authToken");

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
