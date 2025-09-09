import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Upload, Download, Eye, Edit, Trash2 } from "lucide-react";
import { PatientForm } from "@/components/patient-form";
import { PatientDetailsModal } from "@/components/patient-details-modal";
import { ImportDataModal } from "@/components/import-data-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { PatientsResponse } from "@shared/api-types";
import type { Patient } from "@shared/schema";

export default function Patients() {
  const [search, setSearch] = useState("");
  const [tbStatusFilter, setTbStatusFilter] = useState("");
  const [hivStatusFilter, setHivStatusFilter] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patientsData, isLoading } = useQuery<PatientsResponse>({
    queryKey: ["/api/patients", { page, limit, search, tbStatus: tbStatusFilter, hivStatus: hivStatusFilter }],
    retry: false,
  });

  const deletePatientMutation = useMutation({
    mutationFn: async (patientId: string) => {
      await apiRequest("DELETE", `/api/patients/${patientId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({
        title: "Success",
        description: "Patient deleted successfully",
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

  const handleDeletePatient = async (patientId: string) => {
    if (confirm("Are you sure you want to delete this patient? This action cannot be undone.")) {
      deletePatientMutation.mutate(patientId);
    }
  };

  const handleViewPatient = async (patient: any) => {
    try {
      const response = await fetch(`/api/patients/${patient.id}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch patient details");
      }
      
      const patientDetails = await response.json();
      setSelectedPatient(patientDetails);
      setIsDetailsModalOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load patient details",
        variant: "destructive",
      });
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch("/api/export/patients?format=csv", {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to export data");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "patients.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Patient data exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Patient Management</h2>
          <p className="text-muted-foreground">Manage TB/HIV patient records and treatment data</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-patient">
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
                <DialogDescription>
                  Enter patient information for TB/HIV care management.
                </DialogDescription>
              </DialogHeader>
              <PatientForm onSuccess={() => setIsCreateModalOpen(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-import-patients">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Patient Data</DialogTitle>
                <DialogDescription>
                  Upload CSV or Excel files to import patient records.
                </DialogDescription>
              </DialogHeader>
              <ImportDataModal onSuccess={() => setIsImportModalOpen(false)} />
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleExportData} data-testid="button-export-patients">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients by name or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-patients"
                />
              </div>
            </div>
            
            <Select value={tbStatusFilter} onValueChange={setTbStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-tb-status">
                <SelectValue placeholder="TB Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All TB Status</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
                <SelectItem value="suspected">Suspected</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="active_treatment">Active Treatment</SelectItem>
                <SelectItem value="treatment_complete">Treatment Complete</SelectItem>
              </SelectContent>
            </Select>

            <Select value={hivStatusFilter} onValueChange={setHivStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-hiv-status">
                <SelectValue placeholder="HIV Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All HIV Status</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patient Table */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Patient ID</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Age</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Gender</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">TB Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">HIV Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Province</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Last Update</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {patientsData?.patients?.map((patient) => (
                      <tr key={patient.id} className="hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-sm">{patient.patientId}</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                            <p className="text-sm text-muted-foreground">DOB: {patient.dateOfBirth}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}
                        </td>
                        <td className="py-3 px-4 capitalize">{patient.gender}</td>
                        <td className="py-3 px-4">
                          <Badge variant={
                            patient.tbStatus === "confirmed" ? "destructive" :
                            patient.tbStatus === "active_treatment" ? "default" :
                            patient.tbStatus === "treatment_complete" ? "secondary" :
                            patient.tbStatus === "suspected" ? "outline" :
                            "outline"
                          }>
                            {patient.tbStatus?.replace(/_/g, ' ') || 'Unknown'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={
                            patient.hivStatus === "positive" ? "destructive" :
                            patient.hivStatus === "negative" ? "secondary" :
                            "outline"
                          }>
                            {patient.hivStatus || 'Unknown'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{patient.province || "-"}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {patient.lastUpdated ? new Date(patient.lastUpdated).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewPatient(patient)}
                              data-testid={`button-view-patient-${patient.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              data-testid={`button-edit-patient-${patient.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeletePatient(patient.id)}
                              data-testid={`button-delete-patient-${patient.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )) || []}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {patientsData && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, patientsData.total)} of {patientsData.total} patients
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
                      {Array.from({ length: patientsData.totalPages }, (_, i) => i + 1)
                        .slice(Math.max(0, page - 3), Math.min(patientsData.totalPages, page + 2))
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
                      onClick={() => setPage(p => Math.min(patientsData.totalPages, p + 1))}
                      disabled={page === patientsData.totalPages}
                      data-testid="button-next-page"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {(!patientsData?.patients || patientsData.patients.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No patients found. Try adjusting your search criteria or add a new patient.
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <PatientDetailsModal
          patient={selectedPatient}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedPatient(null);
          }}
        />
      )}
    </div>
  );
}
