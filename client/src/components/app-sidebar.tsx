import { BarChart3, Users, RefreshCw, TrendingUp, Shield, FileText, Settings, Activity } from "lucide-react";
import { useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { SystemIntegration } from "@shared/schema";

interface SystemIntegrationStatus {
  id: string;
  systemName: string;
  status: 'connected' | 'syncing' | 'limited' | 'error';
}

interface IntegrationsResponse {
  integrations: SystemIntegrationStatus[];
}

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: BarChart3,
  },
  {
    title: "Patient Management",
    url: "/patients",
    icon: Users,
  },
  {
    title: "Data Integration",
    url: "/data-integration",
    icon: RefreshCw,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: TrendingUp,
  },
  {
    title: "Data Quality",
    url: "/data-quality",
    icon: Shield,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileText,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  const { data: integrationsData } = useQuery<IntegrationsResponse>({
    queryKey: ["/api/integrations"],
    retry: false,
  });

  const integrations = integrationsData?.integrations || [];

  return (
    <Sidebar>
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">CoCareSync</h1>
            <p className="text-sm text-muted-foreground">TB/HIV Platform</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <a href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium text-sm mb-2">System Status</h4>
            <div className="space-y-2 text-sm">
              {integrations.map((integration: SystemIntegrationStatus) => (
                <div key={integration.id} className="flex items-center">
                  <span
                    className={`status-indicator ${
                      integration.status === "connected" 
                        ? "status-active" 
                        : integration.status === "syncing" 
                        ? "status-sync"
                        : integration.status === "limited"
                        ? "status-warning"
                        : "status-error"
                    }`}
                  />
                  <span className="text-xs">
                    {integration.systemName} {integration.status === "connected" ? "Connected" : 
                     integration.status === "syncing" ? "Syncing" :
                     integration.status === "limited" ? "Limited" : "Error"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </SidebarFooter>
    </Sidebar>
  );
}
