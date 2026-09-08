import { Express, Request, Response } from "express";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export function registerSimpleAPI(app: Express) {
  
  // Authentication endpoints
  app.post("/api/pharmacy/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (email === "pharmacien@pharmacie-centrale.fr" && password === "admin123") {
        const token = "demo-token-" + Date.now();
        res.json({
          token,
          user: {
            id: 1,
            email: "pharmacien@pharmacie-centrale.fr",
            firstName: "Dr. Jean",
            lastName: "Dupont",
            role: "pharmacist",
            pharmacyId: 1
          }
        });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Dashboard data
  app.get("/api/pharmacy/dashboard", async (req, res) => {
    res.json({
      analytics: {
        dailySales: "1247.50",
        transactionCount: 47,
        averageBasket: "26.51"
      },
      lowStockAlerts: [
        { productName: "Paracétamol 1000mg", currentStock: 15, minimumStock: 20 },
        { productName: "Vitamine D 1000UI", currentStock: 8, minimumStock: 10 }
      ],
      pendingOrders: [
        { id: 1, orderNumber: "CMD-2024-167", status: "pending", totalAmount: "1247.50" }
      ],
      recentSales: [
        { 
          id: 1, 
          saleNumber: "V-2024-234", 
          totalAmount: "5.67", 
          paymentMethod: "vitale",
          saleDate: new Date(),
          customerName: "Marie Martin"
        }
      ]
    });
  });

  // Products endpoint
  app.get("/api/pharmacy/products", async (req, res) => {
    const products = [
      {
        id: 1,
        name: "Paracétamol 1000mg",
        genericName: "Paracétamol",
        barcode: "3400123456789",
        manufacturer: "Sanofi",
        dosage: "1000mg",
        form: "Comprimé",
        publicPrice: "2.35",
        pharmacyPrice: "1.89",
        prescriptionRequired: false,
        currentStock: 150,
        minimumStock: 20,
        location: "A1"
      },
      {
        id: 2,
        name: "Metformine 1000mg",
        genericName: "Metformine",
        barcode: "3400987654321",
        manufacturer: "Merck",
        dosage: "1000mg",
        form: "Comprimé",
        publicPrice: "5.67",
        pharmacyPrice: "4.20",
        prescriptionRequired: true,
        currentStock: 85,
        minimumStock: 10,
        location: "B1"
      },
      {
        id: 3,
        name: "Ibuprofène 400mg",
        genericName: "Ibuprofène",
        barcode: "3400555666777",
        manufacturer: "Pfizer",
        dosage: "400mg",
        form: "Comprimé",
        publicPrice: "3.45",
        pharmacyPrice: "2.76",
        prescriptionRequired: false,
        currentStock: 120,
        minimumStock: 15,
        location: "C1"
      },
      {
        id: 4,
        name: "Vitamine D 1000UI",
        genericName: "Cholécalciférol",
        barcode: "3400111222333",
        manufacturer: "Roche",
        dosage: "1000UI",
        form: "Gélule",
        publicPrice: "8.90",
        pharmacyPrice: "6.23",
        prescriptionRequired: false,
        currentStock: 67,
        minimumStock: 10,
        location: "D1"
      }
    ];

    const { search } = req.query;
    let filteredProducts = products;

    if (search) {
      filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(search.toString().toLowerCase()) ||
        p.genericName.toLowerCase().includes(search.toString().toLowerCase())
      );
    }

    res.json(filteredProducts);
  });

  // Product by ID
  app.get("/api/pharmacy/products/:id", async (req, res) => {
    const productId = Number(req.params.id);
    const products = {
      1: {
        id: 1,
        name: "Paracétamol 1000mg",
        genericName: "Paracétamol",
        barcode: "3400123456789",
        description: "Antalgique et antipyrétique",
        manufacturer: "Sanofi",
        dosage: "1000mg",
        form: "Comprimé",
        publicPrice: "2.35",
        pharmacyPrice: "1.89",
        prescriptionRequired: false,
        contraindications: ["Insuffisance hépatique sévère", "Allergie au paracétamol"],
        sideEffects: ["Rares réactions allergiques"],
        precautions: ["Ne pas dépasser 4g par jour"],
        currentStock: 150,
        minimumStock: 20,
        location: "A1",
        batchNumber: "LOT2024001"
      }
    };

    const product = products[productId as keyof typeof products];
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  });

  // Customers endpoint
  app.get("/api/pharmacy/customers", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          id,
          first_name as "firstName",
          last_name as "lastName", 
          date_of_birth as "dateOfBirth",
          national_id as "nationalId",
          phone,
          email,
          address,
          social_security_number as "socialSecurityNumber",
          loyalty_level as "loyaltyLevel",
          total_purchases as "totalPurchases",
          visit_count as "visitCount",
          last_visit as "lastVisit",
          created_at as "createdAt"
        FROM customers 
        WHERE is_active = true
        ORDER BY last_visit DESC
      `);
      
      const { search } = req.query;
      let customers = result.rows;

      if (search) {
        const searchTerm = search.toString().toLowerCase();
        customers = customers.filter((c: any) => 
          c.firstName.toLowerCase().includes(searchTerm) ||
          c.lastName.toLowerCase().includes(searchTerm) ||
          c.nationalId.includes(searchTerm) ||
          (c.email && c.email.toLowerCase().includes(searchTerm))
        );
      }

      res.json(customers);
    } catch (error: any) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  // Search patient by national ID (cross-platform)
  app.get("/api/patients/search/:nationalId", async (req, res) => {
    try {
      const { nationalId } = req.params;
      
      const result = await pool.query(`
        SELECT 
          id,
          first_name as "firstName",
          last_name as "lastName", 
          date_of_birth as "dateOfBirth",
          national_id as "nationalId",
          phone,
          email,
          address,
          social_security_number as "socialSecurityNumber",
          loyalty_level as "loyaltyLevel",
          total_purchases as "totalPurchases",
          visit_count as "visitCount",
          last_visit as "lastVisit",
          created_at as "createdAt"
        FROM customers 
        WHERE national_id = $1 AND is_active = true
        LIMIT 1
      `, [nationalId]);
      
      if (result.rows.length > 0) {
        res.json({
          found: true,
          patient: result.rows[0]
        });
      } else {
        res.json({
          found: false,
          message: "Patient non trouvé dans la base de données"
        });
      }
    } catch (error: any) {
      console.error("Error searching patient:", error);
      res.status(500).json({ error: "Failed to search patient" });
    }
  });

  // Add new customer (with duplicate check)
  app.post("/api/pharmacy/customers", async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        dateOfBirth,
        nationalId,
        phone,
        email,
        address,
        socialSecurityNumber
      } = req.body;

      // Check if patient already exists
      const existingResult = await pool.query(`
        SELECT id FROM customers WHERE national_id = $1 AND is_active = true
      `, [nationalId]);

      if (existingResult.rows.length > 0) {
        return res.status(409).json({
          error: "Un patient avec ce numéro CNI existe déjà",
          existingPatientId: existingResult.rows[0].id
        });
      }

      const result = await pool.query(`
        INSERT INTO customers (
          first_name, last_name, date_of_birth, national_id, 
          phone, email, address, social_security_number,
          loyalty_level, total_purchases, visit_count, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'bronze', '0.00', 0, true)
        RETURNING 
          id,
          first_name as "firstName",
          last_name as "lastName",
          date_of_birth as "dateOfBirth", 
          national_id as "nationalId",
          phone,
          email,
          address,
          social_security_number as "socialSecurityNumber",
          loyalty_level as "loyaltyLevel",
          total_purchases as "totalPurchases",
          visit_count as "visitCount",
          created_at as "createdAt"
      `, [firstName, lastName, dateOfBirth, nationalId, phone, email, address, socialSecurityNumber]);

      res.status(201).json({
        customer: result.rows[0],
        message: "Patient ajouté avec succès"
      });
    } catch (error: any) {
      console.error("Error creating customer:", error);
      res.status(500).json({ error: "Failed to create customer" });
    }
  });

  // Import patient to pharmacy from CNI (returns patient info without creating duplicate)
  app.post("/api/pharmacy/patients/import", async (req, res) => {
    try {
      const { nationalId } = req.body;
      
      const result = await pool.query(`
        SELECT 
          id,
          first_name as "firstName",
          last_name as "lastName", 
          date_of_birth as "dateOfBirth",
          national_id as "nationalId",
          phone,
          email,
          address,
          social_security_number as "socialSecurityNumber",
          loyalty_level as "loyaltyLevel",
          total_purchases as "totalPurchases",
          visit_count as "visitCount",
          last_visit as "lastVisit"
        FROM customers 
        WHERE national_id = $1 AND is_active = true
        LIMIT 1
      `, [nationalId]);
      
      if (result.rows.length > 0) {
        res.json({
          success: true,
          patient: result.rows[0],
          message: "Patient importé avec succès",
          imported: true
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Patient non trouvé avec ce numéro CNI"
        });
      }
    } catch (error: any) {
      console.error("Error importing patient:", error);
      res.status(500).json({ error: "Failed to import patient" });
    }
  });

  // Import patient for doctor ERP from CNI
  app.post("/api/doctor/patients/import", async (req, res) => {
    try {
      const { nationalId } = req.body;
      
      const result = await pool.query(`
        SELECT 
          id,
          first_name as "firstName",
          last_name as "lastName", 
          date_of_birth as "dateOfBirth",
          national_id as "nationalId",
          phone,
          email,
          address,
          social_security_number as "socialSecurityNumber"
        FROM customers 
        WHERE national_id = $1 AND is_active = true
        LIMIT 1
      `, [nationalId]);
      
      if (result.rows.length > 0) {
        res.json({
          success: true,
          patient: result.rows[0],
          message: "Patient importé avec succès"
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Patient non trouvé avec ce numéro CNI"
        });
      }
    } catch (error: any) {
      console.error("Error importing patient:", error);
      res.status(500).json({ error: "Failed to import patient" });
    }
  });

  // Sales endpoint
  app.post("/api/pharmacy/sales", async (req, res) => {
    const { customerId, items, paymentMethod, amountReceived, notes } = req.body;
    
    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      subtotal += Number(item.quantity) * Number(item.unitPrice);
    }

    const taxAmount = subtotal * 0.20;
    const totalAmount = subtotal + taxAmount;
    const changeAmount = amountReceived ? Number(amountReceived) - totalAmount : 0;

    const saleNumber = `V-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    res.status(201).json({
      sale: {
        id: Date.now(),
        saleNumber,
        totalAmount: totalAmount.toFixed(2),
        paymentMethod,
        saleDate: new Date()
      },
      message: "Sale completed successfully"
    });
  });

  // Sales history
  app.get("/api/pharmacy/sales", async (req, res) => {
    const sales = [
      {
        id: 1,
        saleNumber: "V-2024-234",
        saleDate: new Date(),
        totalAmount: "5.67",
        paymentMethod: "vitale",
        customerName: "Marie Martin",
        cashierName: "Dr. Jean Dupont"
      },
      {
        id: 2,
        saleNumber: "V-2024-233",
        saleDate: new Date(Date.now() - 60000),
        totalAmount: "4.70",
        paymentMethod: "cash",
        customerName: "Client anonyme",
        cashierName: "Dr. Jean Dupont"
      }
    ];

    res.json(sales);
  });

  // Suppliers endpoint
  app.get("/api/pharmacy/suppliers", async (req, res) => {
    const suppliers = [
      {
        id: 1,
        name: "Alliance Healthcare",
        contactPerson: "Jean-Pierre Martin",
        email: "commandes@alliance-healthcare.fr",
        phone: "+33 1 45 67 89 01",
        deliveryDays: 2,
        rating: "4.5"
      },
      {
        id: 2,
        name: "Sanofi",
        contactPerson: "Marie Dubois",
        email: "pharmacies@sanofi.com",
        phone: "+33 1 34 56 78 90",
        deliveryDays: 3,
        rating: "4.8"
      }
    ];

    res.json(suppliers);
  });

  // Analytics endpoints
  app.get("/api/pharmacy/analytics/sales", async (req, res) => {
    const analytics = [
      { date: new Date(), dailySales: "1247.50", transactionCount: 47, averageBasket: "26.51" },
      { date: new Date(Date.now() - 86400000), dailySales: "1156.20", transactionCount: 42, averageBasket: "27.53" },
      { date: new Date(Date.now() - 172800000), dailySales: "987.30", transactionCount: 38, averageBasket: "25.98" }
    ];

    res.json(analytics);
  });

  app.get("/api/pharmacy/analytics/top-products", async (req, res) => {
    const topProducts = [
      { productId: 1, productName: "Paracétamol 1000mg", totalQuantity: 347, totalRevenue: "815.45", salesCount: 234 },
      { productId: 2, productName: "Metformine 1000mg", totalQuantity: 234, totalRevenue: "1327.78", salesCount: 156 },
      { productId: 3, productName: "Ibuprofène 400mg", totalQuantity: 198, totalRevenue: "683.10", salesCount: 145 }
    ];

    res.json(topProducts);
  });

  // Cross-platform medication sync endpoint for mobile app
  app.get("/api/patients/:nationalId/medications", async (req, res) => {
    try {
      const { nationalId } = req.params;
      
      // Get patient
      const patientResult = await pool.query(`
        SELECT id, first_name, last_name FROM customers 
        WHERE national_id = $1 AND is_active = true
      `, [nationalId]);
      
      if (patientResult.rows.length === 0) {
        return res.status(404).json({ error: "Patient non trouvé" });
      }
      
      const patient = patientResult.rows[0];
      
      // Get medications for this patient
      const medicationsResult = await pool.query(`
        SELECT 
          id,
          name,
          dosage,
          frequency,
          duration,
          instructions,
          start_date as "startDate",
          created_at as "createdAt"
        FROM medications 
        WHERE patient_name ILIKE $1
        ORDER BY created_at DESC
      `, [`%${patient.first_name} ${patient.last_name}%`]);
      
      res.json({
        patient: {
          firstName: patient.first_name,
          lastName: patient.last_name,
          nationalId: nationalId
        },
        medications: medicationsResult.rows,
        totalCount: medicationsResult.rows.length
      });
      
    } catch (error: any) {
      console.error("Error fetching patient medications:", error);
      res.status(500).json({ error: "Failed to fetch medications" });
    }
  });

  // Register new patient in central database
  app.post("/api/patients/register", async (req, res) => {
    try {
      const { 
        firstName, 
        lastName, 
        nationalId, 
        dateOfBirth, 
        phone, 
        email, 
        address, 
        socialSecurityNumber 
      } = req.body;

      // Check if patient already exists
      const existingPatient = await pool.query(`
        SELECT id FROM customers WHERE national_id = $1
      `, [nationalId]);

      if (existingPatient.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Un patient avec ce numéro CNI existe déjà"
        });
      }

      // Insert new patient
      const result = await pool.query(`
        INSERT INTO customers (
          first_name, 
          last_name, 
          national_id, 
          date_of_birth, 
          phone, 
          email, 
          address, 
          social_security_number,
          loyalty_level,
          total_purchases,
          visit_count,
          is_active,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'bronze', '0.00', 0, true, NOW())
        RETURNING id, first_name, last_name, national_id
      `, [
        firstName,
        lastName, 
        nationalId,
        dateOfBirth || null,
        phone || null,
        email || null,
        address || null,
        socialSecurityNumber || null
      ]);

      const newPatient = result.rows[0];

      res.json({
        success: true,
        patient: {
          id: newPatient.id,
          firstName: newPatient.first_name,
          lastName: newPatient.last_name,
          nationalId: newPatient.national_id
        },
        message: "Patient enregistré avec succès"
      });

    } catch (error: any) {
      console.error("Error registering patient:", error);
      res.status(500).json({ 
        success: false,
        message: "Erreur lors de l'enregistrement du patient" 
      });
    }
  });

  // Update mobile app with patient CNI for automatic sync
  app.post("/api/mobile/register-patient", async (req, res) => {
    try {
      const { nationalId } = req.body;
      
      const patientResult = await pool.query(`
        SELECT 
          first_name as "firstName",
          last_name as "lastName",
          phone,
          email
        FROM customers 
        WHERE national_id = $1 AND is_active = true
      `, [nationalId]);
      
      if (patientResult.rows.length > 0) {
        res.json({
          success: true,
          patient: patientResult.rows[0],
          message: "Patient synchronisé avec succès"
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Patient non trouvé. Contactez votre médecin."
        });
      }
      
    } catch (error: any) {
      console.error("Error registering mobile patient:", error);
      res.status(500).json({ error: "Failed to register patient" });
    }
  });

  console.log("✅ Simple Pharmacy API registered successfully");
}