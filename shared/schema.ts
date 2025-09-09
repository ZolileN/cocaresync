import { sql } from 'drizzle-orm';
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  decimal,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("clinician"), // clinician, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enums
export const tbStatusEnum = pgEnum("tb_status", [
  "negative",
  "suspected",
  "confirmed",
  "active_treatment",
  "treatment_complete",
  "treatment_failed",
  "lost_to_followup"
]);

export const hivStatusEnum = pgEnum("hiv_status", [
  "negative",
  "positive",
  "unknown"
]);

export const treatmentStatusEnum = pgEnum("treatment_status", [
  "not_started",
  "active",
  "completed",
  "discontinued",
  "failed"
]);

export const dataSourceEnum = pgEnum("data_source", [
  "tier_net",
  "edr_web",
  "nhls",
  "private_lab",
  "manual_entry"
]);

export const labTestTypeEnum = pgEnum("lab_test_type", [
  "cd4_count",
  "viral_load",
  "genexpert_mtb_rif",
  "smear_microscopy",
  "culture",
  "dst",
  "xray"
]);

// Core tables
export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").unique().notNull(), // TB-2024-001847
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  gender: varchar("gender").notNull(), // male, female, other
  phoneNumber: varchar("phone_number"),
  address: text("address"),
  province: varchar("province"),
  district: varchar("district"),
  facility: varchar("facility"),
  tbStatus: tbStatusEnum("tb_status").default("negative"),
  hivStatus: hivStatusEnum("hiv_status").default("unknown"),
  registrationDate: date("registration_date").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
  dataSource: dataSourceEnum("data_source").default("manual_entry"),
  isActive: boolean("is_active").default(true),
});

export const treatments = pgTable("treatments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  treatmentType: varchar("treatment_type").notNull(), // TB, HIV, IPT
  regimen: varchar("regimen"), // e.g., HRZE, Efavirenz/Emtricitabine/Tenofovir
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  status: treatmentStatusEnum("status").default("not_started"),
  notes: text("notes"),
  prescribedBy: varchar("prescribed_by"),
  facility: varchar("facility"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const labResults = pgTable("lab_results", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  testType: labTestTypeEnum("test_type").notNull(),
  result: varchar("result").notNull(),
  numericValue: decimal("numeric_value"),
  referenceRange: varchar("reference_range"),
  testDate: date("test_date").notNull(),
  receivedDate: timestamp("received_date"),
  laboratory: varchar("laboratory"),
  dataSource: dataSourceEnum("data_source").default("manual_entry"),
  isNormal: boolean("is_normal"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemIntegrations = pgTable("system_integrations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  systemName: varchar("system_name").notNull(), // TIER.Net, EDRWeb, NHLS, etc.
  status: varchar("status").notNull(), // connected, syncing, limited, error
  lastSync: timestamp("last_sync"),
  nextSync: timestamp("next_sync"),
  errorMessage: text("error_message"),
  syncedRecords: integer("synced_records").default(0),
  configuration: jsonb("configuration"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dataQualityIssues = pgTable("data_quality_issues", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: uuid("patient_id").references(() => patients.id),
  issueType: varchar("issue_type").notNull(), // missing_data, inconsistent_dates, invalid_values
  severity: varchar("severity").notNull(), // low, medium, high, critical
  description: text("description").notNull(),
  field: varchar("field"), // which field has the issue
  suggestedAction: text("suggested_action"),
  isResolved: boolean("is_resolved").default(false),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action").notNull(), // create, update, delete, view, export
  resourceType: varchar("resource_type").notNull(), // patient, treatment, lab_result
  resourceId: varchar("resource_id"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const patientsRelations = relations(patients, ({ many, one }) => ({
  treatments: many(treatments),
  labResults: many(labResults),
  dataQualityIssues: many(dataQualityIssues),
  createdByUser: one(users, { fields: [patients.createdBy], references: [users.id] }),
}));

export const treatmentsRelations = relations(treatments, ({ one }) => ({
  patient: one(patients, { fields: [treatments.patientId], references: [patients.id] }),
}));

export const labResultsRelations = relations(labResults, ({ one }) => ({
  patient: one(patients, { fields: [labResults.patientId], references: [patients.id] }),
}));

export const dataQualityIssuesRelations = relations(dataQualityIssues, ({ one }) => ({
  patient: one(patients, { fields: [dataQualityIssues.patientId], references: [patients.id] }),
  resolvedByUser: one(users, { fields: [dataQualityIssues.resolvedBy], references: [users.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));

// Insert schemas
export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  lastUpdated: true,
});

export const insertTreatmentSchema = createInsertSchema(treatments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLabResultSchema = createInsertSchema(labResults).omit({
  id: true,
  createdAt: true,
});

export const insertSystemIntegrationSchema = createInsertSchema(systemIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDataQualityIssueSchema = createInsertSchema(dataQualityIssues).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

// User schema for Replit Auth
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Treatment = typeof treatments.$inferSelect;
export type InsertTreatment = z.infer<typeof insertTreatmentSchema>;
export type LabResult = typeof labResults.$inferSelect;
export type InsertLabResult = z.infer<typeof insertLabResultSchema>;
export type SystemIntegration = typeof systemIntegrations.$inferSelect;
export type InsertSystemIntegration = z.infer<typeof insertSystemIntegrationSchema>;
export type DataQualityIssue = typeof dataQualityIssues.$inferSelect;
export type InsertDataQualityIssue = z.infer<typeof insertDataQualityIssueSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
