import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSearch } from "wouter";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, Settings, User, LogOut } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import BetterProfileForm from "@/components/profile/better-profile-form";
import { AccountSettings } from "@/components/settings/settings-forms";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const initialTab = searchParams.get("tab") === "settings" ? "settings" : "profile";
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newParams = new URLSearchParams(search);
    if (value === "settings") {
      newParams.set("tab", "settings");
    } else {
      newParams.delete("tab");
    }
    const newSearch = newParams.toString();
    window.history.replaceState(null, "", `/profil${newSearch ? `?${newSearch}` : ""}`);
  };
  
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <TabsList className="mb-4 md:mb-0">
                  <TabsTrigger value="profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profil
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Einstellungen
                  </TabsTrigger>
                </TabsList>
                
                <Button 
                  variant="outline" 
                  className="text-red-500 border-red-200 hover:bg-red-50"
                  onClick={async () => {
                    setIsLoggingOut(true);
                    await logout();
                    setIsLoggingOut(false);
                  }}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="mr-2 h-4 w-4" />
                  )}
                  Abmelden
                </Button>
              </div>
              
              <TabsContent value="profile">
                <BetterProfileForm />
              </TabsContent>
              
              <TabsContent value="settings">
                <AccountSettings />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
