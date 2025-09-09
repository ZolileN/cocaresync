import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart,
  Download,
  Calendar,
  MapPin,
  Users
} from "lucide-react";
import { CoInfectionChart } from "@/components/charts/co-infection-chart";
import { ProvincialChart } from "@/components/charts/provincial-chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import type { DashboardMetrics, AnalyticsResponse, ChartResponse, ProvincialStats } from "@shared/api-types";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("12m");
  const [selectedProvince, setSelectedProvince] = useState("all");

  const { data: metrics } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
    retry: false,
  });

  const { data: trends } = useQuery<ChartResponse>({
    queryKey: ["/api/dashboard/co-infection-trends"],
    retry: false,
  });

  const { data: provincial } = useQuery<ChartResponse>({
    queryKey: ["/api/dashboard/provincial-distribution"],
    retry: false,
  });

  const provinces = [
    "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", 
    "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"
  ];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Analytics Dashboard</h2>
          <p className="text-muted-foreground">TB/HIV co-infection trends and healthcare insights</p>
        </div>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]" data-testid="select-time-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
              <SelectItem value="24m">Last 24 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" data-testid="button-export-analytics">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Co-infection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.totalPatients ? 
                Math.round((metrics.coInfections / metrics.totalPatients) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-destructive">↗ 2.3%</span> vs national average of 61%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Treatment Success</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.4%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-secondary">↗ 4.1%</span> improvement this quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Case Finding Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-secondary">↗ 1.8%</span> early detection improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IPT Uptake</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">76.8%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-accent">↘ 0.5%</span> needs improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Monthly Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">New TB Cases</span>
                <div className="text-right">
                  <div className="font-medium">1,247</div>
                  <div className="text-xs text-secondary">↗ 8.2%</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">New HIV Cases</span>
                <div className="text-right">
                  <div className="font-medium">892</div>
                  <div className="text-xs text-destructive">↘ 3.1%</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Co-infections</span>
                <div className="text-right">
                  <div className="font-medium">573</div>
                  <div className="text-xs text-accent">↗ 5.4%</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Treatment Started</span>
                <div className="text-right">
                  <div className="font-medium">1,089</div>
                  <div className="text-xs text-secondary">↗ 7.8%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              High-Risk Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {provincial?.chartData && 
               Array.isArray(provincial.chartData) && 
               provincial.chartData.length > 0 && 
               'province' in provincial.chartData[0] ? (
                (provincial.chartData as ProvincialStats[]).slice(0, 5).map((province, index) => (
                  <div key={province.province} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <span className="text-sm">{province.province}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{province.coInfectionCount}</div>
                      <div className="text-xs text-muted-foreground">
                        {((province.coInfectionCount / (province.tbCount + province.hivCount)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  Loading provincial data...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Treatment Outcomes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Treatment Complete</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                  <span className="text-sm font-medium">87%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Still on Treatment</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div className="bg-chart-1 h-2 rounded-full" style={{ width: '8%' }}></div>
                  </div>
                  <span className="text-sm font-medium">8%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Lost to Follow-up</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: '3%' }}></div>
                  </div>
                  <span className="text-sm font-medium">3%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Treatment Failed</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div className="bg-destructive h-2 rounded-full" style={{ width: '2%' }}></div>
                  </div>
                  <span className="text-sm font-medium">2%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* WHO Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>WHO End TB & End HIV 2030 Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">95%</div>
              <div className="text-sm font-medium mb-1">TB Case Detection</div>
              <div className="text-xs text-muted-foreground">Target: 90%</div>
              <Badge variant="secondary" className="mt-2">On Track</Badge>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-chart-1 mb-2">87%</div>
              <div className="text-sm font-medium mb-1">Treatment Success Rate</div>
              <div className="text-xs text-muted-foreground">Target: 85%</div>
              <Badge variant="default" className="mt-2">Achieved</Badge>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">73%</div>
              <div className="text-sm font-medium mb-1">HIV Testing Coverage</div>
              <div className="text-xs text-muted-foreground">Target: 95%</div>
              <Badge variant="outline" className="mt-2">Needs Improvement</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
