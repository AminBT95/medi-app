import { 
  medications, 
  medicationHistory,
  doctors,
  symptoms,
  type Medication, 
  type InsertMedication,
  type MedicationHistory,
  type InsertMedicationHistory,
  type Doctor,
  type InsertDoctor,
  type Symptom,
  type InsertSymptom,
  type MedicationWithToday,
  type TodayReminder 
} from "@shared/schema";

export interface IStorage {
  // Medications
  getMedications(): Promise<Medication[]>;
  getMedication(id: number): Promise<Medication | undefined>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: number, medication: Partial<InsertMedication>): Promise<Medication | undefined>;
  deleteMedication(id: number): Promise<boolean>;
  
  // Doctors
  getDoctors(): Promise<Doctor[]>;
  getDoctor(id: number): Promise<Doctor | undefined>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  updateDoctor(id: number, doctor: Partial<InsertDoctor>): Promise<Doctor | undefined>;
  deleteDoctor(id: number): Promise<boolean>;
  
  // Symptoms
  getSymptoms(): Promise<Symptom[]>;
  getSymptom(id: number): Promise<Symptom | undefined>;
  createSymptom(symptom: InsertSymptom): Promise<Symptom>;
  updateSymptom(id: number, symptom: Partial<InsertSymptom>): Promise<Symptom | undefined>;
  deleteSymptom(id: number): Promise<boolean>;
  
  // Medication History
  getMedicationHistory(medicationId?: number, date?: string): Promise<MedicationHistory[]>;
  createMedicationHistory(history: InsertMedicationHistory): Promise<MedicationHistory>;
  updateMedicationHistory(id: number, history: Partial<InsertMedicationHistory>): Promise<MedicationHistory | undefined>;
  
  // Combined queries
  getMedicationsWithTodayHistory(date: string): Promise<MedicationWithToday[]>;
  getTodayReminders(date: string): Promise<TodayReminder[]>;
  getStats(date: string): Promise<{ taken: number; missed: number; pending: number }>;
}

export class MemStorage implements IStorage {
  private medications: Map<number, Medication>;
  private medicationHistory: Map<number, MedicationHistory>;
  private doctors: Map<number, Doctor>;
  private symptoms: Map<number, Symptom>;
  private currentMedicationId: number;
  private currentHistoryId: number;
  private currentDoctorId: number;
  private currentSymptomId: number;

  constructor() {
    this.medications = new Map();
    this.medicationHistory = new Map();
    this.doctors = new Map();
    this.symptoms = new Map();
    this.currentMedicationId = 1;
    this.currentHistoryId = 1;
    this.currentDoctorId = 1;
    this.currentSymptomId = 1;
  }

  async getMedications(): Promise<Medication[]> {
    return Array.from(this.medications.values()).filter(m => m.isActive);
  }

  async getMedication(id: number): Promise<Medication | undefined> {
    return this.medications.get(id);
  }

  async createMedication(insertMedication: InsertMedication): Promise<Medication> {
    const id = this.currentMedicationId++;
    const medication: Medication = {
      id,
      name: insertMedication.name,
      dosage: insertMedication.dosage,
      instructions: insertMedication.instructions,
      times: insertMedication.times,
      duration: insertMedication.duration || null,
      durationType: insertMedication.durationType || 'days',
      doctorId: insertMedication.doctorId || null,
      isActive: true,
      createdAt: new Date(),
    };
    this.medications.set(id, medication);
    return medication;
  }

  async updateMedication(id: number, updates: Partial<InsertMedication>): Promise<Medication | undefined> {
    const medication = this.medications.get(id);
    if (!medication) return undefined;
    
    const updated = { ...medication, ...updates };
    this.medications.set(id, updated);
    return updated;
  }

  async deleteMedication(id: number): Promise<boolean> {
    const medication = this.medications.get(id);
    if (!medication) return false;
    
    // Soft delete by setting isActive to false
    const updated = { ...medication, isActive: false };
    this.medications.set(id, updated);
    return true;
  }

  async getMedicationHistory(medicationId?: number, date?: string): Promise<MedicationHistory[]> {
    let history = Array.from(this.medicationHistory.values());
    
    if (medicationId) {
      history = history.filter(h => h.medicationId === medicationId);
    }
    
    if (date) {
      history = history.filter(h => h.date === date);
    }
    
    return history.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createMedicationHistory(insertHistory: InsertMedicationHistory): Promise<MedicationHistory> {
    const id = this.currentHistoryId++;
    const history: MedicationHistory = {
      id,
      medicationId: insertHistory.medicationId,
      scheduledTime: insertHistory.scheduledTime,
      status: insertHistory.status,
      actualTime: insertHistory.actualTime ? new Date(insertHistory.actualTime) : null,
      date: insertHistory.date,
      notes: insertHistory.notes || null,
      createdAt: new Date(),
    };
    this.medicationHistory.set(id, history);
    return history;
  }

  async updateMedicationHistory(id: number, updates: Partial<InsertMedicationHistory>): Promise<MedicationHistory | undefined> {
    const history = this.medicationHistory.get(id);
    if (!history) return undefined;
    
    const updated: MedicationHistory = {
      id: history.id,
      medicationId: updates.medicationId ?? history.medicationId,
      scheduledTime: updates.scheduledTime ?? history.scheduledTime,
      status: updates.status ?? history.status,
      actualTime: updates.actualTime ? new Date(updates.actualTime) : history.actualTime,
      date: updates.date ?? history.date,
      notes: updates.notes ?? history.notes,
      createdAt: history.createdAt,
    };
    this.medicationHistory.set(id, updated);
    return updated;
  }

  async getMedicationsWithTodayHistory(date: string): Promise<MedicationWithToday[]> {
    const medications = await this.getMedications();
    const result: MedicationWithToday[] = [];
    
    for (const medication of medications) {
      const todayHistory = await this.getMedicationHistory(medication.id, date);
      result.push({
        ...medication,
        todayHistory,
      });
    }
    
    return result;
  }

  async getTodayReminders(date: string): Promise<TodayReminder[]> {
    const medications = await this.getMedications();
    const reminders: TodayReminder[] = [];
    
    for (const medication of medications) {
      const todayHistory = await this.getMedicationHistory(medication.id, date);
      
      for (const time of medication.times) {
        const existingHistory = todayHistory.find(h => h.scheduledTime === time);
        
        reminders.push({
          id: parseInt(`${medication.id}${time.replace(':', '')}`), // Unique ID
          medicationId: medication.id,
          medicationName: medication.name,
          dosage: medication.dosage,
          instructions: medication.instructions,
          time,
          status: (existingHistory?.status as "taken" | "missed" | "pending") || 'pending',
          historyId: existingHistory?.id,
        });
      }
    }
    
    // Sort by time
    return reminders.sort((a, b) => a.time.localeCompare(b.time));
  }

  async getStats(date: string): Promise<{ taken: number; missed: number; pending: number }> {
    const reminders = await this.getTodayReminders(date);
    
    return {
      taken: reminders.filter(r => r.status === 'taken').length,
      missed: reminders.filter(r => r.status === 'missed').length,
      pending: reminders.filter(r => r.status === 'pending').length,
    };
  }

  // Doctors methods
  async getDoctors(): Promise<Doctor[]> {
    return Array.from(this.doctors.values());
  }

  async getDoctor(id: number): Promise<Doctor | undefined> {
    return this.doctors.get(id);
  }

  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const id = this.currentDoctorId++;
    const doctor: Doctor = {
      id,
      name: insertDoctor.name,
      specialty: insertDoctor.specialty,
      phone: insertDoctor.phone || null,
      email: insertDoctor.email || null,
      createdAt: new Date(),
    };
    this.doctors.set(id, doctor);
    return doctor;
  }

  async updateDoctor(id: number, updates: Partial<InsertDoctor>): Promise<Doctor | undefined> {
    const doctor = this.doctors.get(id);
    if (!doctor) return undefined;

    const updated: Doctor = {
      ...doctor,
      name: updates.name ?? doctor.name,
      specialty: updates.specialty ?? doctor.specialty,
      phone: updates.phone ?? doctor.phone,
      email: updates.email ?? doctor.email,
    };
    this.doctors.set(id, updated);
    return updated;
  }

  async deleteDoctor(id: number): Promise<boolean> {
    return this.doctors.delete(id);
  }

  // Symptoms methods
  async getSymptoms(): Promise<Symptom[]> {
    return Array.from(this.symptoms.values());
  }

  async getSymptom(id: number): Promise<Symptom | undefined> {
    return this.symptoms.get(id);
  }

  async createSymptom(insertSymptom: InsertSymptom): Promise<Symptom> {
    const id = this.currentSymptomId++;
    const symptom: Symptom = {
      id,
      name: insertSymptom.name,
      severity: insertSymptom.severity,
      notes: insertSymptom.notes || null,
      date: insertSymptom.date,
      time: insertSymptom.time,
      createdAt: new Date(),
    };
    this.symptoms.set(id, symptom);
    return symptom;
  }

  async updateSymptom(id: number, updates: Partial<InsertSymptom>): Promise<Symptom | undefined> {
    const symptom = this.symptoms.get(id);
    if (!symptom) return undefined;

    const updated: Symptom = {
      ...symptom,
      name: updates.name ?? symptom.name,
      severity: updates.severity ?? symptom.severity,
      notes: updates.notes ?? symptom.notes,
      date: updates.date ?? symptom.date,
      time: updates.time ?? symptom.time,
    };
    this.symptoms.set(id, updated);
    return updated;
  }

  async deleteSymptom(id: number): Promise<boolean> {
    return this.symptoms.delete(id);
  }
}

export const storage = new MemStorage();
