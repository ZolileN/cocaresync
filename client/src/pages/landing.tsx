import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Shield, BarChart3, Users, RefreshCw } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center">
              <Activity className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            CoCareSync Platform
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Unified TB/HIV Co-infection Management for South Africa's Healthcare System
          </p>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Seamlessly integrating TIER.Net, EDRWeb, NHLS, and private laboratory systems to provide 
            comprehensive patient data management and real-time analytics for better health outcomes.
          </p>
          
          <Button 
            size="lg" 
            className="text-lg px-8 py-4"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
          >
            Access Platform
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Comprehensive Healthcare Data Management
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Addressing South Africa's 61% TB/HIV co-infection rate through integrated data systems and AI-driven analytics.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover-elevate">
              <CardHeader>
                <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-chart-1" />
                </div>
                <CardTitle>Real-time Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Comprehensive dashboards with TB/HIV metrics, treatment outcomes, and data quality monitoring.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover-elevate">
              <CardHeader>
                <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-chart-2" />
                </div>
                <CardTitle>Patient Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Centralized patient records with treatment tracking, lab results integration, and care coordination.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover-elevate">
              <CardHeader>
                <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="h-6 w-6 text-chart-3" />
                </div>
                <CardTitle>System Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  FHIR-compliant integration with TIER.Net, EDRWeb, NHLS TrakCare, and private laboratory systems.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover-elevate">
              <CardHeader>
                <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-chart-4" />
                </div>
                <CardTitle>Data Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  AI-powered data validation, anomaly detection, and automated quality scoring for clinical data integrity.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Addressing Critical Healthcare Challenges
            </h2>
            <p className="text-lg text-muted-foreground">
              Supporting WHO's End TB and End HIV goals by 2030 through data-driven healthcare solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-destructive mb-2">61%</div>
              <div className="text-lg font-medium text-foreground mb-2">TB/HIV Co-infection Rate</div>
              <div className="text-muted-foreground">South Africa's critical co-infection challenge requiring integrated care management</div>
            </div>

            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">280K</div>
              <div className="text-lg font-medium text-foreground mb-2">TB Cases Annually</div>
              <div className="text-muted-foreground">Annual tuberculosis cases requiring coordinated treatment and monitoring</div>
            </div>

            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">7.8M</div>
              <div className="text-lg font-medium text-foreground mb-2">People Living with HIV</div>
              <div className="text-muted-foreground">Requiring integrated HIV/TB screening and treatment coordination</div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-20 bg-primary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Transform Healthcare Data Management?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join healthcare facilities across South Africa in improving patient outcomes through integrated data systems.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8 py-4"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-get-started"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
