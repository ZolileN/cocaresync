import type { 
  Patient, 
  SystemIntegration, 
  DataQualityIssue, 
  LabResult, 
  Treatment 
} from "./schema";

// Dashboard API responses
export interface DashboardMetrics {
  totalPatients: number;
  coInfections: number;
  dataQualityScore: number;
  activeTreatments: number;
}

// Patients API responses  
export interface PatientsResponse {
  patients: Patient[];
  total: number;
  totalPages: number;
}

// Data Quality API responses
export interface DataQualityIssuesResponse {
  issues: DataQualityIssue[];
  total: number;
  totalPages: number;
}

// Analytics API responses
export interface ProvincialStats {
  province: string;
  tbCount: number;
  hivCount: number;
  coInfectionCount: number;
}

export interface AnalyticsResponse {
  totalPatients: number;
  coInfections: number;
  provincialData: ProvincialStats[];
}

// Chart data types
export interface CoInfectionTrendData {
  date: string;
  tbCases: number;
  hivCases: number;
  coInfections: number;
}

export interface ChartResponse {
  chartData: CoInfectionTrendData[] | ProvincialStats[];
}