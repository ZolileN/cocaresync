import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { DataQualityIssuesResponse } from "@shared/api-types";

export default function DataQuality() {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: issuesData, isLoading } = useQuery<DataQualityIssuesResponse>({
    queryKey: ["/api/data-quality/issues", { 
      page, 
      limit, 
      severity: severityFilter,
      isResolved: statusFilter === "resolved" ? true : statusFilter === "unresolved" ? false : undefined
    }],
    retry: false,
  });

  const resolveIssueMutation = useMutation({
    mutationFn: async (issueId: string) => {
      await apiRequest("PUT", `/api/data-quality/issues/${issueId}/resolve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/data-quality/issues"] });
      toast({
        title: "Success",
        description: "Issue resolved successfully",
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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-accent" />;
      case "medium":
        return <Clock className="h-4 w-4 text-chart-3" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-secondary" />;
      default:
        return <Shield className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "outline";
      case "medium":
        return "secondary";
      case "low":
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Data Quality Management</h2>
          <p className="text-muted-foreground">Monitor and resolve data quality issues across TB/HIV records</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/data-quality/issues"] })}
            data-testid="button-refresh-issues"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" data-testid="button-run-validation">
            <Shield className="h-4 w-4 mr-2" />
            Run Validation
          </Button>
          <Button variant="outline" data-testid="button-export-report">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Quality Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Quality Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-secondary">↗ 2.1%</span> improvement this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {issuesData?.issues?.filter(i => i.severity === "critical" && !i.isResolved).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Requiring immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Data quality improvements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Completeness</CardTitle>
            <CheckCircle className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">97.8%</div>
            <p className="text-xs text-muted-foreground">
              Required fields populated
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search issues by description or patient ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-issues"
                />
              </div>
            </div>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[150px]" data-testid="select-severity">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]" data-testid="select-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Issues</SelectItem>
                <SelectItem value="unresolved">Unresolved</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <Card>
        <CardHeader>
          <CardTitle>Data Quality Issues</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {issuesData?.issues?.map((issue) => (
                  <div 
                    key={issue.id} 
                    className={`border rounded-lg p-4 ${
                      issue.severity === "critical" ? "border-destructive/50 bg-destructive/5" :
                      issue.severity === "high" ? "border-accent/50 bg-accent/5" :
                      "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        {getSeverityIcon(issue.severity)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{issue.issueType.replace(/_/g, ' ')}</h4>
                            <Badge variant={getSeverityColor(issue.severity) as any}>
                              {issue.severity}
                            </Badge>
                            {issue.isResolved && (
                              <Badge variant="secondary">Resolved</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {issue.description}
                          </p>
                          {issue.field && (
                            <p className="text-xs text-muted-foreground">
                              Field: <code className="bg-muted px-1 rounded">{issue.field}</code>
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!issue.isResolved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveIssueMutation.mutate(issue.id)}
                            disabled={resolveIssueMutation.isPending}
                            data-testid={`button-resolve-${issue.id}`}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>

                    {issue.suggestedAction && (
                      <div className="bg-muted/50 rounded p-3 mb-3">
                        <div className="text-sm font-medium mb-1">Suggested Action:</div>
                        <div className="text-sm text-muted-foreground">{issue.suggestedAction}</div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div>
                        Created: {issue.createdAt ? new Date(issue.createdAt).toLocaleString() : 'N/A'}
                      </div>
                      {issue.resolvedAt && (
                        <div>
                          Resolved: {issue.resolvedAt ? new Date(issue.resolvedAt).toLocaleString() : 'N/A'}
                        </div>
                      )}
                    </div>
                  </div>
                )) || []}
              </div>

              {/* Pagination */}
              {issuesData && issuesData.total > limit && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, issuesData.total)} of {issuesData.total} issues
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      data-testid="button-previous-page"
                    >
                      Previous
                    </Button>
                    <div className="flex space-x-1">
                      {Array.from({ length: issuesData.totalPages }, (_, i) => i + 1)
                        .slice(Math.max(0, page - 3), Math.min(issuesData.totalPages, page + 2))
                        .map((pageNum) => (
                          <Button
                            key={pageNum}
                            variant={pageNum === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                            data-testid={`button-page-${pageNum}`}
                          >
                            {pageNum}
                          </Button>
                        ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(issuesData.totalPages, p + 1))}
                      disabled={page === issuesData.totalPages}
                      data-testid="button-next-page"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {(!issuesData?.issues || issuesData.issues.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  {search || severityFilter || statusFilter ? 
                    "No issues match your current filters." :
                    "No data quality issues found. Great job maintaining data integrity!"
                  }
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Quality Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completeness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Patient Demographics</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                  <span className="text-sm font-medium">98%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">TB Diagnosis Data</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                  <span className="text-sm font-medium">94%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">HIV Test Results</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                  <span className="text-sm font-medium">87%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Date Consistency</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                  <span className="text-sm font-medium">96%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Value Validation</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  <span className="text-sm font-medium">92%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cross-system Consistency</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: '89%' }}></div>
                  </div>
                  <span className="text-sm font-medium">89%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Timeliness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Data Entry Timeliness</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full" style={{ width: '91%' }}></div>
                  </div>
                  <span className="text-sm font-medium">91%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Lab Result Updates</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-sm font-medium">85%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Treatment Updates</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full" style={{ width: '93%' }}></div>
                  </div>
                  <span className="text-sm font-medium">93%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
