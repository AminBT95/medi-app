import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMedicationSchema, insertMedicationHistorySchema, insertDoctorSchema, insertSymptomSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Redirect root path to /app
  app.get("/", (req, res) => {
    res.redirect("/app");
  });
  // Get all medications
  app.get("/api/medications", async (req, res) => {
    try {
      const medications = await storage.getMedications();
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medications" });
    }
  });

  // Get medication by ID
  app.get("/api/medications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const medication = await storage.getMedication(id);
      
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      
      res.json(medication);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medication" });
    }
  });

  // Create new medication
  app.post("/api/medications", async (req, res) => {
    try {
      const validatedData = insertMedicationSchema.parse(req.body);
      const medication = await storage.createMedication(validatedData);
      res.status(201).json(medication);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create medication" });
      }
    }
  });

  // Update medication
  app.patch("/api/medications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMedicationSchema.partial().parse(req.body);
      const medication = await storage.updateMedication(id, validatedData);
      
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      
      res.json(medication);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to update medication" });
      }
    }
  });

  // Delete medication (soft delete)
  app.delete("/api/medications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMedication(id);
      
      if (!success) {
        return res.status(404).json({ message: "Medication not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete medication" });
    }
  });

  // Get today's reminders
  app.get("/api/reminders/today", async (req, res) => {
    try {
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const reminders = await storage.getTodayReminders(date);
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's reminders" });
    }
  });

  // Get reminders for specific date
  app.get("/api/reminders/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const reminders = await storage.getTodayReminders(date);
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  // Get medication history
  app.get("/api/history", async (req, res) => {
    try {
      const { medicationId, date } = req.query;
      const history = await storage.getMedicationHistory(
        medicationId ? parseInt(medicationId as string) : undefined,
        date as string
      );
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  // Mark medication as taken/missed
  app.post("/api/history", async (req, res) => {
    try {
      const validatedData = insertMedicationHistorySchema.parse(req.body);
      const history = await storage.createMedicationHistory(validatedData);
      res.status(201).json(history);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create history entry" });
      }
    }
  });

  // Update history entry
  app.patch("/api/history/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMedicationHistorySchema.partial().parse(req.body);
      const history = await storage.updateMedicationHistory(id, validatedData);
      
      if (!history) {
        return res.status(404).json({ message: "History entry not found" });
      }
      
      res.json(history);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to update history entry" });
      }
    }
  });

  // Get today's stats
  app.get("/api/stats/today", async (req, res) => {
    try {
      const date = new Date().toISOString().split('T')[0];
      const stats = await storage.getStats(date);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get stats for specific date
  app.get("/api/stats/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const stats = await storage.getStats(date);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // DOCTORS API ROUTES
  // Get all doctors
  app.get("/api/doctors", async (req, res) => {
    try {
      const doctors = await storage.getDoctors();
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch doctors" });
    }
  });

  // Create doctor
  app.post("/api/doctors", async (req, res) => {
    try {
      const validatedData = insertDoctorSchema.parse(req.body);
      const doctor = await storage.createDoctor(validatedData);
      res.status(201).json(doctor);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ message: error.issues });
      } else {
        res.status(500).json({ message: "Failed to create doctor" });
      }
    }
  });

  // Update doctor
  app.patch("/api/doctors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDoctorSchema.partial().parse(req.body);
      const doctor = await storage.updateDoctor(id, validatedData);
      
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      
      res.json(doctor);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ message: error.issues });
      } else {
        res.status(500).json({ message: "Failed to update doctor" });
      }
    }
  });

  // Delete doctor
  app.delete("/api/doctors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDoctor(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete doctor" });
    }
  });

  // SYMPTOMS API ROUTES
  // Get all symptoms
  app.get("/api/symptoms", async (req, res) => {
    try {
      const symptoms = await storage.getSymptoms();
      res.json(symptoms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch symptoms" });
    }
  });

  // Create symptom
  app.post("/api/symptoms", async (req, res) => {
    try {
      const validatedData = insertSymptomSchema.parse(req.body);
      const symptom = await storage.createSymptom(validatedData);
      res.status(201).json(symptom);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ message: error.issues });
      } else {
        res.status(500).json({ message: "Failed to create symptom" });
      }
    }
  });

  // Update symptom
  app.patch("/api/symptoms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSymptomSchema.partial().parse(req.body);
      const symptom = await storage.updateSymptom(id, validatedData);
      
      if (!symptom) {
        return res.status(404).json({ message: "Symptom not found" });
      }
      
      res.json(symptom);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ message: error.issues });
      } else {
        res.status(500).json({ message: "Failed to update symptom" });
      }
    }
  });

  // Delete symptom
  app.delete("/api/symptoms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSymptom(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Symptom not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete symptom" });
    }
  });

  // API pour l'autocomplétion des noms de médicaments
  app.get("/api/medications/autocomplete/:query", async (req, res) => {
    try {
      const query = req.params.query.toLowerCase().trim();
      
      if (!query || query.length < 2) {
        return res.json([]);
      }
      
      // Base de données locale de médicaments courants
      const commonMedications = [
        { nom: "Paracétamol", formePharmaceutique: "comprimé" },
        { nom: "Ibuprofène", formePharmaceutique: "comprimé" },
        { nom: "Aspirine", formePharmaceutique: "comprimé" },
        { nom: "Doliprane", formePharmaceutique: "comprimé" },
        { nom: "Efferalgan", formePharmaceutique: "comprimé effervescent" },
        { nom: "Nurofen", formePharmaceutique: "comprimé" },
        { nom: "Dafalgan", formePharmaceutique: "comprimé" },
        { nom: "Amoxicilline", formePharmaceutique: "gélule" },
        { nom: "Oméprazole", formePharmaceutique: "gélule" },
        { nom: "Metformine", formePharmaceutique: "comprimé" },
        { nom: "Amlodipine", formePharmaceutique: "comprimé" },
        { nom: "Atorvastatine", formePharmaceutique: "comprimé" },
        { nom: "Levothyrox", formePharmaceutique: "comprimé" },
        { nom: "Lantus", formePharmaceutique: "solution injectable" },
        { nom: "Ventoline", formePharmaceutique: "aérosol" },
        { nom: "Seretide", formePharmaceutique: "aérosol" },
        { nom: "Symbicort", formePharmaceutique: "aérosol" },
        { nom: "Crestor", formePharmaceutique: "comprimé" },
        { nom: "Plavix", formePharmaceutique: "comprimé" },
        { nom: "Kardegic", formePharmaceutique: "poudre" },
        { nom: "Inexium", formePharmaceutique: "comprimé" },
        { nom: "Mopral", formePharmaceutique: "gélule" },
        { nom: "Xanax", formePharmaceutique: "comprimé" },
        { nom: "Temesta", formePharmaceutique: "comprimé" },
        { nom: "Stilnox", formePharmaceutique: "comprimé" },
        { nom: "Imovane", formePharmaceutique: "comprimé" },
        { nom: "Deroxat", formePharmaceutique: "comprimé" },
        { nom: "Prozac", formePharmaceutique: "gélule" },
        { nom: "Seroplex", formePharmaceutique: "comprimé" },
        { nom: "Ixprim", formePharmaceutique: "comprimé" },
        { nom: "Tramadol", formePharmaceutique: "gélule" },
        { nom: "Codoliprane", formePharmaceutique: "comprimé" },
        { nom: "Advil", formePharmaceutique: "comprimé" },
        { nom: "Voltarène", formePharmaceutique: "comprimé" },
        { nom: "Diclofénac", formePharmaceutique: "comprimé" },
        { nom: "Célestène", formePharmaceutique: "comprimé" },
        { nom: "Cortancyl", formePharmaceutique: "comprimé" },
        { nom: "Prednisolone", formePharmaceutique: "comprimé" },
        { nom: "Augmentin", formePharmaceutique: "comprimé" },
        { nom: "Clamoxyl", formePharmaceutique: "gélule" },
        { nom: "Zithromax", formePharmaceutique: "comprimé" },
        { nom: "Ciflox", formePharmaceutique: "comprimé" },
        { nom: "Flagyl", formePharmaceutique: "comprimé" },
        { nom: "Daflon", formePharmaceutique: "comprimé" },
        { nom: "Ginkor", formePharmaceutique: "gélule" },
        { nom: "Tanakan", formePharmaceutique: "comprimé" },
        { nom: "Magnésium", formePharmaceutique: "comprimé" },
        { nom: "Vitamine D", formePharmaceutique: "ampoule" },
        { nom: "Vitamine B12", formePharmaceutique: "ampoule" },
        { nom: "Fer", formePharmaceutique: "comprimé" },
        { nom: "Calcium", formePharmaceutique: "comprimé" },
        { nom: "Zinc", formePharmaceutique: "comprimé" }
      ];
      
      // Filtrer les médicaments qui correspondent à la requête
      const suggestions = commonMedications
        .filter(med => med.nom.toLowerCase().includes(query))
        .slice(0, 8)
        .map(med => ({
          nom: med.nom,
          formePharmaceutique: med.formePharmaceutique,
          display: `${med.nom} (${med.formePharmaceutique})`
        }));
      
      res.json(suggestions);
      
    } catch (error) {
      console.error("Erreur autocomplétion:", error);
      res.json([]);
    }
  });

  // API pour rechercher des informations sur les médicaments
  app.get("/api/medication-info/:name", async (req, res) => {
    try {
      const medicationName = req.params.name;
      
      // Recherche dans la base de données publique du médicament française
      const searchUrl = `https://base-donnees-publique.medicaments.gouv.fr/api/v1/medicaments?nom=${encodeURIComponent(medicationName)}`;
      
      const response = await fetch(searchUrl);
      if (!response.ok) {
        return res.status(404).json({ message: "Médicament non trouvé dans la base officielle" });
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        return res.status(404).json({ message: "Aucune information trouvée pour ce médicament" });
      }
      
      // Prendre le premier résultat le plus pertinent
      const medication = data[0];
      
      // Extraire les informations importantes
      const medicationInfo = {
        nom: medication.denomination,
        formePharmaceutique: medication.formePharmaceutique,
        voieAdministration: medication.voiesAdministration,
        titulaire: medication.titulaires?.[0]?.titulaire,
        cis: medication.codeCIS,
        // Informations de sécurité basiques
        contraindications: extractContraindications(medication),
        precautions: extractPrecautions(medication),
        effetsIndesirables: extractSideEffects(medication),
        posologie: extractDosage(medication)
      };
      
      res.json(medicationInfo);
    } catch (error) {
      console.error("Erreur lors de la recherche du médicament:", error);
      res.status(500).json({ message: "Erreur lors de la recherche d'informations" });
    }
  });

  // Helper functions pour extraire les informations
  function extractContraindications(medication: any): string[] {
    const contraindications = [];
    
    // Vérifications basées sur les données disponibles
    if (medication.conditionsPrescriptionDelivrance?.includes("liste I")) {
      contraindications.push("Médicament sur ordonnance uniquement");
    }
    
    if (medication.conditionsPrescriptionDelivrance?.includes("stupéfiant")) {
      contraindications.push("Substance contrôlée - Risque de dépendance");
    }
    
    // Alertes communes basées sur la forme pharmaceutique
    if (medication.formePharmaceutique?.toLowerCase().includes("injectable")) {
      contraindications.push("Ne pas utiliser en cas d'allergie aux injections");
    }
    
    if (medication.denomination?.toLowerCase().includes("aspirine")) {
      contraindications.push("Contre-indiqué en cas d'allergie à l'aspirine");
      contraindications.push("Éviter en cas d'ulcère gastrique");
      contraindications.push("Déconseillé chez l'enfant de moins de 16 ans");
    }
    
    return contraindications;
  }
  
  function extractPrecautions(medication: any): string[] {
    const precautions = [];
    
    precautions.push("Respecter la posologie prescrite par votre médecin");
    precautions.push("Signaler tout effet indésirable à votre pharmacien");
    
    if (medication.voiesAdministration?.includes("orale")) {
      precautions.push("À prendre de préférence au cours d'un repas");
    }
    
    return precautions;
  }
  
  function extractSideEffects(medication: any): string[] {
    return [
      "Consultez la notice pour la liste complète des effets indésirables",
      "En cas d'effet indésirable grave, contactez immédiatement votre médecin"
    ];
  }
  
  function extractDosage(medication: any): string {
    return "Posologie selon prescription médicale - Consultez votre médecin ou pharmacien";
  }

  // Route pour servir l'application HTML directement
  app.get("/legacy/app", async (req, res) => {
    try {
      const fs = await import("fs");
      const path = await import("path");
      const htmlPath = path.resolve(import.meta.dirname, "..", "client", "simple.html");
      const htmlContent = await fs.promises.readFile(htmlPath, "utf-8");
      res.setHeader("Content-Type", "text/html");
      res.send(htmlContent);
    } catch (error) {
      res.status(500).send("Error loading application");
    }
  });

  // Route pour l'ERP professionnel
  app.get("/pro", async (req, res) => {
    try {
      const fs = await import("fs");
      const path = await import("path");
      const htmlPath = path.resolve(import.meta.dirname, "..", "client", "pro.html");
      const htmlContent = await fs.promises.readFile(htmlPath, "utf-8");
      res.setHeader("Content-Type", "text/html");
      res.send(htmlContent);
    } catch (error) {
      res.status(500).send("Error loading professional application");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
