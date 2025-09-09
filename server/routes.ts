import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPatientSchema, insertTreatmentSchema, insertLabResultSchema } from "@shared/schema";
import multer from "multer";
import csv from "csv-parser";
import * as XLSX from "xlsx";
import { Readable } from "stream";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // Handle both development and production user objects
      const userId = process.env.NODE_ENV === 'development' 
        ? req.user.id 
        : req.user.claims?.sub;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID not found" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard analytics
  app.get('/api/dashboard/metrics', isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  app.get('/api/dashboard/co-infection-trends', isAuthenticated, async (req, res) => {
    try {
      const trends = await storage.getCoInfectionTrends();
      res.json(trends);
    } catch (error) {
      console.error("Error fetching co-infection trends:", error);
      res.status(500).json({ message: "Failed to fetch trends" });
    }
  });

  app.get('/api/dashboard/provincial-distribution', isAuthenticated, async (req, res) => {
    try {
      const distribution = await storage.getProvincialDistribution();
      res.json(distribution);
    } catch (error) {
      console.error("Error fetching provincial distribution:", error);
      res.status(500).json({ message: "Failed to fetch distribution" });
    }
  });

  // Patient management
  app.get('/api/patients', isAuthenticated, async (req, res) => {
    try {
      const {
        page = "1",
        limit = "10",
        search,
        tbStatus,
        hivStatus
      } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const result = await storage.getPatients({
        limit: parseInt(limit as string),
        offset,
        search: search as string,
        tbStatus: tbStatus as string,
        hivStatus: hivStatus as string,
      });

      res.json({
        ...result,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(result.total / parseInt(limit as string)),
      });
    } catch (error) {
      console.error("Error fetching patients:", error);
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.get('/api/patients/:id', isAuthenticated, async (req, res) => {
    try {
      const patient = await storage.getPatientById(req.params.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const [treatments, labResults] = await Promise.all([
        storage.getTreatmentsByPatientId(patient.id),
        storage.getLabResultsByPatientId(patient.id),
      ]);

      res.json({
        ...patient,
        treatments,
        labResults,
      });
    } catch (error) {
      console.error("Error fetching patient:", error);
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.post('/api/patients', isAuthenticated, async (req: any, res) => {
    try {
      // Handle both development and production user objects
      const userId = process.env.NODE_ENV === 'development' 
        ? req.user.id 
        : req.user.claims?.sub;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID not found" });
      }

      const validatedData = insertPatientSchema.parse({
        ...req.body,
        createdBy: userId,
      });

      // Generate patient ID
      const currentYear = new Date().getFullYear();
      const existingPatients = await storage.getPatients({ limit: 1 });
      const nextNumber = existingPatients.total + 1;
      validatedData.patientId = `TB-${currentYear}-${nextNumber.toString().padStart(6, '0')}`;

      const patient = await storage.createPatient(validatedData);

      // Create audit log
      await storage.createAuditLog({
        userId,
        action: "create",
        resourceType: "patient",
        resourceId: patient.id,
        newValues: patient,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.status(201).json(patient);
    } catch (error) {
      console.error("Error creating patient:", error);
      res.status(400).json({ message: "Failed to create patient", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.put('/api/patients/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const oldPatient = await storage.getPatientById(req.params.id);
      
      if (!oldPatient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const validatedData = insertPatientSchema.partial().parse(req.body);
      const updatedPatient = await storage.updatePatient(req.params.id, validatedData);

      // Create audit log
      await storage.createAuditLog({
        userId,
        action: "update",
        resourceType: "patient",
        resourceId: updatedPatient.id,
        oldValues: oldPatient,
        newValues: updatedPatient,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(updatedPatient);
    } catch (error) {
      console.error("Error updating patient:", error);
      res.status(400).json({ message: "Failed to update patient", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.delete('/api/patients/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const patient = await storage.getPatientById(req.params.id);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      await storage.deletePatient(req.params.id);

      // Create audit log
      await storage.createAuditLog({
        userId,
        action: "delete",
        resourceType: "patient",
        resourceId: req.params.id,
        oldValues: patient,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting patient:", error);
      res.status(500).json({ message: "Failed to delete patient" });
    }
  });

  // Treatment management
  app.post('/api/patients/:patientId/treatments', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertTreatmentSchema.parse({
        ...req.body,
        patientId: req.params.patientId,
      });

      const treatment = await storage.createTreatment(validatedData);

      // Create audit log
      const userId = req.user.claims.sub;
      await storage.createAuditLog({
        userId,
        action: "create",
        resourceType: "treatment",
        resourceId: treatment.id,
        newValues: treatment,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.status(201).json(treatment);
    } catch (error) {
      console.error("Error creating treatment:", error);
      res.status(400).json({ message: "Failed to create treatment", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Lab result management
  app.post('/api/patients/:patientId/lab-results', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertLabResultSchema.parse({
        ...req.body,
        patientId: req.params.patientId,
      });

      const labResult = await storage.createLabResult(validatedData);

      // Create audit log
      const userId = req.user.claims.sub;
      await storage.createAuditLog({
        userId,
        action: "create",
        resourceType: "lab_result",
        resourceId: labResult.id,
        newValues: labResult,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.status(201).json(labResult);
    } catch (error) {
      console.error("Error creating lab result:", error);
      res.status(400).json({ message: "Failed to create lab result", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // System integrations
  app.get('/api/integrations', isAuthenticated, async (req, res) => {
    try {
      const integrations = await storage.getSystemIntegrations();
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ message: "Failed to fetch integrations" });
    }
  });

  // Data quality
  app.get('/api/data-quality/issues', isAuthenticated, async (req, res) => {
    try {
      const {
        page = "1",
        limit = "10",
        severity,
        isResolved
      } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const result = await storage.getDataQualityIssues({
        limit: parseInt(limit as string),
        offset,
        severity: severity as string,
        isResolved: isResolved === "true" ? true : isResolved === "false" ? false : undefined,
      });

      res.json({
        ...result,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(result.total / parseInt(limit as string)),
      });
    } catch (error) {
      console.error("Error fetching data quality issues:", error);
      res.status(500).json({ message: "Failed to fetch data quality issues" });
    }
  });

  app.put('/api/data-quality/issues/:id/resolve', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const resolvedIssue = await storage.resolveDataQualityIssue(req.params.id, userId);
      res.json(resolvedIssue);
    } catch (error) {
      console.error("Error resolving data quality issue:", error);
      res.status(500).json({ message: "Failed to resolve issue" });
    }
  });

  // File import (CSV/Excel)
  app.post('/api/import/patients', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.claims.sub;
      const fileBuffer = req.file.buffer;
      const fileName = req.file.originalname;
      let records: any[] = [];

      // Parse file based on extension
      if (fileName.endsWith('.csv')) {
        const stream = Readable.from(fileBuffer.toString());
        records = await new Promise((resolve, reject) => {
          const results: any[] = [];
          stream
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', reject);
        });
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        records = XLSX.utils.sheet_to_json(worksheet);
      } else {
        return res.status(400).json({ message: "Unsupported file format. Please use CSV or Excel files." });
      }

      const importResults = {
        total: records.length,
        success: 0,
        errors: [] as any[],
      };

      // Process each record
      for (let i = 0; i < records.length; i++) {
        try {
          const record = records[i];
          
          // Map CSV/Excel columns to our schema
          const patientData = {
            firstName: record.first_name || record.firstName,
            lastName: record.last_name || record.lastName,
            dateOfBirth: record.date_of_birth || record.dateOfBirth,
            gender: record.gender,
            phoneNumber: record.phone_number || record.phoneNumber,
            address: record.address,
            province: record.province,
            district: record.district,
            facility: record.facility,
            tbStatus: record.tb_status || record.tbStatus || "negative",
            hivStatus: record.hiv_status || record.hivStatus || "unknown",
            dataSource: "manual_entry",
            createdBy: userId,
          };

          // Generate patient ID
          const currentYear = new Date().getFullYear();
          const existingPatients = await storage.getPatients({ limit: 1 });
          const nextNumber = existingPatients.total + importResults.success + 1;
          const patientDataWithId = {
            ...patientData,
            patientId: `TB-${currentYear}-${nextNumber.toString().padStart(6, '0')}`
          };

          const validatedData = insertPatientSchema.parse(patientDataWithId);
          await storage.createPatient(validatedData);
          
          importResults.success++;
        } catch (error) {
          importResults.errors.push({
            row: i + 1,
            error: error instanceof Error ? error.message : 'Unknown error',
            data: records[i],
          });
        }
      }

      // Create audit log for import
      await storage.createAuditLog({
        userId,
        action: "import",
        resourceType: "patient",
        newValues: { importResults },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(importResults);
    } catch (error) {
      console.error("Error importing patients:", error);
      res.status(500).json({ message: "Failed to import patients", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Export data
  app.get('/api/export/patients', isAuthenticated, async (req: any, res) => {
    try {
      const { format = 'csv' } = req.query;
      const { patients } = await storage.getPatients({ limit: 10000 }); // Get all patients for export

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=patients.csv');
        
        // Create CSV header
        const headers = [
          'Patient ID', 'First Name', 'Last Name', 'Date of Birth', 'Gender',
          'Phone Number', 'Province', 'District', 'Facility', 'TB Status', 'HIV Status',
          'Registration Date'
        ];
        
        let csvContent = headers.join(',') + '\n';
        
        // Add patient data
        patients.forEach(patient => {
          const row = [
            patient.patientId,
            patient.firstName,
            patient.lastName,
            patient.dateOfBirth,
            patient.gender,
            patient.phoneNumber || '',
            patient.province || '',
            patient.district || '',
            patient.facility || '',
            patient.tbStatus,
            patient.hivStatus,
            patient.registrationDate
          ];
          csvContent += row.map(field => `"${field}"`).join(',') + '\n';
        });
        
        res.send(csvContent);
      } else {
        res.status(400).json({ message: "Unsupported export format" });
      }

      // Create audit log for export
      const userId = req.user.claims.sub;
      await storage.createAuditLog({
        userId,
        action: "export",
        resourceType: "patient",
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

    } catch (error) {
      console.error("Error exporting patients:", error);
      res.status(500).json({ message: "Failed to export patients" });
    }
  });

  // FHIR endpoints (basic structure for future implementation)
  app.get('/fhir/Patient', isAuthenticated, async (req, res) => {
    try {
      // Basic FHIR R4 Patient resource structure
      const { patients } = await storage.getPatients({ limit: 100 });
      
      const fhirBundle = {
        resourceType: "Bundle",
        id: "patient-search-results",
        type: "searchset",
        total: patients.length,
        entry: patients.map(patient => ({
          resource: {
            resourceType: "Patient",
            id: patient.id,
            identifier: [{
              system: "http://cocaresync.za/patient-id",
              value: patient.patientId
            }],
            name: [{
              family: patient.lastName,
              given: [patient.firstName]
            }],
            gender: patient.gender === "male" ? "male" : patient.gender === "female" ? "female" : "other",
            birthDate: patient.dateOfBirth,
            telecom: patient.phoneNumber ? [{
              system: "phone",
              value: patient.phoneNumber
            }] : [],
            address: patient.address ? [{
              text: patient.address,
              state: patient.province,
              district: patient.district
            }] : []
          }
        }))
      };
      
      res.json(fhirBundle);
    } catch (error) {
      console.error("Error fetching FHIR patients:", error);
      res.status(500).json({ message: "Failed to fetch FHIR patients" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
