import { Express, Request, Response } from "express";
import { db } from "./database.js";
import { authenticateToken, requireRole, AuthenticatedRequest, hashPassword, loginUser } from "./auth.js";
import { 
  pharmacies, pharmacyUsers, products, productCategories, pharmacyInventory,
  suppliers, supplierProducts, purchaseOrders, purchaseOrderItems,
  customers, sales, saleItems, prescriptions, prescriptionItems,
  invoices, salesAnalytics, auditLogs,
  insertPharmacyUserSchema, insertProductSchema, insertCustomerSchema,
  insertSaleSchema, insertSupplierSchema
} from "../shared/schema.js";
import { eq, desc, sql, and, gte, lte, like, ilike } from "drizzle-orm";

export function registerPharmacyRoutes(app: Express) {
  
  // ========== AUTHENTICATION ==========
  app.post("/api/pharmacy/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const result = await loginUser(email, password);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  });

  app.post("/api/pharmacy/auth/register", async (req, res) => {
    try {
      const validatedData = insertPharmacyUserSchema.parse(req.body);
      const hashedPassword = await hashPassword(validatedData.password);
      
      const newUser = await db.insert(pharmacyUsers).values({
        ...validatedData,
        password: hashedPassword,
      }).returning();

      res.status(201).json({ 
        message: "User created successfully",
        userId: newUser[0].id 
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/pharmacy/auth/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
    res.json({ user: req.user });
  });

  // ========== DASHBOARD ==========
  app.get("/api/pharmacy/dashboard", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const pharmacyId = req.user!.pharmacyId;
      const today = new Date().toISOString().split('T')[0];

      // Get today's analytics
      const todayAnalytics = await db.select()
        .from(salesAnalytics)
        .where(and(
          eq(salesAnalytics.pharmacyId, pharmacyId),
          eq(salesAnalytics.date, new Date(today))
        ))
        .limit(1);

      // Get low stock alerts
      const lowStockItems = await db.select({
        productName: products.name,
        currentStock: pharmacyInventory.currentStock,
        minimumStock: pharmacyInventory.minimumStock,
      }).from(pharmacyInventory)
        .innerJoin(products, eq(pharmacyInventory.productId, products.id))
        .where(and(
          eq(pharmacyInventory.pharmacyId, pharmacyId),
          sql`${pharmacyInventory.currentStock} <= ${pharmacyInventory.minimumStock}`
        ))
        .limit(10);

      // Get pending orders
      const pendingOrders = await db.select()
        .from(purchaseOrders)
        .where(and(
          eq(purchaseOrders.pharmacyId, pharmacyId),
          eq(purchaseOrders.status, "pending")
        ))
        .limit(5);

      // Get recent sales
      const recentSales = await db.select({
        id: sales.id,
        saleNumber: sales.saleNumber,
        totalAmount: sales.totalAmount,
        paymentMethod: sales.paymentMethod,
        saleDate: sales.saleDate,
        customerName: sql<string>`COALESCE(${customers.firstName} || ' ' || ${customers.lastName}, 'Client anonyme')`,
      }).from(sales)
        .leftJoin(customers, eq(sales.customerId, customers.id))
        .where(eq(sales.pharmacyId, pharmacyId))
        .orderBy(desc(sales.saleDate))
        .limit(10);

      res.json({
        analytics: todayAnalytics[0] || {
          dailySales: "0",
          transactionCount: 0,
          averageBasket: "0"
        },
        lowStockAlerts: lowStockItems,
        pendingOrders: pendingOrders,
        recentSales: recentSales,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== PRODUCTS MANAGEMENT ==========
  app.get("/api/pharmacy/products", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { search, category, page = 1, limit = 50 } = req.query;
      const pharmacyId = req.user!.pharmacyId;
      
      let query = db.select({
        id: products.id,
        name: products.name,
        genericName: products.genericName,
        barcode: products.barcode,
        cipCode: products.cipCode,
        manufacturer: products.manufacturer,
        dosage: products.dosage,
        form: products.form,
        publicPrice: products.publicPrice,
        pharmacyPrice: products.pharmacyPrice,
        prescriptionRequired: products.prescriptionRequired,
        currentStock: pharmacyInventory.currentStock,
        minimumStock: pharmacyInventory.minimumStock,
        location: pharmacyInventory.location,
        expiryDate: pharmacyInventory.expiryDate,
      }).from(products)
        .leftJoin(pharmacyInventory, and(
          eq(products.id, pharmacyInventory.productId),
          eq(pharmacyInventory.pharmacyId, pharmacyId)
        ));

      if (search) {
        query = query.where(
          sql`${products.name} ILIKE ${'%' + search + '%'} OR ${products.genericName} ILIKE ${'%' + search + '%'}`
        );
      }

      if (category) {
        query = query.where(eq(products.categoryId, Number(category)));
      }

      const offset = (Number(page) - 1) * Number(limit);
      const productsList = await query.limit(Number(limit)).offset(offset);

      res.json(productsList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/pharmacy/products/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const productId = Number(req.params.id);
      const pharmacyId = req.user!.pharmacyId;

      const product = await db.select({
        id: products.id,
        name: products.name,
        genericName: products.genericName,
        barcode: products.barcode,
        cipCode: products.cipCode,
        description: products.description,
        manufacturer: products.manufacturer,
        dosage: products.dosage,
        form: products.form,
        publicPrice: products.publicPrice,
        pharmacyPrice: products.pharmacyPrice,
        prescriptionRequired: products.prescriptionRequired,
        reimbursementRate: products.reimbursementRate,
        contraindications: products.contraindications,
        sideEffects: products.sideEffects,
        precautions: products.precautions,
        activeIngredients: products.activeIngredients,
        currentStock: pharmacyInventory.currentStock,
        minimumStock: pharmacyInventory.minimumStock,
        maximumStock: pharmacyInventory.maximumStock,
        location: pharmacyInventory.location,
        expiryDate: pharmacyInventory.expiryDate,
        batchNumber: pharmacyInventory.batchNumber,
      }).from(products)
        .leftJoin(pharmacyInventory, and(
          eq(products.id, pharmacyInventory.productId),
          eq(pharmacyInventory.pharmacyId, pharmacyId)
        ))
        .where(eq(products.id, productId))
        .limit(1);

      if (!product.length) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json(product[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/pharmacy/products", authenticateToken, requireRole(["pharmacist", "admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      
      const newProduct = await db.insert(products).values(validatedData).returning();
      
      res.status(201).json(newProduct[0]);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== INVENTORY MANAGEMENT ==========
  app.get("/api/pharmacy/inventory", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const pharmacyId = req.user!.pharmacyId;
      const { lowStock, expiringSoon } = req.query;

      let query = db.select({
        id: pharmacyInventory.id,
        productId: pharmacyInventory.productId,
        productName: products.name,
        currentStock: pharmacyInventory.currentStock,
        minimumStock: pharmacyInventory.minimumStock,
        maximumStock: pharmacyInventory.maximumStock,
        location: pharmacyInventory.location,
        expiryDate: pharmacyInventory.expiryDate,
        batchNumber: pharmacyInventory.batchNumber,
        lastRestockDate: pharmacyInventory.lastRestockDate,
      }).from(pharmacyInventory)
        .innerJoin(products, eq(pharmacyInventory.productId, products.id))
        .where(eq(pharmacyInventory.pharmacyId, pharmacyId));

      if (lowStock === 'true') {
        query = query.where(sql`${pharmacyInventory.currentStock} <= ${pharmacyInventory.minimumStock}`);
      }

      if (expiringSoon === 'true') {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        query = query.where(lte(pharmacyInventory.expiryDate, thirtyDaysFromNow));
      }

      const inventory = await query.orderBy(products.name);
      res.json(inventory);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/pharmacy/inventory/:id", authenticateToken, requireRole(["pharmacist", "admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      const inventoryId = Number(req.params.id);
      const { currentStock, minimumStock, maximumStock, location, expiryDate, batchNumber } = req.body;
      
      const updated = await db.update(pharmacyInventory)
        .set({
          currentStock,
          minimumStock,
          maximumStock,
          location,
          expiryDate: expiryDate ? new Date(expiryDate) : undefined,
          batchNumber,
          updatedAt: new Date(),
        })
        .where(eq(pharmacyInventory.id, inventoryId))
        .returning();

      if (!updated.length) {
        return res.status(404).json({ error: "Inventory item not found" });
      }

      res.json(updated[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== CUSTOMER MANAGEMENT ==========
  app.get("/api/pharmacy/customers", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { search, page = 1, limit = 50 } = req.query;
      
      let query = db.select({
        id: customers.id,
        firstName: customers.firstName,
        lastName: customers.lastName,
        nationalId: customers.nationalId,
        phone: customers.phone,
        email: customers.email,
        loyaltyLevel: customers.loyaltyLevel,
        totalPurchases: customers.totalPurchases,
        visitCount: customers.visitCount,
        lastVisit: customers.lastVisit,
      }).from(customers)
        .where(eq(customers.isActive, true));

      if (search) {
        query = query.where(
          sql`${customers.firstName} ILIKE ${'%' + search + '%'} OR ${customers.lastName} ILIKE ${'%' + search + '%'} OR ${customers.nationalId} ILIKE ${'%' + search + '%'}`
        );
      }

      const offset = (Number(page) - 1) * Number(limit);
      const customersList = await query.limit(Number(limit)).offset(offset).orderBy(customers.lastName, customers.firstName);

      res.json(customersList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/pharmacy/customers/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const customerId = Number(req.params.id);

      const customer = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
      
      if (!customer.length) {
        return res.status(404).json({ error: "Customer not found" });
      }

      // Get customer's recent purchases
      const recentPurchases = await db.select({
        id: sales.id,
        saleNumber: sales.saleNumber,
        saleDate: sales.saleDate,
        totalAmount: sales.totalAmount,
        paymentMethod: sales.paymentMethod,
      }).from(sales)
        .where(eq(sales.customerId, customerId))
        .orderBy(desc(sales.saleDate))
        .limit(10);

      res.json({
        ...customer[0],
        recentPurchases,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/pharmacy/customers", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      
      const newCustomer = await db.insert(customers).values(validatedData).returning();
      
      res.status(201).json(newCustomer[0]);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== SALES MANAGEMENT ==========
  app.post("/api/pharmacy/sales", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const pharmacyId = req.user!.pharmacyId;
      const cashierId = req.user!.id;
      
      const { customerId, items, paymentMethod, amountReceived, notes } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Sale items are required" });
      }

      // Calculate totals
      let subtotal = 0;
      for (const item of items) {
        subtotal += Number(item.quantity) * Number(item.unitPrice);
      }

      const taxAmount = subtotal * 0.20; // 20% VAT
      const totalAmount = subtotal + taxAmount;
      const changeAmount = amountReceived ? Number(amountReceived) - totalAmount : 0;

      // Generate sale number
      const saleNumber = `V-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      // Create sale
      const newSale = await db.insert(sales).values({
        saleNumber,
        pharmacyId,
        customerId: customerId || null,
        cashierId,
        paymentMethod,
        subtotal: String(subtotal),
        taxAmount: String(taxAmount),
        totalAmount: String(totalAmount),
        amountReceived: amountReceived ? String(amountReceived) : null,
        changeAmount: changeAmount > 0 ? String(changeAmount) : null,
        notes,
      }).returning();

      // Create sale items
      const saleItemsData = items.map((item: any) => ({
        saleId: newSale[0].id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: String(item.unitPrice),
        totalPrice: String(Number(item.quantity) * Number(item.unitPrice)),
        discountAmount: item.discountAmount ? String(item.discountAmount) : "0",
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
      }));

      await db.insert(saleItems).values(saleItemsData);

      // Update inventory
      for (const item of items) {
        await db.update(pharmacyInventory)
          .set({
            currentStock: sql`${pharmacyInventory.currentStock} - ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(and(
            eq(pharmacyInventory.pharmacyId, pharmacyId),
            eq(pharmacyInventory.productId, item.productId)
          ));
      }

      // Update customer stats if customer provided
      if (customerId) {
        await db.update(customers)
          .set({
            totalPurchases: sql`${customers.totalPurchases} + ${totalAmount}`,
            visitCount: sql`${customers.visitCount} + 1`,
            lastVisit: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(customers.id, customerId));
      }

      res.status(201).json({
        sale: newSale[0],
        message: "Sale completed successfully"
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/pharmacy/sales", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const pharmacyId = req.user!.pharmacyId;
      const { startDate, endDate, page = 1, limit = 50 } = req.query;

      let query = db.select({
        id: sales.id,
        saleNumber: sales.saleNumber,
        saleDate: sales.saleDate,
        totalAmount: sales.totalAmount,
        paymentMethod: sales.paymentMethod,
        customerName: sql<string>`COALESCE(${customers.firstName} || ' ' || ${customers.lastName}, 'Client anonyme')`,
        cashierName: sql<string>`${pharmacyUsers.firstName} || ' ' || ${pharmacyUsers.lastName}`,
      }).from(sales)
        .leftJoin(customers, eq(sales.customerId, customers.id))
        .innerJoin(pharmacyUsers, eq(sales.cashierId, pharmacyUsers.id))
        .where(eq(sales.pharmacyId, pharmacyId));

      if (startDate) {
        query = query.where(gte(sales.saleDate, new Date(startDate as string)));
      }

      if (endDate) {
        query = query.where(lte(sales.saleDate, new Date(endDate as string)));
      }

      const offset = (Number(page) - 1) * Number(limit);
      const salesList = await query
        .orderBy(desc(sales.saleDate))
        .limit(Number(limit))
        .offset(offset);

      res.json(salesList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== SUPPLIERS MANAGEMENT ==========
  app.get("/api/pharmacy/suppliers", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const suppliersList = await db.select().from(suppliers).where(eq(suppliers.isActive, true));
      res.json(suppliersList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/pharmacy/suppliers", authenticateToken, requireRole(["pharmacist", "admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      
      const newSupplier = await db.insert(suppliers).values(validatedData).returning();
      
      res.status(201).json(newSupplier[0]);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== ANALYTICS ==========
  app.get("/api/pharmacy/analytics/sales", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const pharmacyId = req.user!.pharmacyId;
      const { startDate, endDate, period = 'daily' } = req.query;
      
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const analytics = await db.select().from(salesAnalytics)
        .where(and(
          eq(salesAnalytics.pharmacyId, pharmacyId),
          gte(salesAnalytics.date, start),
          lte(salesAnalytics.date, end)
        ))
        .orderBy(salesAnalytics.date);

      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/pharmacy/analytics/top-products", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const pharmacyId = req.user!.pharmacyId;
      const { startDate, endDate, limit = 10 } = req.query;
      
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const topProducts = await db.select({
        productId: saleItems.productId,
        productName: products.name,
        totalQuantity: sql<number>`SUM(${saleItems.quantity})`,
        totalRevenue: sql<number>`SUM(${saleItems.totalPrice})`,
        salesCount: sql<number>`COUNT(DISTINCT ${saleItems.saleId})`,
      }).from(saleItems)
        .innerJoin(sales, eq(saleItems.saleId, sales.id))
        .innerJoin(products, eq(saleItems.productId, products.id))
        .where(and(
          eq(sales.pharmacyId, pharmacyId),
          gte(sales.saleDate, start),
          lte(sales.saleDate, end)
        ))
        .groupBy(saleItems.productId, products.name)
        .orderBy(sql`SUM(${saleItems.quantity}) DESC`)
        .limit(Number(limit));

      res.json(topProducts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}