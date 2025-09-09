import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Clock,
  Database,
  Settings as SettingsIcon,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { SystemIntegration } from "@shared/schema";

export default function DataIntegration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: integrations, isLoading } = useQuery<SystemIntegration[]>({
    queryKey: ["/api/integrations"],
    retry: false,
  });

  const syncMutation = useMutation({
    mutationFn: async (systemId: string) => {
      await apiRequest("POST", `/api/integrations/${systemId}/sync`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({
        title: "Success",
        description: "Sync initiated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-5 w-5 text-secondary" />;
      case "syncing":
        return <RefreshCw className="h-5 w-5 text-chart-1 animate-spin" />;
      case "limited":
        return <AlertTriangle className="h-5 w-5 text-accent" />;
      case "error":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "secondary";
      case "syncing":
        return "default";
      case "limited":
        return "outline";
      case "error":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading integration status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Data Integration</h2>
          <p className="text-muted-foreground">Manage connections to TIER.Net, EDRWeb, NHLS, and private labs</p>
        </div>
        <Button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/integrations"] })}
          data-testid="button-refresh-integrations"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      {/* Integration Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <CheckCircle className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations?.filter(i => i.status === "connected").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Systems operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Syncing</CardTitle>
            <RefreshCw className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations?.filter(i => i.status === "syncing").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Data synchronization active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Limited Access</CardTitle>
            <AlertTriangle className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations?.filter(i => i.status === "limited").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Partial connectivity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations?.filter(i => i.status === "error").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Systems requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>System Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {integrations?.map((integration) => (
              <div key={integration.id} className="border border-border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(integration.status)}
                    <div>
                      <h3 className="text-lg font-semibold">{integration.systemName}</h3>
                      <Badge variant={getStatusColor(integration.status) as any} className="mt-1">
                        {integration.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {integration.status === "connected" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncMutation.mutate(integration.id)}
                        disabled={syncMutation.isPending}
                        data-testid={`button-sync-${integration.systemName.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Now
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid={`button-configure-${integration.systemName.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <SettingsIcon className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Last Sync: {integration.lastSync ? 
                        new Date(integration.lastSync).toLocaleString() : 
                        "Never"
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Next Sync: {integration.nextSync ? 
                        new Date(integration.nextSync).toLocaleString() : 
                        "Not scheduled"
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Records Synced: {integration.syncedRecords?.toLocaleString() || 0}
                    </div>
                  </div>
                  
                  {integration.status === "syncing" && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Sync Progress</div>
                      <Progress value={65} className="w-full" />
                      <div className="text-xs text-muted-foreground">Syncing patient records...</div>
                    </div>
                  )}
                  
                  {integration.errorMessage && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-destructive">Error Details</div>
                      <div className="text-sm text-muted-foreground bg-destructive/10 p-2 rounded">
                        {integration.errorMessage}
                      </div>
                    </div>
                  )}
                </div>

                {/* System-specific information */}
                <div className="mt-4 pt-4 border-t border-border">
                  {integration.systemName === "TIER.Net" && (
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2 mb-2">
                        <Database className="h-4 w-4" />
                        <span>National TB/HIV treatment database</span>
                      </div>
                      <div>Provides patient treatment records, medication adherence, and outcome data</div>
                    </div>
                  )}
                  
                  {integration.systemName === "NHLS" && (
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2 mb-2">
                        <Database className="h-4 w-4" />
                        <span>National Health Laboratory Service</span>
                      </div>
                      <div>CD4 counts, viral load tests, GeneXpert MTB/RIF results via TrakCare/DisaLab systems</div>
                    </div>
                  )}
                  
                  {integration.systemName === "EDRWeb" && (
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2 mb-2">
                        <Database className="h-4 w-4" />
                        <span>Electronic Drug-Resistant TB Register</span>
                      </div>
                      <div>Drug-resistant TB case management and treatment monitoring</div>
                    </div>
                  )}
                  
                  {integration.systemName.includes("Private") && (
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2 mb-2">
                        <Database className="h-4 w-4" />
                        <span>Private Laboratory Network</span>
                      </div>
                      <div>FHIR/HL7 integration with private labs (Lancet, Ampath) for TB/HIV test results</div>
                    </div>
                  )}
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-muted-foreground">
                No integrations configured. Contact your system administrator.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* FHIR Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>FHIR API Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <div className="font-medium">Patient Resources</div>
                <div className="text-sm text-muted-foreground">/fhir/Patient</div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">R4</Badge>
                <Button variant="ghost" size="sm" data-testid="button-test-fhir-patients">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Test
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <div className="font-medium">Observation Resources</div>
                <div className="text-sm text-muted-foreground">/fhir/Observation</div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Coming Soon</Badge>
                <Button variant="ghost" size="sm" disabled>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Test
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <div className="font-medium">MedicationRequest Resources</div>
                <div className="text-sm text-muted-foreground">/fhir/MedicationRequest</div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Coming Soon</Badge>
                <Button variant="ghost" size="sm" disabled>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Test
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
