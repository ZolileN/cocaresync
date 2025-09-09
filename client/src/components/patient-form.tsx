import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PatientFormProps {
  patient?: any;
  onSuccess: () => void;
}

export function PatientForm({ patient, onSuccess }: PatientFormProps) {
  const [formData, setFormData] = useState({
    firstName: patient?.firstName || "",
    lastName: patient?.lastName || "",
    dateOfBirth: patient?.dateOfBirth || "",
    gender: patient?.gender || "",
    phoneNumber: patient?.phoneNumber || "",
    address: patient?.address || "",
    province: patient?.province || "",
    district: patient?.district || "",
    facility: patient?.facility || "",
    tbStatus: patient?.tbStatus || "negative",
    hivStatus: patient?.hivStatus || "unknown",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPatientMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/patients", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "Patient created successfully",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePatientMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/patients/${patient.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "Patient updated successfully",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (patient) {
      updatePatientMutation.mutate(formData);
    } else {
      createPatientMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const provinces = [
    "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", 
    "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Personal Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              required
              data-testid="input-first-name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              required
              data-testid="input-last-name"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              required
              data-testid="input-date-of-birth"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
              <SelectTrigger data-testid="select-gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            placeholder="+27 xx xxx xxxx"
            data-testid="input-phone-number"
          />
        </div>
      </div>

      {/* Location Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Location Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder="Physical address"
            data-testid="textarea-address"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="province">Province</Label>
            <Select value={formData.province} onValueChange={(value) => handleInputChange("province", value)}>
              <SelectTrigger data-testid="select-province">
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="district">District</Label>
            <Input
              id="district"
              value={formData.district}
              onChange={(e) => handleInputChange("district", e.target.value)}
              placeholder="District municipality"
              data-testid="input-district"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="facility">Healthcare Facility</Label>
          <Input
            id="facility"
            value={formData.facility}
            onChange={(e) => handleInputChange("facility", e.target.value)}
            placeholder="Primary healthcare facility"
            data-testid="input-facility"
          />
        </div>
      </div>

      {/* Medical Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Medical Status</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tbStatus">TB Status</Label>
            <Select value={formData.tbStatus} onValueChange={(value) => handleInputChange("tbStatus", value)}>
              <SelectTrigger data-testid="select-tb-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="negative">Negative</SelectItem>
                <SelectItem value="suspected">Suspected</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="active_treatment">Active Treatment</SelectItem>
                <SelectItem value="treatment_complete">Treatment Complete</SelectItem>
                <SelectItem value="treatment_failed">Treatment Failed</SelectItem>
                <SelectItem value="lost_to_followup">Lost to Follow-up</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hivStatus">HIV Status</Label>
            <Select value={formData.hivStatus} onValueChange={(value) => handleInputChange("hivStatus", value)}>
              <SelectTrigger data-testid="select-hiv-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="negative">Negative</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createPatientMutation.isPending || updatePatientMutation.isPending}
          data-testid="button-submit-patient"
        >
          {(createPatientMutation.isPending || updatePatientMutation.isPending) && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          )}
          {patient ? "Update Patient" : "Create Patient"}
        </Button>
      </div>
    </form>
  );
}
