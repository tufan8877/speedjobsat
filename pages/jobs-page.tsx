import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobList } from "@/components/jobs/job-list";
import { MyJobs } from "@/components/jobs/my-jobs";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlusCircle, Home, ChevronRight } from "lucide-react";

/**
 * Seite für alle Auftragsfunktionen
 * - Auftragsübersicht (öffentlich)
 * - Meine Aufträge (nur für angemeldete Benutzer)
 */
export default function JobsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(user ? "my-jobs" : "all-jobs");
  
  return (
    <div className="container py-8">
      {/* Breadcrumb für einfache Navigation */}
      <div className="flex items-center mb-4 text-sm">
        <Link href="/">
          <Button variant="link" className="p-0 h-auto">
            <Home className="h-4 w-4 mr-1" />
            Startseite
          </Button>
        </Link>
        <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
        <span className="text-muted-foreground">Aufträge</span>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Hilfsgesuche</h1>
          <p className="text-muted-foreground mt-1">
            Durchsuchen Sie Hilfsgesuche oder erstellen Sie Ihr eigenes.
          </p>
          {!user && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Tipp:</span> Um einen eigenen Auftrag zu erstellen, müssen Sie sich <Link href="/auth"><span className="underline cursor-pointer">registrieren oder anmelden</span></Link>.
              </p>
            </div>
          )}
        </div>
        
        {user && (
          <Link href="/auftrag-erstellen">
            <Button className="w-full md:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Neuen Auftrag erstellen
            </Button>
          </Link>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="all-jobs">Alle Aufträge</TabsTrigger>
          {user && <TabsTrigger value="my-jobs">Meine Aufträge</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="all-jobs">
          <JobList />
        </TabsContent>
        
        {user && (
          <TabsContent value="my-jobs">
            <MyJobs />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}