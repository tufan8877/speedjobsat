import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { LoginUser, RegisterUser, User } from "@shared/sqlite-schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Auth Context Type
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

// Erstellen des Kontexts mit einem Default-Wert
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

// Auth Provider Komponente
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginPending, setLoginPending] = useState(false);
  const [registerPending, setRegisterPending] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);

  // Benutzer beim Laden abrufen
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Token prüfen bevor API-Request
        const authToken = localStorage.getItem('authToken');
        console.log('Initial user check, token available:', !!authToken);
        console.log('Token value:', authToken ? authToken.substring(0, 20) + '...' : 'None');
        
        if (!authToken) {
          console.log('No token found, skipping user fetch');
          setIsLoading(false);
          return;
        }
        
        const response = await apiRequest("GET", "/api/user");
        const userData = await response.json();
        console.log('User data fetched:', userData.email);
        setUser(userData);
      } catch (err) {
        console.log('Error fetching user:', err);
        // 401 ist OK - Benutzer nicht angemeldet
        if (err instanceof Error && !err.message.includes("401")) {
          console.error("Fehler beim Abrufen des Benutzers:", err);
        }
        // Bei 401 Token löschen
        localStorage.removeItem('authToken');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Login Funktion
  const login = async (credentials: LoginUser): Promise<User | null> => {
    setLoginPending(true);
    setError(null);
    
    console.log("useAuth login called with:", credentials);
    console.log("JSON body being sent:", JSON.stringify(credentials));
    
    try {
      const response = await apiRequest("POST", "/api/login", credentials);

      const userData = await response.json();
      
      // TOKEN-SPEICHERUNG: Für Session-Cookie-Probleme
      if (userData.authToken) {
        localStorage.setItem('authToken', userData.authToken);
        console.log('Auth token stored:', userData.authToken.substring(0, 20) + '...');
        console.log('Token after storage check:', localStorage.getItem('authToken') ? 'Found' : 'Missing');
        
        // User-Objekt ohne Token speichern (Token ist separate)
        const { authToken, ...userWithoutToken } = userData;
        setUser(userWithoutToken);
      } else {
        console.log('No authToken in response:', userData);
        setUser(userData);
      }
      
      // Kurz warten um Session-Cookie-Synchronisation zu ermöglichen
      await new Promise(resolve => setTimeout(resolve, 100));
      
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

  // Register Funktion
  const register = async (userData: RegisterUser): Promise<User | null> => {
    setRegisterPending(true);
    setError(null);
    
    console.log("useAuth register called with:", userData);
    console.log("JSON body being sent:", JSON.stringify(userData));
    
    try {
      const response = await apiRequest("POST", "/api/register", userData);
      const newUser = await response.json();
      
      // TOKEN-SPEICHERUNG auch bei Registrierung
      if (newUser.authToken) {
        localStorage.setItem('authToken', newUser.authToken);
        console.log('Auth token stored after register:', newUser.authToken.substring(0, 20) + '...');
      }
      
      setUser(newUser);
      
      // Kurz warten um Session-Cookie-Synchronisation zu ermöglichen
      await new Promise(resolve => setTimeout(resolve, 100));
      
      toast({
        title: "Registrierung erfolgreich",
        description: "Ihr Konto wurde erstellt. Bitte vervollständigen Sie Ihr Profil.",
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

  // Logout Funktion
  const logout = async (): Promise<void> => {
    setLogoutPending(true);
    setError(null);
    
    try {
      await apiRequest("POST", "/api/logout");
      setUser(null);
      
      // TOKEN LÖSCHEN bei Logout
      localStorage.removeItem('authToken');
      console.log('Auth token removed on logout');
      
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

  const contextValue = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    loginPending,
    registerPending,
    logoutPending,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook zum Verwenden des Auth-Kontexts
export function useAuth() {
  return useContext(AuthContext);
}