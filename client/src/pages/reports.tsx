import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Download, 
  Calendar,
  BarChart3,
  Users,
  TrendingUp,
  Globe,
  Building,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState("");
  const [timeRange, setTimeRange] = useState("monthly");
  const [province, setProvince] = useState("all");
  
  const { toast } = useToast();

  const reportTypes = [
    {
      id: "who-tb-report",
      title: "WHO TB Report",
      description: "Standardized tuberculosis case notification and treatment outcome report",
      icon: Globe,
      category: "WHO Reports",
      frequency: "Quarterly"
    },
    {
      id: "who-hiv-report",
      title: "WHO HIV Report",
      description: "HIV testing, care, and treatment progress report",
      icon: Globe,
      category: "WHO Reports",
      frequency: "Quarterly"
    },
    {
      id: "ndoh-tb-summary",
      title: "NDoH TB Summary",
      description: "National Department of Health tuberculosis surveillance summary",
      icon: Building,
      category: "NDoH Reports",
      frequency: "Monthly"
    },
    {
      id: "ndoh-hiv-summary",
      title: "NDoH HIV Summary",
      description: "National HIV program monitoring and evaluation report",
      icon: Building,
      category: "NDoH Reports",
      frequency: "Monthly"
    },
    {
      id: "co-infection-analysis",
      title: "TB/HIV Co-infection Analysis",
      description: "Comprehensive analysis of TB/HIV co-infection rates and outcomes",
      icon: TrendingUp,
      category: "Analytics",
      frequency: "On-demand"
    },
    {
      id: "treatment-outcomes",
      title: "Treatment Outcomes Report",
      description: "Patient treatment success rates and outcome analysis",
      icon: BarChart3,
      category: "Analytics",
      frequency: "Quarterly"
    },
    {
      id: "patient-summary",
      title: "Patient Management Summary",
      description: "Patient enrollment, demographics, and care cascade report",
      icon: Users,
      category: "Operations",
      frequency: "Monthly"
    },
    {
      id: "data-quality-report",
      title: "Data Quality Report",
      description: "Data completeness, accuracy, and quality assessment",
      icon: FileText,
      category: "Operations",
      frequency: "Weekly"
    }
  ];

  const provinces = [
    "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", 
    "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"
  ];

  const handleGenerateReport = async (reportId: string) => {
    try {
      // This would typically make an API call to generate the report
      toast({
        title: "Report Generated",
        description: "Your report has been generated and will be downloaded shortly.",
      });
      
      // Simulate download
      const reportType = reportTypes.find(r => r.id === reportId);
      const filename = `${reportType?.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // In a real implementation, this would download the actual generated report
      console.log(`Generating report: ${filename}`);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleScheduleReport = (reportId: string) => {
    toast({
      title: "Report Scheduled",
      description: "This report has been added to your scheduled reports.",
    });
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Reports & Analytics</h2>
          <p className="text-muted-foreground">Generate WHO, NDoH, and operational reports for TB/HIV programs</p>
        </div>
      </div>

      {/* Report Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]" data-testid="select-time-range">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger className="w-[180px]" data-testid="select-province">
                <SelectValue placeholder="Province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Provinces</SelectItem>
                {provinces.map((prov) => (
                  <SelectItem key={prov} value={prov.toLowerCase().replace(/\s+/g, '-')}>
                    {prov}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" data-testid="button-bulk-generate">
              <Download className="h-4 w-4 mr-2" />
              Bulk Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Categories */}
      {["WHO Reports", "NDoH Reports", "Analytics", "Operations"].map((category) => (
        <div key={category}>
          <h3 className="text-lg font-semibold mb-4">{category}</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.filter(report => report.category === category).map((report) => {
              const IconComponent = report.icon;
              return (
                <Card key={report.id} className="hover-elevate">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <IconComponent className="h-6 w-6 text-primary" />
                      <Badge variant="outline" className="text-xs">
                        {report.frequency}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {report.description}
                    </p>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleGenerateReport(report.id)}
                        data-testid={`button-generate-${report.id}`}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleScheduleReport(report.id)}
                        data-testid={`button-schedule-${report.id}`}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                name: "WHO TB Report Q4 2024",
                type: "WHO TB Report",
                generated: "2024-12-15T10:30:00Z",
                size: "2.4 MB",
                status: "completed"
              },
              {
                name: "NDoH HIV Summary December 2024",
                type: "NDoH HIV Summary",
                generated: "2024-12-14T14:15:00Z",
                size: "1.8 MB",
                status: "completed"
              },
              {
                name: "Co-infection Analysis November 2024",
                type: "TB/HIV Co-infection Analysis",
                generated: "2024-12-13T09:45:00Z",
                size: "3.2 MB",
                status: "completed"
              },
              {
                name: "Data Quality Report Week 50",
                type: "Data Quality Report",
                generated: "2024-12-12T16:20:00Z",
                size: "945 KB",
                status: "completed"
              }
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{report.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {report.type} • {new Date(report.generated).toLocaleDateString()} • {report.size}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">Completed</Badge>
                  <Button size="sm" variant="ghost" data-testid={`button-download-${index}`}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                name: "WHO TB Report",
                schedule: "Every quarter (1st of Jan, Apr, Jul, Oct)",
                nextRun: "2025-01-01T00:00:00Z",
                recipients: "tb-program@health.gov.za"
              },
              {
                name: "NDoH HIV Summary",
                schedule: "Monthly (1st of each month)",
                nextRun: "2025-01-01T00:00:00Z",
                recipients: "hiv-program@health.gov.za"
              },
              {
                name: "Data Quality Report",
                schedule: "Weekly (Mondays at 8:00 AM)",
                nextRun: "2024-12-23T08:00:00Z",
                recipients: "data-team@health.gov.za"
              }
            ].map((schedule, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{schedule.name}</div>
                    <div className="text-sm text-muted-foreground">{schedule.schedule}</div>
                    <div className="text-sm text-muted-foreground">
                      Next run: {new Date(schedule.nextRun).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">Active</Badge>
                  <Button size="sm" variant="ghost" data-testid={`button-edit-schedule-${index}`}>
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <Button className="w-full mt-4" variant="outline" data-testid="button-add-schedule">
            <Clock className="h-4 w-4 mr-2" />
            Add New Schedule
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
