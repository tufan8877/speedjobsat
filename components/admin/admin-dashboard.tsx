import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/ui/star-rating";
import { Loader2, UserX, Lock, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDate } from "@/lib/utils";

const banEmailSchema = z.object({
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  reason: z.string().min(1, "Bitte geben Sie einen Grund an"),
});

type BanEmailFormValues = z.infer<typeof banEmailSchema>;

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("users");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [deleteType, setDeleteType] = useState<"user" | "review" | "unban" | "job" | "profile">("user");
  
  // Ban email form
  const banEmailForm = useForm<BanEmailFormValues>({
    resolver: zodResolver(banEmailSchema),
    defaultValues: {
      email: "",
      reason: "",
    },
  });
  
  // Fetch all users
  const { 
    data: users,
    isLoading: isLoadingUsers
  } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: activeTab === "users",
  });
  
  // Fetch all profiles
  const {
    data: profiles,
    isLoading: isLoadingProfiles
  } = useQuery({
    queryKey: ["/api/admin/profiles"],
    enabled: activeTab === "profiles",
  });
  
  // Fetch reviews
  const {
    data: reviews,
    isLoading: isLoadingReviews
  } = useQuery({
    queryKey: ["/api/admin/reviews"],
    enabled: activeTab === "reviews",
  });

  // Fetch banned emails
  const {
    data: bannedEmails,
    isLoading: isLoadingBannedEmails
  } = useQuery({
    queryKey: ["/api/admin/banned-emails"],
    enabled: activeTab === "banned",
  });

  // Fetch all jobs
  const {
    data: jobs,
    isLoading: isLoadingJobs
  } = useQuery({
    queryKey: ["/api/admin/jobs"],
    enabled: activeTab === "jobs",
  });

  // Debug: Log jobs data
  if (jobs) {
    console.log("Empfangene Jobs-Daten:", jobs);
  }
  
  // Ban user mutation
  const banUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: number, reason: string }) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/ban`, { reason });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Benutzer gesperrt",
        description: "Der Benutzer wurde erfolgreich gesperrt.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fehler beim Sperren",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Unban user mutation
  const unbanUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/unban`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Benutzer entsperrt",
        description: "Der Benutzer wurde erfolgreich entsperrt.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fehler beim Entsperren",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async ({ userId, banEmail }: { userId: number, banEmail: boolean }) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${userId}?banEmail=${banEmail}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banned-emails"] });
      toast({
        title: "Benutzer gelöscht",
        description: "Der Benutzer wurde erfolgreich gelöscht.",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Fehler beim Löschen",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/reviews/${reviewId}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      toast({
        title: "Bewertung gelöscht",
        description: "Die Bewertung wurde erfolgreich gelöscht.",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Fehler beim Löschen",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Ban email mutation
  const banEmailMutation = useMutation({
    mutationFn: async (data: BanEmailFormValues) => {
      const res = await apiRequest("POST", "/api/admin/ban-email", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banned-emails"] });
      toast({
        title: "E-Mail gesperrt",
        description: "Die E-Mail-Adresse wurde erfolgreich gesperrt.",
      });
      banEmailForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Fehler beim Sperren",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Unban email mutation
  const unbanEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/admin/unban-email", { email });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banned-emails"] });
      toast({
        title: "E-Mail entsperrt",
        description: "Die E-Mail-Adresse wurde erfolgreich entsperrt.",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Fehler beim Entsperren",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle ban email form submit
  const onBanEmailSubmit = (values: BanEmailFormValues) => {
    banEmailMutation.mutate(values);
  };
  
  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/jobs/${jobId}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      toast({
        title: "Auftrag gelöscht",
        description: "Der Auftrag wurde erfolgreich gelöscht.",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Fehler beim Löschen",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete profile mutation
  const deleteProfileMutation = useMutation({
    mutationFn: async (profileId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/profiles/${profileId}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/profiles"] });
      toast({
        title: "Profil gelöscht",
        description: "Das Profil wurde erfolgreich gelöscht.",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Fehler beim Löschen",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (!selectedItemId) return;
    
    if (deleteType === "user") {
      deleteUserMutation.mutate({ userId: selectedItemId, banEmail: true });
    } else if (deleteType === "review") {
      deleteReviewMutation.mutate(selectedItemId);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] }); // Bewertungen aktualisieren
    } else if (deleteType === "unban") {
      const email = bannedEmails?.find((e: any) => e.id === selectedItemId)?.email;
      if (email) {
        unbanEmailMutation.mutate(email);
      }
    } else if (deleteType === "job") {
      deleteJobMutation.mutate(selectedItemId);
    } else if (deleteType === "profile") {
      deleteProfileMutation.mutate(selectedItemId);
    }
  };
  
  // User columns for DataTable
  const userColumns = [
    { header: "ID", accessorKey: "id" },
    { header: "E-Mail", accessorKey: "email" },
    { 
      header: "Passwort", 
      accessorKey: "password",
      cell: (user) => (
        <div className="max-w-[200px] overflow-x-auto">
          <span className="font-mono text-xs break-all whitespace-nowrap">
            {user.password}
          </span>
        </div>
      )
    },
    { 
      header: "Status", 
      cell: (user) => (
        <Badge
          variant={
            user.status === "active" ? "success" : 
            user.status === "suspended" ? "destructive" : 
            "secondary"
          }
        >
          {user.status === "active" ? "Aktiv" : 
           user.status === "suspended" ? "Gesperrt" : 
           "Gelöscht"}
        </Badge>
      )
    },
    {
      header: "Admin",
      cell: (user) => (
        user.isAdmin ? (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        ) : "Nein"
      )
    },
    {
      header: "Registriert",
      cell: (user) => formatDate(user.createdAt)
    },
    {
      header: "Aktionen",
      cell: (user) => (
        <div className="flex space-x-2">
          {user.status === "active" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => banUserMutation.mutate({ userId: user.id, reason: "Vom Admin gesperrt" })}
              disabled={user.isAdmin}
            >
              <Lock className="h-4 w-4 mr-1" />
              Sperren
            </Button>
          ) : user.status === "suspended" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => unbanUserMutation.mutate(user.id)}
              disabled={user.isAdmin}
            >
              <ShieldCheck className="h-4 w-4 mr-1" />
              Entsperren
            </Button>
          ) : null}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setSelectedItemId(user.id);
              setDeleteType("user");
              setDeleteDialogOpen(true);
            }}
            disabled={user.isAdmin}
          >
            <UserX className="h-4 w-4 mr-1" />
            Löschen
          </Button>
        </div>
      )
    }
  ];
  
  // Profile columns for DataTable
  const profileColumns = [
    { header: "ID", accessorKey: "id" },
    {
      header: "Name",
      cell: (profile: any) => `${profile.firstName} ${profile.lastName}`
    },
    {
      header: "Dienstleistungen",
      cell: (profile: any) => {
        try {
          const services = typeof profile.services === 'string' ? JSON.parse(profile.services) : profile.services;
          return Array.isArray(services) ? services.join(", ") : "Keine";
        } catch {
          return "Keine";
        }
      }
    },
    {
      header: "Regionen",
      cell: (profile: any) => {
        try {
          const regions = typeof profile.regions === 'string' ? JSON.parse(profile.regions) : profile.regions;
          return Array.isArray(regions) ? regions.join(", ") : "Keine";
        } catch {
          return "Keine";
        }
      }
    },
    {
      header: "E-Mail",
      cell: (profile: any) => profile.email || "Keine"
    },
    {
      header: "Telefon",
      cell: (profile: any) => profile.phoneNumber || "Keine"
    },
    {
      header: "Aktionen",
      cell: (profile: any) => (
        <div className="flex space-x-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setSelectedItemId(profile.id);
              setDeleteType("profile");
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Löschen
          </Button>
        </div>
      )
    }
  ];


  



  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Admin-Dashboard</CardTitle>
          <CardDescription>
            Verwalten Sie Benutzer, Profile und gesperrte E-Mail-Adressen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="users">Benutzer</TabsTrigger>
              <TabsTrigger value="profiles">Profile</TabsTrigger>
              <TabsTrigger value="jobs">Aufträge</TabsTrigger>
              <TabsTrigger value="reviews">Bewertungen</TabsTrigger>
              <TabsTrigger value="banned">Gesperrte E-Mails</TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              <TabsContent value="users">
                {isLoadingUsers ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Alle Benutzer</h3>
                      <Badge variant="outline">
                        {Array.isArray(users) ? users.length : 0} Benutzer
                      </Badge>
                    </div>
                    {Array.isArray(users) && users.length > 0 ? (
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>E-Mail</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Admin</TableHead>
                              <TableHead>Erstellt</TableHead>
                              <TableHead>Aktionen</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {users.map((user: any) => (
                              <TableRow key={user.id}>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={user.status === 'active' ? 'default' : user.status === 'suspended' ? 'destructive' : 'secondary'}
                                  >
                                    {user.status === 'active' ? 'Aktiv' : user.status === 'suspended' ? 'Gesperrt' : 'Gelöscht'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {user.isAdmin ? (
                                    <Badge variant="outline">Admin</Badge>
                                  ) : (
                                    <span className="text-muted-foreground">Nein</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {new Date(user.createdAt).toLocaleDateString('de-DE')}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    {!user.isAdmin && (
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedItemId(user.id);
                                          setDeleteType("user");
                                          setDeleteDialogOpen(true);
                                        }}
                                      >
                                        <UserX className="h-4 w-4 mr-1" />
                                        Löschen
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>Keine Benutzer gefunden</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="profiles">
                {isLoadingProfiles ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Alle Profile</h3>
                      <Badge variant="outline">
                        {Array.isArray(profiles) ? profiles.length : 0} Profile
                      </Badge>
                    </div>
                    {Array.isArray(profiles) && profiles.length > 0 ? (
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Dienstleistungen</TableHead>
                              <TableHead>Regionen</TableHead>
                              <TableHead>E-Mail</TableHead>
                              <TableHead>Telefon</TableHead>
                              <TableHead>Erstellt</TableHead>
                              <TableHead>Aktionen</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {profiles.map((profile: any) => (
                              <TableRow key={profile.id}>
                                <TableCell>{profile.id}</TableCell>
                                <TableCell>{`${profile.firstName} ${profile.lastName}`}</TableCell>
                                <TableCell>
                                  {(() => {
                                    try {
                                      const services = typeof profile.services === 'string' ? JSON.parse(profile.services) : profile.services;
                                      return Array.isArray(services) ? services.join(", ") : "Keine";
                                    } catch {
                                      return "Keine";
                                    }
                                  })()}
                                </TableCell>
                                <TableCell>
                                  {(() => {
                                    try {
                                      const regions = typeof profile.regions === 'string' ? JSON.parse(profile.regions) : profile.regions;
                                      return Array.isArray(regions) ? regions.join(", ") : "Keine";
                                    } catch {
                                      return "Keine";
                                    }
                                  })()}
                                </TableCell>
                                <TableCell>{profile.email || "Keine"}</TableCell>
                                <TableCell>{profile.phoneNumber || "Keine"}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {new Date(profile.createdAt).toLocaleDateString('de-DE')}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedItemId(profile.id);
                                      setDeleteType("profile");
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Löschen
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>Keine Profile gefunden</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="jobs">
                {isLoadingJobs ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Alle Aufträge</h3>
                      <Badge variant="outline">
                        {Array.isArray(jobs) ? jobs.length : 0} Aufträge
                      </Badge>
                    </div>
                    {Array.isArray(jobs) && jobs.length > 0 ? (
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Titel</TableHead>
                              <TableHead>Beschreibung</TableHead>
                              <TableHead>Ort</TableHead>
                              <TableHead>Kategorie</TableHead>
                              <TableHead>Benutzer-ID</TableHead>
                              <TableHead>Bilder</TableHead>
                              <TableHead>Erstellt</TableHead>
                              <TableHead>Aktionen</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {jobs.map((job: any) => (
                              <TableRow key={job.id}>
                                <TableCell>{job.id}</TableCell>
                                <TableCell className="max-w-[150px] truncate">
                                  {job.title}
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                  {job.description}
                                </TableCell>
                                <TableCell>{job.location}</TableCell>
                                <TableCell>{job.category}</TableCell>
                                <TableCell>{job.userId}</TableCell>
                                <TableCell>
                                  {job.images ? (
                                    <span className="text-sm text-muted-foreground">
                                      {JSON.parse(job.images || '[]').length} Bild(er)
                                    </span>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">Keine</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {new Date(job.createdAt).toLocaleDateString('de-DE')}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedItemId(job.id);
                                      setDeleteType("job");
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Löschen
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>Keine Aufträge gefunden</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="reviews">
                {isLoadingReviews ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Alle Bewertungen</h3>
                      <Badge variant="outline">
                        {Array.isArray(reviews) ? reviews.length : 0} Bewertungen
                      </Badge>
                    </div>
                    {Array.isArray(reviews) && reviews.length > 0 ? (
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Profil-ID</TableHead>
                              <TableHead>Bewerter-ID</TableHead>
                              <TableHead>Bewertung</TableHead>
                              <TableHead>Kommentar</TableHead>
                              <TableHead>Erstellt</TableHead>
                              <TableHead>Aktionen</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reviews.map((review: any) => (
                              <TableRow key={review.id}>
                                <TableCell>{review.id}</TableCell>
                                <TableCell>{review.profileId}</TableCell>
                                <TableCell>{review.reviewerId}</TableCell>
                                <TableCell>{review.rating}/5</TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                  {review.comment}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString('de-DE')}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedItemId(review.id);
                                      setDeleteType("review");
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Löschen
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>Keine Bewertungen gefunden</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="banned">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-base">E-Mail-Adresse sperren</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...banEmailForm}>
                      <form 
                        onSubmit={banEmailForm.handleSubmit(onBanEmailSubmit)} 
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={banEmailForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>E-Mail-Adresse</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="beispiel@email.at" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={banEmailForm.control}
                            name="reason"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Grund</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Grund für die Sperrung" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Button 
                          type="submit"
                          disabled={banEmailMutation.isPending}
                        >
                          {banEmailMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sperrung wird durchgeführt...
                            </>
                          ) : (
                            <>
                              <Lock className="mr-2 h-4 w-4" />
                              E-Mail sperren
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
                
                {isLoadingBannedEmails ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Gesperrte E-Mail-Adressen</h3>
                      <Badge variant="outline">
                        {Array.isArray(bannedEmails) ? bannedEmails.length : 0} Gesperrt
                      </Badge>
                    </div>
                    {Array.isArray(bannedEmails) && bannedEmails.length > 0 ? (
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>E-Mail</TableHead>
                              <TableHead>Grund</TableHead>
                              <TableHead>Gesperrt am</TableHead>
                              <TableHead>Aktionen</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {bannedEmails.map((email: any) => (
                              <TableRow key={email.id}>
                                <TableCell>{email.id}</TableCell>
                                <TableCell>{email.email}</TableCell>
                                <TableCell>{email.reason || "Kein Grund angegeben"}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {new Date(email.createdAt).toLocaleDateString('de-DE')}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedItemId(email.id);
                                      setDeleteType("unban");
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <ShieldCheck className="h-4 w-4 mr-1" />
                                    Entsperren
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>Keine gesperrten E-Mail-Adressen gefunden</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteType === "user" ? "Benutzer löschen" : 
               deleteType === "review" ? "Bewertung löschen" : 
               "E-Mail entsperren"}
            </DialogTitle>
            <DialogDescription>
              {deleteType === "user" ? 
                "Sind Sie sicher, dass Sie diesen Benutzer löschen möchten? Alle zugehörigen Daten werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden." : 
               deleteType === "review" ? 
                "Sind Sie sicher, dass Sie diese Bewertung löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden." : 
                "Sind Sie sicher, dass Sie diese E-Mail-Adresse entsperren möchten?"}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={
                deleteUserMutation.isPending || 
                deleteReviewMutation.isPending ||
                unbanEmailMutation.isPending
              }
            >
              {(deleteUserMutation.isPending || 
                deleteReviewMutation.isPending || 
                unbanEmailMutation.isPending) ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Bestätigen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
