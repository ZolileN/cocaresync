import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Download,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ImportDataModalProps {
  onSuccess: () => void;
}

export function ImportDataModal({ onSuccess }: ImportDataModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/import/patients', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Import failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setImportResults(data);
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      
      toast({
        title: "Import Completed",
        description: `Successfully imported ${data.success} of ${data.total} records.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV or Excel file.",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
    setImportResults(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      importMutation.mutate(selectedFile);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `first_name,last_name,date_of_birth,gender,phone_number,address,province,district,facility,tb_status,hiv_status
John,Doe,1985-03-15,male,+27123456789,"123 Main St, Johannesburg",Gauteng,City of Johannesburg,Chris Hani Baragwanath Hospital,negative,unknown
Jane,Smith,1990-07-22,female,+27987654321,"456 Oak Ave, Cape Town",Western Cape,City of Cape Town,Groote Schuur Hospital,suspected,negative`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patient_import_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (importResults) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 text-secondary mr-2" />
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-secondary">{importResults.success}</div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-destructive">{importResults.errors?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{importResults.total}</div>
                <div className="text-sm text-muted-foreground">Total Records</div>
              </div>
            </div>

            {importResults.errors && importResults.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-destructive">Import Errors</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {importResults.errors.slice(0, 5).map((error: any, index: number) => (
                    <div key={index} className="text-sm p-2 bg-destructive/10 border border-destructive/20 rounded">
                      <span className="font-medium">Row {error.row}:</span> {error.error}
                    </div>
                  ))}
                  {importResults.errors.length > 5 && (
                    <div className="text-sm text-muted-foreground">
                      ...and {importResults.errors.length - 5} more errors
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button onClick={onSuccess} className="flex-1" data-testid="button-close-import">
                Close
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setImportResults(null);
                  setSelectedFile(null);
                }}
                data-testid="button-import-another"
              >
                Import Another File
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        data-testid="file-drop-zone"
      >
        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Upload Patient Data</h3>
        <p className="text-muted-foreground mb-4">
          Drag and drop your CSV or Excel file here, or click to browse
        </p>
        
        <div className="space-y-2">
          <Label htmlFor="file-upload" className="sr-only">
            Choose file
          </Label>
          <Input
            id="file-upload"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInputChange}
            className="hidden"
            data-testid="file-input"
          />
          <Button 
            variant="outline" 
            onClick={() => document.getElementById('file-upload')?.click()}
            data-testid="button-browse-files"
          >
            <FileText className="h-4 w-4 mr-2" />
            Browse Files
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-4">
          Supported formats: CSV, Excel (.xlsx, .xls) • Max size: 10MB
        </p>
      </div>

      {/* Selected File */}
      {selectedFile && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <div className="font-medium">{selectedFile.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
                data-testid="button-remove-file"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Progress */}
      {importMutation.isPending && (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Importing patient data...</span>
                <span>Processing</span>
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Format Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your file should include the following columns for patient data:
          </p>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              'first_name', 'last_name', 'date_of_birth', 'gender',
              'phone_number', 'address', 'province', 'district',
              'facility', 'tb_status', 'hiv_status'
            ].map((column) => (
              <Badge key={column} variant="outline" className="justify-start">
                {column}
              </Badge>
            ))}
          </div>
          
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="w-full"
            data-testid="button-download-template"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template File
          </Button>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <Button
          onClick={handleImport}
          disabled={!selectedFile || importMutation.isPending}
          className="flex-1"
          data-testid="button-start-import"
        >
          {importMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onSuccess} data-testid="button-cancel-import">
          Cancel
        </Button>
      </div>
    </div>
  );
}
