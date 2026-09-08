import { db } from "./database.js";
import { 
  pharmacies, pharmacyUsers, productCategories, products, pharmacyInventory,
  suppliers, supplierProducts, customers
} from "../shared/schema.js";
import { hashPassword } from "./auth.js";

export async function seedDatabase() {
  try {
    console.log("🌱 Seeding database with initial data...");

    // Create main pharmacy
    const [pharmacy] = await db.insert(pharmacies).values({
      name: "Pharmacie Centrale",
      finessNumber: "750001234",
      address: "15 rue de la République, 75001 Paris, France",
      phone: "+33 1 42 36 78 90",
      email: "contact@pharmacie-centrale.fr",
      openingHours: {
        monday: { open: "08:30", close: "19:30" },
        tuesday: { open: "08:30", close: "19:30" },
        wednesday: { open: "08:30", close: "19:30" },
        thursday: { open: "08:30", close: "19:30" },
        friday: { open: "08:30", close: "19:30" },
        saturday: { open: "09:00", close: "18:00" },
        sunday: { closed: true }
      }
    }).returning();

    // Create pharmacy users
    const hashedPassword = await hashPassword("admin123");
    
    await db.insert(pharmacyUsers).values([
      {
        pharmacyId: pharmacy.id,
        email: "pharmacien@pharmacie-centrale.fr",
        password: hashedPassword,
        firstName: "Dr. Jean",
        lastName: "Dupont",
        role: "pharmacist"
      },
      {
        pharmacyId: pharmacy.id,
        email: "assistant@pharmacie-centrale.fr",
        password: hashedPassword,
        firstName: "Marie",
        lastName: "Leroy",
        role: "assistant"
      }
    ]);

    // Create product categories
    const [medCategory] = await db.insert(productCategories).values({
      name: "Médicaments sur ordonnance",
      description: "Médicaments nécessitant une prescription médicale"
    }).returning();

    const [otcCategory] = await db.insert(productCategories).values({
      name: "Automédication",
      description: "Médicaments en vente libre"
    }).returning();

    const [paraCategory] = await db.insert(productCategories).values({
      name: "Parapharmacie",
      description: "Produits de santé et beauté"
    }).returning();

    // Create products
    const productsData = [
      {
        name: "Paracétamol 1000mg",
        genericName: "Paracétamol",
        barcode: "3400123456789",
        cipCode: "3400930",
        description: "Antalgique et antipyrétique",
        categoryId: otcCategory.id,
        manufacturer: "Sanofi",
        dosage: "1000mg",
        form: "Comprimé",
        prescriptionRequired: false,
        reimbursementRate: "65.00",
        publicPrice: "2.35",
        pharmacyPrice: "1.89",
        contraindications: ["Insuffisance hépatique sévère", "Allergie au paracétamol"],
        sideEffects: ["Rares réactions allergiques"],
        precautions: ["Ne pas dépasser 4g par jour"],
        activeIngredients: [{ name: "Paracétamol", quantity: "1000mg" }]
      },
      {
        name: "Metformine 1000mg",
        genericName: "Metformine",
        barcode: "3400987654321",
        cipCode: "3401234",
        description: "Antidiabétique oral",
        categoryId: medCategory.id,
        manufacturer: "Merck",
        dosage: "1000mg",
        form: "Comprimé",
        prescriptionRequired: true,
        reimbursementRate: "65.00",
        publicPrice: "5.67",
        pharmacyPrice: "4.20",
        contraindications: ["Insuffisance rénale", "Acidocétose diabétique"],
        sideEffects: ["Troubles digestifs", "Goût métallique"],
        precautions: ["Surveillance de la fonction rénale"],
        activeIngredients: [{ name: "Metformine HCl", quantity: "1000mg" }]
      },
      {
        name: "Ibuprofène 400mg",
        genericName: "Ibuprofène",
        barcode: "3400555666777",
        cipCode: "3402345",
        description: "Anti-inflammatoire non stéroïdien",
        categoryId: otcCategory.id,
        manufacturer: "Pfizer",
        dosage: "400mg",
        form: "Comprimé",
        prescriptionRequired: false,
        reimbursementRate: "30.00",
        publicPrice: "3.45",
        pharmacyPrice: "2.76",
        contraindications: ["Ulcère gastroduodénal", "Insuffisance cardiaque"],
        sideEffects: ["Troubles digestifs", "Maux de tête"],
        precautions: ["Prendre pendant les repas"],
        activeIngredients: [{ name: "Ibuprofène", quantity: "400mg" }]
      },
      {
        name: "Vitamine D 1000UI",
        genericName: "Cholécalciférol",
        barcode: "3400111222333",
        cipCode: "3403456",
        description: "Supplément vitaminique",
        categoryId: paraCategory.id,
        manufacturer: "Roche",
        dosage: "1000UI",
        form: "Gélule",
        prescriptionRequired: false,
        reimbursementRate: "0.00",
        publicPrice: "8.90",
        pharmacyPrice: "6.23",
        contraindications: ["Hypercalcémie"],
        sideEffects: ["Troubles digestifs à forte dose"],
        precautions: ["Surveillance calcémie"],
        activeIngredients: [{ name: "Cholécalciférol", quantity: "1000UI" }]
      },
      {
        name: "Aspirine 500mg",
        genericName: "Acide acétylsalicylique",
        barcode: "3400444555666",
        cipCode: "3404567",
        description: "Antalgique, antipyrétique, antiagrégant",
        categoryId: otcCategory.id,
        manufacturer: "Bayer",
        dosage: "500mg",
        form: "Comprimé",
        prescriptionRequired: false,
        reimbursementRate: "30.00",
        publicPrice: "1.95",
        pharmacyPrice: "1.37",
        contraindications: ["Allergie aux salicylés", "Ulcère gastroduodénal"],
        sideEffects: ["Troubles digestifs", "Bourdonnements d'oreilles"],
        precautions: ["Éviter chez l'enfant de moins de 16 ans"],
        activeIngredients: [{ name: "Acide acétylsalicylique", quantity: "500mg" }]
      },
      {
        name: "Doliprane 500mg",
        genericName: "Paracétamol",
        barcode: "3400777888999",
        cipCode: "3405678",
        description: "Antalgique et antipyrétique",
        categoryId: otcCategory.id,
        manufacturer: "Sanofi",
        dosage: "500mg",
        form: "Comprimé",
        prescriptionRequired: false,
        reimbursementRate: "65.00",
        publicPrice: "2.15",
        pharmacyPrice: "1.72",
        contraindications: ["Insuffisance hépatique sévère"],
        sideEffects: ["Rares réactions allergiques"],
        precautions: ["Ne pas dépasser 4g par jour"],
        activeIngredients: [{ name: "Paracétamol", quantity: "500mg" }]
      }
    ];

    const insertedProducts = await db.insert(products).values(productsData).returning();

    // Create inventory for each product
    const inventoryData = insertedProducts.map((product, index) => ({
      pharmacyId: pharmacy.id,
      productId: product.id,
      currentStock: [150, 85, 120, 67, 200, 180][index],
      minimumStock: [20, 10, 15, 10, 25, 20][index],
      maximumStock: [500, 200, 300, 150, 600, 400][index],
      location: [`A${index + 1}`, `B${index + 1}`, `C${index + 1}`, `D${index + 1}`, `E${index + 1}`, `F${index + 1}`][index],
      expiryDate: new Date(Date.now() + (365 + index * 30) * 24 * 60 * 60 * 1000),
      batchNumber: `LOT${2024}${String(index + 1).padStart(3, '0')}`,
      supplierPrice: String([1.50, 3.20, 2.10, 4.50, 1.00, 1.30][index])
    }));

    await db.insert(pharmacyInventory).values(inventoryData);

    // Create suppliers
    const suppliersData = [
      {
        name: "Alliance Healthcare",
        contactPerson: "Jean-Pierre Martin",
        email: "commandes@alliance-healthcare.fr",
        phone: "+33 1 45 67 89 01",
        address: "Zone Industrielle, 77200 Torcy",
        paymentTerms: "30 jours",
        deliveryDays: 2,
        minOrderAmount: "500.00",
        rating: "4.5"
      },
      {
        name: "Sanofi",
        contactPerson: "Marie Dubois",
        email: "pharmacies@sanofi.com",
        phone: "+33 1 34 56 78 90",
        address: "82 avenue Raspail, 94250 Gentilly",
        paymentTerms: "45 jours",
        deliveryDays: 3,
        minOrderAmount: "1000.00",
        rating: "4.8"
      },
      {
        name: "Pfizer France",
        contactPerson: "Antoine Leroy",
        email: "commandes@pfizer.fr",
        phone: "+33 1 56 78 90 12",
        address: "23-25 avenue du Docteur Lannelongue, 75014 Paris",
        paymentTerms: "30 jours",
        deliveryDays: 2,
        minOrderAmount: "750.00",
        rating: "4.6"
      }
    ];

    const insertedSuppliers = await db.insert(suppliers).values(suppliersData).returning();

    // Create supplier-product relationships
    const supplierProductsData = [
      // Alliance Healthcare supplies most products
      { supplierId: insertedSuppliers[0].id, productId: insertedProducts[0].id, supplierProductCode: "AH-PAR1000", supplierPrice: "1.50", minimumOrderQty: 10, packSize: 20 },
      { supplierId: insertedSuppliers[0].id, productId: insertedProducts[2].id, supplierProductCode: "AH-IBU400", supplierPrice: "2.10", minimumOrderQty: 5, packSize: 30 },
      { supplierId: insertedSuppliers[0].id, productId: insertedProducts[4].id, supplierProductCode: "AH-ASP500", supplierPrice: "1.00", minimumOrderQty: 20, packSize: 50 },
      
      // Sanofi supplies their own products
      { supplierId: insertedSuppliers[1].id, productId: insertedProducts[0].id, supplierProductCode: "SF-PAR1000", supplierPrice: "1.48", minimumOrderQty: 5, packSize: 20 },
      { supplierId: insertedSuppliers[1].id, productId: insertedProducts[5].id, supplierProductCode: "SF-DOL500", supplierPrice: "1.30", minimumOrderQty: 10, packSize: 16 },
      
      // Pfizer supplies their products
      { supplierId: insertedSuppliers[2].id, productId: insertedProducts[2].id, supplierProductCode: "PF-IBU400", supplierPrice: "2.05", minimumOrderQty: 10, packSize: 24 }
    ];

    await db.insert(supplierProducts).values(supplierProductsData);

    // Create sample customers
    const customersData = [
      {
        firstName: "Marie",
        lastName: "Martin",
        dateOfBirth: new Date("1965-03-15"),
        nationalId: "123456789",
        phone: "+33 1 23 45 67 89",
        email: "marie.martin@email.com",
        address: "12 rue des Lilas, 75015 Paris",
        socialSecurityNumber: "265034512345678",
        loyaltyLevel: "vip",
        totalPurchases: "847.50",
        visitCount: 47,
        lastVisit: new Date()
      },
      {
        firstName: "Pierre",
        lastName: "Durand",
        dateOfBirth: new Date("1958-08-22"),
        nationalId: "987654321",
        phone: "+33 1 98 76 54 32",
        email: "pierre.durand@email.com",
        address: "45 avenue de la République, 75011 Paris",
        socialSecurityNumber: "158084512987654",
        loyaltyLevel: "gold",
        totalPurchases: "1234.75",
        visitCount: 63,
        lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        firstName: "Sophie",
        lastName: "Bernard",
        dateOfBirth: new Date("1980-12-03"),
        nationalId: "456789123",
        phone: "+33 1 45 67 89 01",
        email: "sophie.bernard@email.com",
        address: "7 place de la Bastille, 75004 Paris",
        socialSecurityNumber: "280124512456789",
        loyaltyLevel: "silver",
        totalPurchases: "356.20",
        visitCount: 28,
        lastVisit: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ];

    await db.insert(customers).values(customersData);

    console.log("✅ Database seeded successfully!");
    console.log("📊 Created:");
    console.log("  - 1 pharmacy");
    console.log("  - 2 pharmacy users");
    console.log("  - 3 product categories");
    console.log("  - 6 products with inventory");
    console.log("  - 3 suppliers");
    console.log("  - 6 supplier-product relationships");
    console.log("  - 3 customers");
    console.log("\n🔑 Login credentials:");
    console.log("  Pharmacist: pharmacien@pharmacie-centrale.fr / admin123");
    console.log("  Assistant: assistant@pharmacie-centrale.fr / admin123");

    return true;
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    return false;
  }
}

// Auto-seed if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0));
}