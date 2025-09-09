import {
  users,
  patients,
  treatments,
  labResults,
  systemIntegrations,
  dataQualityIssues,
  auditLogs,
  type User,
  type UpsertUser,
  type Patient,
  type InsertPatient,
  type Treatment,
  type InsertTreatment,
  type LabResult,
  type InsertLabResult,
  type SystemIntegration,
  type InsertSystemIntegration,
  type DataQualityIssue,
  type InsertDataQualityIssue,
  type AuditLog,
  type InsertAuditLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Patient operations
  getPatients(options?: {
    limit?: number;
    offset?: number;
    search?: string;
    tbStatus?: string;
    hivStatus?: string;
  }): Promise<{ patients: Patient[]; total: number }>;
  getPatientById(id: string): Promise<Patient | undefined>;
  getPatientByPatientId(patientId: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: string, patient: Partial<InsertPatient>): Promise<Patient>;
  deletePatient(id: string): Promise<void>;

  // Treatment operations
  getTreatmentsByPatientId(patientId: string): Promise<Treatment[]>;
  createTreatment(treatment: InsertTreatment): Promise<Treatment>;
  updateTreatment(id: string, treatment: Partial<InsertTreatment>): Promise<Treatment>;

  // Lab result operations
  getLabResultsByPatientId(patientId: string): Promise<LabResult[]>;
  createLabResult(labResult: InsertLabResult): Promise<LabResult>;

  // System integration operations
  getSystemIntegrations(): Promise<SystemIntegration[]>;
  updateSystemIntegration(id: string, integration: Partial<InsertSystemIntegration>): Promise<SystemIntegration>;

  // Data quality operations
  getDataQualityIssues(options?: {
    limit?: number;
    offset?: number;
    severity?: string;
    isResolved?: boolean;
  }): Promise<{ issues: DataQualityIssue[]; total: number }>;
  createDataQualityIssue(issue: InsertDataQualityIssue): Promise<DataQualityIssue>;
  resolveDataQualityIssue(id: string, resolvedBy: string): Promise<DataQualityIssue>;

  // Analytics operations
  getDashboardMetrics(): Promise<{
    totalPatients: number;
    coInfections: number;
    activeTreatments: number;
    dataQualityScore: number;
  }>;
  getCoInfectionTrends(): Promise<Array<{ month: string; count: number }>>;
  getProvincialDistribution(): Promise<Array<{ province: string; tbCount: number; hivCount: number; coInfectionCount: number }>>;

  // Audit operations
  createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Patient operations
  async getPatients(options: {
    limit?: number;
    offset?: number;
    search?: string;
    tbStatus?: string;
    hivStatus?: string;
  } = {}): Promise<{ patients: Patient[]; total: number }> {
    const { limit = 10, offset = 0, search, tbStatus, hivStatus } = options;

    let query = db.select().from(patients);
    let countQuery = db.select({ count: count() }).from(patients);

    const conditions = [];
    
    if (search) {
      conditions.push(
        sql`(${patients.firstName} ILIKE ${`%${search}%`} OR ${patients.lastName} ILIKE ${`%${search}%`} OR ${patients.patientId} ILIKE ${`%${search}%`})`
      );
    }
    
    if (tbStatus) {
      conditions.push(eq(patients.tbStatus, tbStatus as any));
    }
    
    if (hivStatus) {
      conditions.push(eq(patients.hivStatus, hivStatus as any));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
      countQuery = countQuery.where(and(...conditions)) as any;
    }

    const [patientsResult, totalResult] = await Promise.all([
      query
        .orderBy(desc(patients.lastUpdated))
        .limit(limit)
        .offset(offset),
      countQuery
    ]);

    return {
      patients: patientsResult,
      total: totalResult[0].count
    };
  }

  async getPatientById(id: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }

  async getPatientByPatientId(patientId: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.patientId, patientId));
    return patient;
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const [newPatient] = await db.insert(patients).values(patient).returning();
    return newPatient;
  }

  async updatePatient(id: string, patient: Partial<InsertPatient>): Promise<Patient> {
    const [updatedPatient] = await db
      .update(patients)
      .set({ ...patient, lastUpdated: new Date() })
      .where(eq(patients.id, id))
      .returning();
    return updatedPatient;
  }

  async deletePatient(id: string): Promise<void> {
    await db.update(patients).set({ isActive: false }).where(eq(patients.id, id));
  }

  // Treatment operations
  async getTreatmentsByPatientId(patientId: string): Promise<Treatment[]> {
    return await db
      .select()
      .from(treatments)
      .where(eq(treatments.patientId, patientId))
      .orderBy(desc(treatments.startDate));
  }

  async createTreatment(treatment: InsertTreatment): Promise<Treatment> {
    const [newTreatment] = await db.insert(treatments).values(treatment).returning();
    return newTreatment;
  }

  async updateTreatment(id: string, treatment: Partial<InsertTreatment>): Promise<Treatment> {
    const [updatedTreatment] = await db
      .update(treatments)
      .set({ ...treatment, updatedAt: new Date() })
      .where(eq(treatments.id, id))
      .returning();
    return updatedTreatment;
  }

  // Lab result operations
  async getLabResultsByPatientId(patientId: string): Promise<LabResult[]> {
    return await db
      .select()
      .from(labResults)
      .where(eq(labResults.patientId, patientId))
      .orderBy(desc(labResults.testDate));
  }

  async createLabResult(labResult: InsertLabResult): Promise<LabResult> {
    const [newLabResult] = await db.insert(labResults).values(labResult).returning();
    return newLabResult;
  }

  // System integration operations
  async getSystemIntegrations(): Promise<SystemIntegration[]> {
    return await db.select().from(systemIntegrations).orderBy(systemIntegrations.systemName);
  }

  async updateSystemIntegration(id: string, integration: Partial<InsertSystemIntegration>): Promise<SystemIntegration> {
    const [updatedIntegration] = await db
      .update(systemIntegrations)
      .set({ ...integration, updatedAt: new Date() })
      .where(eq(systemIntegrations.id, id))
      .returning();
    return updatedIntegration;
  }

  // Data quality operations
  async getDataQualityIssues(options: {
    limit?: number;
    offset?: number;
    severity?: string;
    isResolved?: boolean;
  } = {}): Promise<{ issues: DataQualityIssue[]; total: number }> {
    const { limit = 10, offset = 0, severity, isResolved } = options;

    let query = db.select().from(dataQualityIssues);
    let countQuery = db.select({ count: count() }).from(dataQualityIssues);

    const conditions = [];
    
    if (severity) {
      conditions.push(eq(dataQualityIssues.severity, severity));
    }
    
    if (isResolved !== undefined) {
      conditions.push(eq(dataQualityIssues.isResolved, isResolved));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
      countQuery = countQuery.where(and(...conditions)) as any;
    }

    const [issuesResult, totalResult] = await Promise.all([
      query
        .orderBy(desc(dataQualityIssues.createdAt))
        .limit(limit)
        .offset(offset),
      countQuery
    ]);

    return {
      issues: issuesResult,
      total: totalResult[0].count
    };
  }

  async createDataQualityIssue(issue: InsertDataQualityIssue): Promise<DataQualityIssue> {
    const [newIssue] = await db.insert(dataQualityIssues).values(issue).returning();
    return newIssue;
  }

  async resolveDataQualityIssue(id: string, resolvedBy: string): Promise<DataQualityIssue> {
    const [resolvedIssue] = await db
      .update(dataQualityIssues)
      .set({
        isResolved: true,
        resolvedBy,
        resolvedAt: new Date(),
      })
      .where(eq(dataQualityIssues.id, id))
      .returning();
    return resolvedIssue;
  }

  // Analytics operations
  async getDashboardMetrics(): Promise<{
    totalPatients: number;
    coInfections: number;
    activeTreatments: number;
    dataQualityScore: number;
  }> {
    const [totalPatients] = await db
      .select({ count: count() })
      .from(patients)
      .where(eq(patients.isActive, true));

    const [coInfections] = await db
      .select({ count: count() })
      .from(patients)
      .where(
        and(
          eq(patients.isActive, true),
          eq(patients.tbStatus, "confirmed"),
          eq(patients.hivStatus, "positive")
        )
      );

    const [activeTreatments] = await db
      .select({ count: count() })
      .from(treatments)
      .where(eq(treatments.status, "active"));

    const [totalIssues] = await db
      .select({ count: count() })
      .from(dataQualityIssues);

    const [resolvedIssues] = await db
      .select({ count: count() })
      .from(dataQualityIssues)
      .where(eq(dataQualityIssues.isResolved, true));

    const dataQualityScore = totalIssues.count > 0 
      ? Math.round((resolvedIssues.count / totalIssues.count) * 100)
      : 100;

    return {
      totalPatients: totalPatients.count,
      coInfections: coInfections.count,
      activeTreatments: activeTreatments.count,
      dataQualityScore,
    };
  }

  async getCoInfectionTrends(): Promise<Array<{ month: string; count: number }>> {
    // This would typically involve more complex date aggregation
    // For now, returning a simple structure that can be expanded
    const result = await db
      .select({
        month: sql<string>`to_char(${patients.registrationDate}, 'YYYY-MM')`,
        count: count(),
      })
      .from(patients)
      .where(
        and(
          eq(patients.isActive, true),
          eq(patients.tbStatus, "confirmed"),
          eq(patients.hivStatus, "positive")
        )
      )
      .groupBy(sql`to_char(${patients.registrationDate}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${patients.registrationDate}, 'YYYY-MM')`);

    return result;
  }

  async getProvincialDistribution(): Promise<Array<{ province: string; tbCount: number; hivCount: number; coInfectionCount: number }>> {
    const result = await db
      .select({
        province: patients.province,
        tbCount: sql<number>`count(case when ${patients.tbStatus} = 'confirmed' then 1 end)`,
        hivCount: sql<number>`count(case when ${patients.hivStatus} = 'positive' then 1 end)`,
        coInfectionCount: sql<number>`count(case when ${patients.tbStatus} = 'confirmed' and ${patients.hivStatus} = 'positive' then 1 end)`,
      })
      .from(patients)
      .where(eq(patients.isActive, true))
      .groupBy(patients.province)
      .orderBy(patients.province);

    return result.filter(r => r.province).map(r => ({
      ...r,
      province: r.province as string // Type assertion since we filtered nulls
    }));
  }

  // Audit operations
  async createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog> {
    const [newAuditLog] = await db.insert(auditLogs).values(auditLog).returning();
    return newAuditLog;
  }
}

export const storage = new DatabaseStorage();
