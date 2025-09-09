import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Activity, 
  Shield, 
  PillBottle,
  Upload,
  Download,
  FolderSync,
  FileText,
  Database,
  Settings as SettingsIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from "lucide-react";
import { CoInfectionChart } from "@/components/charts/co-infection-chart";
import { ProvincialChart } from "@/components/charts/provincial-chart";
import { Link } from "wouter";
import type { 
  DashboardMetrics, 
  DataQualityIssuesResponse, 
  PatientsResponse 
} from "@shared/api-types";
import type { SystemIntegration } from "@shared/schema";

interface DataQualityIssueWithDate extends Omit<DataQualityIssuesResponse['issues'][0], 'createdAt'> {
  createdAt: string | Date;
}

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
    retry: false,
  });

  const { data: integrations } = useQuery<SystemIntegration[]>({
    queryKey: ["/api/integrations"],
    retry: false,
  });

  const { data: dataQualityIssues } = useQuery<DataQualityIssuesResponse>({
    queryKey: ["/api/data-quality/issues"],
    retry: false,
  });

  const { data: recentPatients } = useQuery<PatientsResponse>({
    queryKey: ["/api/patients", { limit: 5 }],
    retry: false,
  });

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString();
  };

  const getTbStatusDisplay = (status: string | null | undefined): string => {
    if (!status) return 'Not Set';
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Dashboard Overview</h2>
          <p className="text-muted-foreground">South Africa TB/HIV Co-infection Management</p>
        </div>
      </div>

      {/* Key Metrics Section */}
      <section className="data-grid">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-total-patients">
              {metrics?.totalPatients?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              Active patient records in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TB/HIV Co-infections</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-co-infections">
              {metrics?.coInfections?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-accent font-medium">
                {metrics?.totalPatients ? 
                  Math.round((metrics.coInfections / metrics.totalPatients) * 100) : 0}% co-infection rate
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-data-quality">
              {metrics?.dataQualityScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-secondary font-medium">
                System data integrity
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Treatments</CardTitle>
            <PillBottle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-active-treatments">
              {metrics?.activeTreatments?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-secondary font-medium">
                Ongoing treatment protocols
              </span>
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Integration Status and Data Quality */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Integration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrations?.map((integration) => (
                <div key={integration.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
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
                    <div>
                      <p className="font-medium">{integration.systemName}</p>
                      <p className="text-sm text-muted-foreground">
                        {integration.lastSync ? 
                          `Last sync: ${formatDate(integration.lastSync)}` :
                          "Never synced"
                        }
                      </p>
                    </div>
                  </div>
                  <Badge variant={
                    integration.status === "connected" ? "default" :
                    integration.status === "syncing" ? "secondary" :
                    integration.status === "limited" ? "outline" : "destructive"
                  }>
                    {integration.status}
                  </Badge>
                </div>
              )) || (
                <div className="text-center text-muted-foreground py-4">
                  Loading integration status...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Data Quality Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dataQualityIssues?.issues?.slice(0, 3).map((issue) => (
                <div 
                  key={issue.id} 
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${
                    issue.severity === "critical" ? "bg-destructive/10 border-destructive/20" :
                    issue.severity === "high" ? "bg-accent/10 border-accent/20" :
                    "bg-secondary/10 border-secondary/20"
                  }`}
                >
                  {issue.severity === "critical" ? (
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                  ) : issue.isResolved ? (
                    <CheckCircle className="h-4 w-4 text-secondary mt-0.5" />
                  ) : (
                    <Clock className="h-4 w-4 text-accent mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{issue.issueType.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground truncate">{issue.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(issue.createdAt)}
                    </p>
                  </div>
                </div>
              )) || (
                <div className="text-center text-muted-foreground py-4">
                  No recent alerts
                </div>
              )}
            </div>
            
            <Link href="/data-quality">
              <Button className="w-full mt-4" variant="outline" data-testid="button-view-quality-report">
                View Full Quality Report
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Recent Patient Activity */}
      <section>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Patient Activity</CardTitle>
            <div className="flex space-x-2">
              <Link href="/patients">
                <Button variant="secondary" size="sm" data-testid="button-add-patient">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Patients
                </Button>
              </Link>
              <Button variant="outline" size="sm" data-testid="button-import-data">
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Patient ID</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Age</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">TB Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">HIV Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Last Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentPatients?.patients?.map((patient) => (
                    <tr key={patient.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-sm">{patient.patientId}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                          <p className="text-sm text-muted-foreground">{patient.gender}, DOB: {formatDate(patient.dateOfBirth)}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={
                          patient.tbStatus === "confirmed" ? "destructive" :
                          patient.tbStatus === "active_treatment" ? "default" :
                          patient.tbStatus === "treatment_complete" ? "secondary" :
                          "outline"
                        }>
                          {getTbStatusDisplay(patient.tbStatus)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={
                          patient.hivStatus === "positive" ? "destructive" :
                          patient.hivStatus === "negative" ? "secondary" :
                          "outline"
                        }>
                          {patient.hivStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {formatDate(patient.lastUpdated)}
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No patients found. <Link href="/patients" className="text-primary hover:underline">Add your first patient</Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Analytics Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>TB/HIV Co-infection Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <CoInfectionChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Provincial Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ProvincialChart />
          </CardContent>
        </Card>
      </section>

      {/* Quick Actions */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions & Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Button variant="outline" className="flex flex-col h-20 space-y-2" data-testid="button-export-tier-net">
                <Download className="h-5 w-5" />
                <span className="text-xs">Export TIER.Net</span>
              </Button>
              
              <Button variant="outline" className="flex flex-col h-20 space-y-2" data-testid="button-sync-nhls">
                <FolderSync className="h-5 w-5" />
                <span className="text-xs">FolderSync NHLS</span>
              </Button>
              
              <Link href="/data-quality">
                <Button variant="outline" className="flex flex-col h-20 space-y-2 w-full" data-testid="button-data-validation">
                  <Shield className="h-5 w-5" />
                  <span className="text-xs">Data Validation</span>
                </Button>
              </Link>
              
              <Link href="/reports">
                <Button variant="outline" className="flex flex-col h-20 space-y-2 w-full" data-testid="button-who-reports">
                  <FileText className="h-5 w-5" />
                  <span className="text-xs">WHO Reports</span>
                </Button>
              </Link>
              
              <Button variant="outline" className="flex flex-col h-20 space-y-2" data-testid="button-backup-data">
                <Database className="h-5 w-5" />
                <span className="text-xs">Backup Data</span>
              </Button>
              
              <Link href="/settings">
                <Button variant="outline" className="flex flex-col h-20 space-y-2 w-full" data-testid="button-fhir-config">
                  <SettingsIcon className="h-5 w-5" />
                  <span className="text-xs">FHIR Config</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
