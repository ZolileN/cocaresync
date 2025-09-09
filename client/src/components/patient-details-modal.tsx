import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  MapPin, 
  Calendar,
  Phone,
  Activity,
  TestTube,
  PillBottle,
  FileText,
  Edit
} from "lucide-react";

interface PatientDetailsModalProps {
  patient: any;
  isOpen: boolean;
  onClose: () => void;
}

export function PatientDetailsModal({ patient, isOpen, onClose }: PatientDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [showLabForm, setShowLabForm] = useState(false);

  const queryClient = useQueryClient();

  if (!patient) return null;

  const calculateAge = (dateOfBirth: string) => {
    return new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
  };

  const getStatusBadge = (status: string, type: "tb" | "hiv") => {
    const variant = 
      status === "confirmed" || status === "positive" ? "destructive" :
      status === "active_treatment" || status === "active" ? "default" :
      status === "treatment_complete" || status === "negative" ? "secondary" :
      "outline";

    return (
      <Badge variant={variant}>
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{patient.firstName} {patient.lastName}</span>
          </DialogTitle>
          <DialogDescription>
            Patient ID: {patient.patientId} • DOB: {patient.dateOfBirth}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="treatments" data-testid="tab-treatments">Treatments</TabsTrigger>
            <TabsTrigger value="lab-results" data-testid="tab-lab-results">Lab Results</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Demographics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Demographics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age:</span>
                    <span>{calculateAge(patient.dateOfBirth)} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gender:</span>
                    <span className="capitalize">{patient.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{patient.phoneNumber || "Not provided"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registration:</span>
                    <span>{new Date(patient.registrationDate).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Province:</span>
                    <span>{patient.province || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">District:</span>
                    <span>{patient.district || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Facility:</span>
                    <span>{patient.facility || "Not specified"}</span>
                  </div>
                  {patient.address && (
                    <div>
                      <span className="text-muted-foreground">Address:</span>
                      <p className="text-sm mt-1">{patient.address}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Medical Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Medical Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">TB Status</div>
                    {getStatusBadge(patient.tbStatus, "tb")}
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">HIV Status</div>
                    {getStatusBadge(patient.hivStatus, "hiv")}
                  </div>
                </div>
                
                {patient.tbStatus === "confirmed" && patient.hivStatus === "positive" && (
                  <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 text-accent mr-2" />
                      <span className="font-medium text-accent">TB/HIV Co-infection Identified</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Patient requires coordinated TB and HIV treatment protocols.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="treatments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Treatment History</h3>
              <Button 
                onClick={() => setShowTreatmentForm(true)}
                data-testid="button-add-treatment"
              >
                <PillBottle className="h-4 w-4 mr-2" />
                Add Treatment
              </Button>
            </div>

            <div className="space-y-3">
              {patient.treatments?.length > 0 ? (
                patient.treatments.map((treatment: any) => (
                  <Card key={treatment.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{treatment.treatmentType} Treatment</div>
                          <div className="text-sm text-muted-foreground">{treatment.regimen}</div>
                        </div>
                        <Badge variant={
                          treatment.status === "active" ? "default" :
                          treatment.status === "completed" ? "secondary" :
                          treatment.status === "failed" ? "destructive" :
                          "outline"
                        }>
                          {treatment.status}
                        </Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Start Date:</span>
                          <br />
                          {new Date(treatment.startDate).toLocaleDateString()}
                        </div>
                        {treatment.endDate && (
                          <div>
                            <span className="text-muted-foreground">End Date:</span>
                            <br />
                            {new Date(treatment.endDate).toLocaleDateString()}
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Facility:</span>
                          <br />
                          {treatment.facility || "Not specified"}
                        </div>
                      </div>
                      
                      {treatment.notes && (
                        <div className="mt-3 p-2 bg-muted rounded text-sm">
                          <span className="font-medium">Notes:</span> {treatment.notes}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No treatment records found.
                </div>
              )}
            </div>

            {showTreatmentForm && (
              <TreatmentForm
                patientId={patient.id}
                onClose={() => setShowTreatmentForm(false)}
                onSuccess={() => {
                  setShowTreatmentForm(false);
                  // Refresh patient data
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="lab-results" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Laboratory Results</h3>
              <Button 
                onClick={() => setShowLabForm(true)}
                data-testid="button-add-lab-result"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Add Lab Result
              </Button>
            </div>

            <div className="space-y-3">
              {patient.labResults?.length > 0 ? (
                patient.labResults.map((result: any) => (
                  <Card key={result.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{result.testType.replace(/_/g, ' ')}</div>
                          <div className="text-lg font-bold">{result.result}</div>
                          {result.numericValue && (
                            <div className="text-sm text-muted-foreground">
                              Value: {result.numericValue} {result.referenceRange && `(${result.referenceRange})`}
                            </div>
                          )}
                        </div>
                        <Badge variant={result.isNormal ? "secondary" : "destructive"}>
                          {result.isNormal ? "Normal" : "Abnormal"}
                        </Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Test Date:</span>
                          <br />
                          {new Date(result.testDate).toLocaleDateString()}
                        </div>
                        {result.receivedDate && (
                          <div>
                            <span className="text-muted-foreground">Received:</span>
                            <br />
                            {new Date(result.receivedDate).toLocaleDateString()}
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Laboratory:</span>
                          <br />
                          {result.laboratory || "Not specified"}
                        </div>
                      </div>
                      
                      {result.notes && (
                        <div className="mt-3 p-2 bg-muted rounded text-sm">
                          <span className="font-medium">Notes:</span> {result.notes}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No lab results found.
                </div>
              )}
            </div>

            {showLabForm && (
              <LabResultForm
                patientId={patient.id}
                onClose={() => setShowLabForm(false)}
                onSuccess={() => {
                  setShowLabForm(false);
                  // Refresh patient data
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <h3 className="text-lg font-medium">Patient History</h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <div className="font-medium">Patient Registered</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(patient.registrationDate).toLocaleDateString()} • 
                    Added to CoCareSync platform
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <div className="font-medium">Last Updated</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(patient.lastUpdated).toLocaleDateString()} • 
                    Record modified
                  </div>
                </div>
              </div>
              
              <div className="text-center py-4 text-muted-foreground">
                Detailed audit history will be available in future updates.
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} data-testid="button-close-modal">
            Close
          </Button>
          <Button data-testid="button-edit-patient">
            <Edit className="h-4 w-4 mr-2" />
            Edit Patient
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Treatment Form Component (simplified for demo)
function TreatmentForm({ patientId, onClose, onSuccess }: any) {
  return (
    <div className="border rounded-lg p-4 bg-muted/50">
      <h4 className="font-medium mb-2">Add New Treatment</h4>
      <p className="text-sm text-muted-foreground">
        Treatment form would be implemented here with fields for treatment type, regimen, dates, etc.
      </p>
      <div className="flex space-x-2 mt-4">
        <Button size="sm" onClick={onSuccess}>Save Treatment</Button>
        <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
}

// Lab Result Form Component (simplified for demo)
function LabResultForm({ patientId, onClose, onSuccess }: any) {
  return (
    <div className="border rounded-lg p-4 bg-muted/50">
      <h4 className="font-medium mb-2">Add Lab Result</h4>
      <p className="text-sm text-muted-foreground">
        Lab result form would be implemented here with fields for test type, result, reference ranges, etc.
      </p>
      <div className="flex space-x-2 mt-4">
        <Button size="sm" onClick={onSuccess}>Save Result</Button>
        <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
}
