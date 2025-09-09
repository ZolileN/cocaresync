import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Patients from "@/pages/patients";
import DataIntegration from "@/pages/data-integration";
import Analytics from "@/pages/analytics";
import DataQuality from "@/pages/data-quality";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/patients" component={Patients} />
          <Route path="/data-integration" component={DataIntegration} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/data-quality" component={DataQuality} />
          <Route path="/reports" component={Reports} />
          <Route path="/settings" component={Settings} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (isLoading || !isAuthenticated) {
    return (
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar />
            <div className="flex flex-col flex-1">
              <header className="flex items-center justify-between p-4 border-b bg-card">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">CoCareSync</h2>
                    <p className="text-muted-foreground">TB/HIV Co-infection Management</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="search"
                      placeholder="Search patients..."
                      className="pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-64"
                      data-testid="input-global-search"
                    />
                    <svg
                      className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    data-testid="button-notifications"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-xs text-destructive-foreground flex items-center justify-center">
                      3
                    </span>
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || ""} />
                          <AvatarFallback>
                            {user?.firstName?.[0] || ""}{user?.lastName?.[0] || ""}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuItem
                        onClick={() => window.location.href = "/api/logout"}
                        data-testid="button-logout"
                      >
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </header>
              <main className="flex-1 overflow-hidden">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
