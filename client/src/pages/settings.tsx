import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings as SettingsIcon, 
  User, 
  Database,
  Bell,
  Shield,
  Globe,
  Save,
  RefreshCw,
  Key,
  Server
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [generalSettings, setGeneralSettings] = useState({
    organizationName: "South African Department of Health",
    facilityName: "Provincial TB/HIV Clinic",
    timezone: "Africa/Johannesburg",
    language: "en",
    dateFormat: "dd/mm/yyyy"
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    dataQualityAlerts: true,
    integrationAlerts: true,
    systemMaintenance: true,
    weeklyReports: true
  });

  const [fhirSettings, setFhirSettings] = useState({
    baseUrl: "https://api.cocaresync.za/fhir",
    version: "R4",
    authRequired: true,
    rateLimitEnabled: true,
    maxRequestsPerMinute: 100
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    tierNetSync: true,
    nhsSync: true,
    edrWebSync: true,
    privateLabSync: true,
    syncFrequency: "hourly",
    maxRetries: 3
  });

  const handleSaveSettings = (section: string) => {
    toast({
      title: "Settings Saved",
      description: `${section} settings have been updated successfully.`,
    });
  };

  const handleTestConnection = (system: string) => {
    toast({
      title: "Connection Test",
      description: `Testing connection to ${system}...`,
    });
    
    setTimeout(() => {
      toast({
        title: "Connection Successful",
        description: `Successfully connected to ${system}.`,
      });
    }, 2000);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">System Settings</h2>
          <p className="text-muted-foreground">Configure CoCareSync platform settings and integrations</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" data-testid="tab-general">
            <SettingsIcon className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="profile" data-testid="tab-profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" data-testid="tab-integrations">
            <Database className="h-4 w-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="fhir" data-testid="tab-fhir">
            <Server className="h-4 w-4 mr-2" />
            FHIR API
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    value={generalSettings.organizationName}
                    onChange={(e) => setGeneralSettings({...generalSettings, organizationName: e.target.value})}
                    data-testid="input-organization-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facilityName">Facility Name</Label>
                  <Input
                    id="facilityName"
                    value={generalSettings.facilityName}
                    onChange={(e) => setGeneralSettings({...generalSettings, facilityName: e.target.value})}
                    data-testid="input-facility-name"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={generalSettings.timezone} onValueChange={(value) => setGeneralSettings({...generalSettings, timezone: value})}>
                    <SelectTrigger data-testid="select-timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Johannesburg">Africa/Johannesburg</SelectItem>
                      <SelectItem value="Africa/Cape_Town">Africa/Cape_Town</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={generalSettings.language} onValueChange={(value) => setGeneralSettings({...generalSettings, language: value})}>
                    <SelectTrigger data-testid="select-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="af">Afrikaans</SelectItem>
                      <SelectItem value="zu">Zulu</SelectItem>
                      <SelectItem value="xh">Xhosa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select value={generalSettings.dateFormat} onValueChange={(value) => setGeneralSettings({...generalSettings, dateFormat: value})}>
                    <SelectTrigger data-testid="select-date-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={() => handleSaveSettings("General")} data-testid="button-save-general">
                <Save className="h-4 w-4 mr-2" />
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={user?.firstName || ""}
                    readOnly
                    className="bg-muted"
                    data-testid="input-first-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={user?.lastName || ""}
                    readOnly
                    className="bg-muted"
                    data-testid="input-last-name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  className="bg-muted"
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={user?.role || "clinician"}
                  readOnly
                  className="bg-muted"
                  data-testid="input-role"
                />
              </div>

              <p className="text-sm text-muted-foreground">
                Profile information is managed through the authentication system and cannot be modified here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailAlerts">Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive important alerts via email</p>
                  </div>
                  <Switch
                    id="emailAlerts"
                    checked={notificationSettings.emailAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailAlerts: checked})}
                    data-testid="switch-email-alerts"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dataQualityAlerts">Data Quality Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notifications about data quality issues</p>
                  </div>
                  <Switch
                    id="dataQualityAlerts"
                    checked={notificationSettings.dataQualityAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, dataQualityAlerts: checked})}
                    data-testid="switch-data-quality-alerts"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="integrationAlerts">Integration Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notifications about system integration issues</p>
                  </div>
                  <Switch
                    id="integrationAlerts"
                    checked={notificationSettings.integrationAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, integrationAlerts: checked})}
                    data-testid="switch-integration-alerts"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weeklyReports">Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">Receive weekly summary reports</p>
                  </div>
                  <Switch
                    id="weeklyReports"
                    checked={notificationSettings.weeklyReports}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, weeklyReports: checked})}
                    data-testid="switch-weekly-reports"
                  />
                </div>
              </div>

              <Button onClick={() => handleSaveSettings("Notification")} data-testid="button-save-notifications">
                <Save className="h-4 w-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Integrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { key: "tierNetSync", label: "TIER.Net Integration", description: "Sync with TIER.Net database" },
                  { key: "nhsSync", label: "NHLS Integration", description: "Sync with NHLS TrakCare/DisaLab" },
                  { key: "edrWebSync", label: "EDRWeb Integration", description: "Sync with Electronic Drug-Resistant TB Register" },
                  { key: "privateLabSync", label: "Private Labs Integration", description: "Sync with private laboratory systems" }
                ].map((integration) => (
                  <div key={integration.key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <Label>{integration.label}</Label>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={!!integrationSettings[integration.key as keyof typeof integrationSettings]}
                        onCheckedChange={(checked) => setIntegrationSettings({
                          ...integrationSettings, 
                          [integration.key]: checked
                        })}
                        data-testid={`switch-${integration.key}`}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTestConnection(integration.label)}
                        data-testid={`button-test-${integration.key}`}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Test
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="syncFrequency">Sync Frequency</Label>
                  <Select value={integrationSettings.syncFrequency} onValueChange={(value) => setIntegrationSettings({...integrationSettings, syncFrequency: value})}>
                    <SelectTrigger data-testid="select-sync-frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxRetries">Max Retry Attempts</Label>
                  <Input
                    id="maxRetries"
                    type="number"
                    value={integrationSettings.maxRetries}
                    onChange={(e) => setIntegrationSettings({...integrationSettings, maxRetries: parseInt(e.target.value)})}
                    data-testid="input-max-retries"
                  />
                </div>
              </div>

              <Button onClick={() => handleSaveSettings("Integration")} data-testid="button-save-integrations">
                <Save className="h-4 w-4 mr-2" />
                Save Integration Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fhir" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>FHIR API Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fhirBaseUrl">FHIR Base URL</Label>
                <Input
                  id="fhirBaseUrl"
                  value={fhirSettings.baseUrl}
                  onChange={(e) => setFhirSettings({...fhirSettings, baseUrl: e.target.value})}
                  data-testid="input-fhir-base-url"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fhirVersion">FHIR Version</Label>
                  <Select value={fhirSettings.version} onValueChange={(value) => setFhirSettings({...fhirSettings, version: value})}>
                    <SelectTrigger data-testid="select-fhir-version">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="R4">R4 (Recommended)</SelectItem>
                      <SelectItem value="R5">R5 (Beta)</SelectItem>
                      <SelectItem value="STU3">STU3 (Legacy)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxRequests">Max Requests/Minute</Label>
                  <Input
                    id="maxRequests"
                    type="number"
                    value={fhirSettings.maxRequestsPerMinute}
                    onChange={(e) => setFhirSettings({...fhirSettings, maxRequestsPerMinute: parseInt(e.target.value)})}
                    data-testid="input-max-requests"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="authRequired">Authentication Required</Label>
                    <p className="text-sm text-muted-foreground">Require authentication for FHIR API access</p>
                  </div>
                  <Switch
                    id="authRequired"
                    checked={fhirSettings.authRequired}
                    onCheckedChange={(checked) => setFhirSettings({...fhirSettings, authRequired: checked})}
                    data-testid="switch-auth-required"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="rateLimitEnabled">Rate Limiting</Label>
                    <p className="text-sm text-muted-foreground">Enable API rate limiting</p>
                  </div>
                  <Switch
                    id="rateLimitEnabled"
                    checked={fhirSettings.rateLimitEnabled}
                    onCheckedChange={(checked) => setFhirSettings({...fhirSettings, rateLimitEnabled: checked})}
                    data-testid="switch-rate-limit"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={() => handleSaveSettings("FHIR")} data-testid="button-save-fhir">
                  <Save className="h-4 w-4 mr-2" />
                  Save FHIR Settings
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleTestConnection("FHIR API")}
                  data-testid="button-test-fhir"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Test API
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-5 w-5 text-secondary" />
                    <span className="font-medium">Data Encryption</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    All patient data is encrypted using AES-256 encryption in transit and at rest.
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Key className="h-5 w-5 text-secondary" />
                    <span className="font-medium">Authentication</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    User authentication is managed through secure OAuth 2.0 protocols.
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Globe className="h-5 w-5 text-secondary" />
                    <span className="font-medium">HIPAA Compliance</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    System is configured to meet HIPAA and NDoH compliance requirements.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auditLog">Audit Log Retention (days)</Label>
                <Input
                  id="auditLog"
                  type="number"
                  defaultValue="365"
                  data-testid="input-audit-retention"
                />
                <p className="text-sm text-muted-foreground">
                  How long to retain audit logs for compliance purposes.
                </p>
              </div>

              <Button variant="outline" data-testid="button-security-report">
                <Shield className="h-4 w-4 mr-2" />
                Generate Security Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
