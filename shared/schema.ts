import { pgTable, text, serial, integer, boolean, timestamp, json, decimal, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== PATIENT MANAGEMENT (existing) ==========
export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  phone: text("phone"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  instructions: text("instructions").notNull(),
  times: text("times").array().notNull(),
  duration: integer("duration"),
  durationType: text("duration_type").notNull().default("days"),
  doctorId: integer("doctor_id").references(() => doctors.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const symptoms = pgTable("symptoms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  severity: integer("severity").notNull(),
  notes: text("notes"),
  date: text("date").notNull(),
  time: text("time").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const medicationHistory = pgTable("medication_history", {
  id: serial("id").primaryKey(),
  medicationId: integer("medication_id").notNull().references(() => medications.id),
  scheduledTime: text("scheduled_time").notNull(),
  status: text("status").notNull(),
  actualTime: timestamp("actual_time"),
  date: text("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ========== MEDICAL APPOINTMENTS & BILLING ==========
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  appointmentNumber: text("appointment_number").notNull().unique(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  patientName: text("patient_name").notNull(),
  patientPhone: text("patient_phone"),
  patientEmail: text("patient_email"),
  nationalId: text("national_id"),
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: integer("duration").default(30), // minutes
  type: text("type").notNull(), // 'consultation', 'follow-up', 'emergency'
  status: text("status").notNull().default("scheduled"), // 'scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'
  secretaryNotes: text("secretary_notes"),
  doctorNotes: text("doctor_notes"),
  symptoms: text("symptoms"),
  diagnosis: text("diagnosis"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const appointmentServices = pgTable("appointment_services", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id").references(() => appointments.id).notNull(),
  serviceType: text("service_type").notNull(), // 'analysis', 'medication', 'procedure', 'consultation_extra'
  serviceName: text("service_name").notNull(),
  description: text("description"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").default(1),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const medicalBills = pgTable("medical_bills", {
  id: serial("id").primaryKey(),
  billNumber: text("bill_number").notNull().unique(),
  appointmentId: integer("appointment_id").references(() => appointments.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  patientName: text("patient_name").notNull(),
  nationalId: text("national_id"),
  billDate: timestamp("bill_date").defaultNow().notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method"), // 'cash', 'card', 'insurance', 'pending'
  paymentStatus: text("payment_status").default("pending"), // 'pending', 'paid', 'partial', 'cancelled'
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0"),
  insuranceCovered: decimal("insurance_covered", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  billNumberIdx: index("bill_number_idx").on(table.billNumber),
  appointmentDateIdx: index("appointment_date_idx").on(table.billDate),
  paymentStatusIdx: index("payment_status_idx").on(table.paymentStatus),
}));

// ========== PHARMACY MANAGEMENT ==========
export const pharmacies = pgTable("pharmacies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  finessNumber: text("finess_number").notNull().unique(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  openingHours: json("opening_hours").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pharmacyUsers = pgTable("pharmacy_users", {
  id: serial("id").primaryKey(),
  pharmacyId: integer("pharmacy_id").references(() => pharmacies.id).notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull(), // "pharmacist", "assistant", "admin"
  isActive: boolean("is_active").default(true).notNull(),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ========== PRODUCT CATALOG ==========
export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  parentCategoryId: integer("parent_category_id"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  genericName: text("generic_name"),
  barcode: text("barcode").unique(),
  cipCode: text("cip_code").unique(),
  description: text("description"),
  categoryId: integer("category_id").references(() => productCategories.id),
  manufacturer: text("manufacturer"),
  dosage: text("dosage"),
  form: text("form"),
  prescriptionRequired: boolean("prescription_required").default(false).notNull(),
  reimbursementRate: decimal("reimbursement_rate", { precision: 5, scale: 2 }),
  publicPrice: decimal("public_price", { precision: 10, scale: 2 }).notNull(),
  pharmacyPrice: decimal("pharmacy_price", { precision: 10, scale: 2 }).notNull(),
  contraindications: text("contraindications").array(),
  sideEffects: text("side_effects").array(),
  precautions: text("precautions").array(),
  activeIngredients: json("active_ingredients"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  barcodeIdx: index("barcode_idx").on(table.barcode),
  cipCodeIdx: index("cip_code_idx").on(table.cipCode),
  nameIdx: index("product_name_idx").on(table.name),
}));

// ========== INVENTORY MANAGEMENT ==========
export const pharmacyInventory = pgTable("pharmacy_inventory", {
  id: serial("id").primaryKey(),
  pharmacyId: integer("pharmacy_id").references(() => pharmacies.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  currentStock: integer("current_stock").notNull().default(0),
  minimumStock: integer("minimum_stock").notNull().default(0),
  maximumStock: integer("maximum_stock").notNull().default(1000),
  location: text("location"),
  expiryDate: timestamp("expiry_date"),
  batchNumber: text("batch_number"),
  supplierPrice: decimal("supplier_price", { precision: 10, scale: 2 }),
  lastRestockDate: timestamp("last_restock_date"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  pharmacyProductIdx: index("pharmacy_product_idx").on(table.pharmacyId, table.productId),
  stockLevelIdx: index("stock_level_idx").on(table.currentStock),
}));

// ========== SUPPLIER MANAGEMENT ==========
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  paymentTerms: text("payment_terms"),
  deliveryDays: integer("delivery_days").default(7),
  minOrderAmount: decimal("min_order_amount", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const supplierProducts = pgTable("supplier_products", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  supplierProductCode: text("supplier_product_code"),
  supplierPrice: decimal("supplier_price", { precision: 10, scale: 2 }).notNull(),
  minimumOrderQty: integer("minimum_order_qty").default(1),
  packSize: integer("pack_size").default(1),
  isActive: boolean("is_active").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  supplierProductIdx: index("supplier_product_idx").on(table.supplierId, table.productId),
}));

// ========== ORDER MANAGEMENT ==========
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  pharmacyId: integer("pharmacy_id").references(() => pharmacies.id).notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  status: text("status").notNull(),
  orderDate: timestamp("order_date").defaultNow().notNull(),
  expectedDeliveryDate: timestamp("expected_delivery_date"),
  actualDeliveryDate: timestamp("actual_delivery_date"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdBy: integer("created_by").references(() => pharmacyUsers.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  orderNumberIdx: index("order_number_idx").on(table.orderNumber),
  statusIdx: index("order_status_idx").on(table.status),
}));

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => purchaseOrders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantityOrdered: integer("quantity_ordered").notNull(),
  quantityReceived: integer("quantity_received").default(0),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  batchNumber: text("batch_number"),
  expiryDate: timestamp("expiry_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ========== CUSTOMER MANAGEMENT ==========
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: timestamp("date_of_birth"),
  nationalId: text("national_id").unique(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  socialSecurityNumber: text("social_security_number"),
  loyaltyLevel: text("loyalty_level").default("regular"),
  totalPurchases: decimal("total_purchases", { precision: 10, scale: 2 }).default("0"),
  visitCount: integer("visit_count").default(0),
  lastVisit: timestamp("last_visit"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  nationalIdIdx: index("national_id_idx").on(table.nationalId),
  nameIdx: index("customer_name_idx").on(table.firstName, table.lastName),
}));

// ========== SALES MANAGEMENT ==========
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  saleNumber: text("sale_number").notNull().unique(),
  pharmacyId: integer("pharmacy_id").references(() => pharmacies.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id),
  cashierId: integer("cashier_id").references(() => pharmacyUsers.id).notNull(),
  saleDate: timestamp("sale_date").defaultNow().notNull(),
  paymentMethod: text("payment_method").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  amountReceived: decimal("amount_received", { precision: 10, scale: 2 }),
  changeAmount: decimal("change_amount", { precision: 10, scale: 2 }),
  prescriptionId: integer("prescription_id"),
  notes: text("notes"),
  isRefunded: boolean("is_refunded").default(false),
  refundDate: timestamp("refund_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  saleNumberIdx: index("sale_number_idx").on(table.saleNumber),
  saleDateIdx: index("sale_date_idx").on(table.saleDate),
  customerIdx: index("sale_customer_idx").on(table.customerId),
}));

export const saleItems = pgTable("sale_items", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").references(() => sales.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  reimbursementAmount: decimal("reimbursement_amount", { precision: 10, scale: 2 }).default("0"),
  batchNumber: text("batch_number"),
  expiryDate: timestamp("expiry_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ========== PRESCRIPTION MANAGEMENT ==========
export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  prescriptionNumber: text("prescription_number").notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  prescriptionDate: timestamp("prescription_date").notNull(),
  validityDate: timestamp("validity_date").notNull(),
  status: text("status").notNull(),
  isChronicTreatment: boolean("is_chronic_treatment").default(false),
  renewalNumber: integer("renewal_number").default(0),
  maxRenewals: integer("max_renewals").default(0),
  notes: text("notes"),
  digitalSignature: text("digital_signature"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  prescriptionNumberIdx: index("prescription_number_idx").on(table.prescriptionNumber),
  customerDoctorIdx: index("customer_doctor_idx").on(table.customerId, table.doctorId),
}));

export const prescriptionItems = pgTable("prescription_items", {
  id: serial("id").primaryKey(),
  prescriptionId: integer("prescription_id").references(() => prescriptions.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantityPrescribed: integer("quantity_prescribed").notNull(),
  quantityDispensed: integer("quantity_dispensed").default(0),
  dosageInstructions: text("dosage_instructions").notNull(),
  duration: text("duration"),
  substituteAllowed: boolean("substitute_allowed").default(true),
  dispensedProductId: integer("dispensed_product_id").references(() => products.id),
  isDispensed: boolean("is_dispensed").default(false),
  dispensedDate: timestamp("dispensed_date"),
  dispensedBy: integer("dispensed_by").references(() => pharmacyUsers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ========== FINANCIAL MANAGEMENT ==========
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  pharmacyId: integer("pharmacy_id").references(() => pharmacies.id).notNull(),
  recipientType: text("recipient_type").notNull(),
  recipientName: text("recipient_name").notNull(),
  recipientAddress: text("recipient_address"),
  issueDate: timestamp("issue_date").defaultNow().notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  status: text("status").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method"),
  notes: text("notes"),
  createdBy: integer("created_by").references(() => pharmacyUsers.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  invoiceNumberIdx: index("invoice_number_idx").on(table.invoiceNumber),
  statusIdx: index("invoice_status_idx").on(table.status),
  dueDateIdx: index("due_date_idx").on(table.dueDate),
}));

// ========== ANALYTICS & REPORTING ==========
export const salesAnalytics = pgTable("sales_analytics", {
  id: serial("id").primaryKey(),
  pharmacyId: integer("pharmacy_id").references(() => pharmacies.id).notNull(),
  date: timestamp("date").notNull(),
  dailySales: decimal("daily_sales", { precision: 10, scale: 2 }).default("0"),
  transactionCount: integer("transaction_count").default(0),
  averageBasket: decimal("average_basket", { precision: 10, scale: 2 }).default("0"),
  topSellingProductId: integer("top_selling_product_id").references(() => products.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pharmacyDateIdx: index("pharmacy_date_idx").on(table.pharmacyId, table.date),
}));

// ========== AUDIT & LOGS ==========
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  pharmacyId: integer("pharmacy_id").references(() => pharmacies.id),
  userId: integer("user_id").references(() => pharmacyUsers.id),
  action: text("action").notNull(),
  tableName: text("table_name").notNull(),
  recordId: integer("record_id"),
  oldValues: json("old_values"),
  newValues: json("new_values"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pharmacyActionIdx: index("pharmacy_action_idx").on(table.pharmacyId, table.action),
  userActionIdx: index("user_action_idx").on(table.userId, table.action),
  createdAtIdx: index("audit_created_at_idx").on(table.createdAt),
}));

// ========== INSERT SCHEMAS ==========
export const insertDoctorSchema = createInsertSchema(doctors).pick({
  name: true,
  specialty: true,
  phone: true,
  email: true,
});

export const insertMedicationSchema = createInsertSchema(medications).pick({
  name: true,
  dosage: true,
  instructions: true,
  times: true,
  duration: true,
  durationType: true,
  doctorId: true,
});

export const insertSymptomSchema = createInsertSchema(symptoms).pick({
  name: true,
  severity: true,
  notes: true,
  date: true,
  time: true,
});

export const insertMedicationHistorySchema = z.object({
  medicationId: z.number(),
  scheduledTime: z.string(),
  status: z.enum(["taken", "missed", "pending"]),
  date: z.string(),
  actualTime: z.string().optional(),
  notes: z.string().optional(),
});

// Pharmacy schemas
export const insertPharmacySchema = createInsertSchema(pharmacies).pick({
  name: true,
  finessNumber: true,
  address: true,
  phone: true,
  email: true,
  openingHours: true,
});

export const insertPharmacyUserSchema = createInsertSchema(pharmacyUsers).pick({
  pharmacyId: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  genericName: true,
  barcode: true,
  cipCode: true,
  description: true,
  categoryId: true,
  manufacturer: true,
  dosage: true,
  form: true,
  prescriptionRequired: true,
  reimbursementRate: true,
  publicPrice: true,
  pharmacyPrice: true,
  contraindications: true,
  sideEffects: true,
  precautions: true,
  activeIngredients: true,
});

export const insertCustomerSchema = createInsertSchema(customers).pick({
  firstName: true,
  lastName: true,
  dateOfBirth: true,
  nationalId: true,
  phone: true,
  email: true,
  address: true,
  socialSecurityNumber: true,
});

export const insertSaleSchema = createInsertSchema(sales).pick({
  pharmacyId: true,
  customerId: true,
  cashierId: true,
  paymentMethod: true,
  subtotal: true,
  discountAmount: true,
  taxAmount: true,
  totalAmount: true,
  amountReceived: true,
  changeAmount: true,
  prescriptionId: true,
  notes: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).pick({
  name: true,
  contactPerson: true,
  email: true,
  phone: true,
  address: true,
  paymentTerms: true,
  deliveryDays: true,
  minOrderAmount: true,
});

// Medical appointments schemas
export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  appointmentNumber: true,
  doctorId: true,
  patientName: true,
  patientPhone: true,
  patientEmail: true,
  nationalId: true,
  appointmentDate: true,
  duration: true,
  type: true,
  secretaryNotes: true,
  basePrice: true,
});

export const insertAppointmentServiceSchema = createInsertSchema(appointmentServices).pick({
  appointmentId: true,
  serviceType: true,
  serviceName: true,
  description: true,
  unitPrice: true,
  quantity: true,
  totalPrice: true,
});

export const insertMedicalBillSchema = createInsertSchema(medicalBills).pick({
  billNumber: true,
  appointmentId: true,
  doctorId: true,
  patientName: true,
  nationalId: true,
  subtotal: true,
  discountAmount: true,
  taxAmount: true,
  totalAmount: true,
  paymentMethod: true,
  paymentStatus: true,
  paidAmount: true,
  insuranceCovered: true,
  notes: true,
});

// ========== TYPE EXPORTS ==========
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Doctor = typeof doctors.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Medication = typeof medications.$inferSelect;
export type InsertSymptom = z.infer<typeof insertSymptomSchema>;
export type Symptom = typeof symptoms.$inferSelect;
export type InsertMedicationHistory = z.infer<typeof insertMedicationHistorySchema>;
export type MedicationHistory = typeof medicationHistory.$inferSelect;

export type InsertPharmacy = z.infer<typeof insertPharmacySchema>;
export type Pharmacy = typeof pharmacies.$inferSelect;
export type InsertPharmacyUser = z.infer<typeof insertPharmacyUserSchema>;
export type PharmacyUser = typeof pharmacyUsers.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof sales.$inferSelect;
export type SaleItem = typeof saleItems.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointmentService = z.infer<typeof insertAppointmentServiceSchema>;
export type AppointmentService = typeof appointmentServices.$inferSelect;
export type InsertMedicalBill = z.infer<typeof insertMedicalBillSchema>;
export type MedicalBill = typeof medicalBills.$inferSelect;

// Enhanced types for frontend
export type MedicationWithToday = Medication & {
  todayHistory: MedicationHistory[];
};

export type TodayReminder = {
  id: number;
  medicationId: number;
  medicationName: string;
  dosage: string;
  instructions: string;
  time: string;
  status: "taken" | "missed" | "pending";
  historyId?: number;
};

export type ProductWithInventory = Product & {
  inventory?: {
    currentStock: number;
    minimumStock: number;
    location?: string;
    expiryDate?: Date;
  };
};

export type SaleWithItems = Sale & {
  items: SaleItem[];
  customer?: Customer;
  cashier: PharmacyUser;
};

export type CustomerWithStats = Customer & {
  stats: {
    totalPurchases: number;
    visitCount: number;
    averageBasket: number;
    lastVisit?: Date;
  };
};

export type AppointmentWithServices = Appointment & {
  services: AppointmentService[];
  totalServicesAmount: number;
};

export type TodayAppointment = {
  id: number;
  appointmentNumber: string;
  patientName: string;
  patientPhone?: string;
  nationalId?: string;
  appointmentDate: Date;
  duration: number;
  type: string;
  status: string;
  secretaryNotes?: string;
  basePrice: number;
  services: AppointmentService[];
  totalAmount: number;
};