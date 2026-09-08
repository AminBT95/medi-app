import express from 'express';
import { db } from './database.js';
import { appointments, appointmentServices, medicalBills, doctors } from '../shared/schema.js';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

const router = express.Router();

// Get today's appointments for a doctor
router.get('/appointments/today/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todayAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, parseInt(doctorId)),
          gte(appointments.appointmentDate, startOfDay),
          lte(appointments.appointmentDate, endOfDay)
        )
      )
      .orderBy(appointments.appointmentDate);

    // Get services for each appointment
    const appointmentsWithServices = await Promise.all(
      todayAppointments.map(async (appointment) => {
        const services = await db
          .select()
          .from(appointmentServices)
          .where(eq(appointmentServices.appointmentId, appointment.id));

        const totalServicesAmount = services.reduce((total, service) => 
          total + parseFloat(service.totalPrice.toString()), 0
        );

        return {
          ...appointment,
          services,
          totalAmount: parseFloat(appointment.basePrice.toString()) + totalServicesAmount
        };
      })
    );

    res.json(appointmentsWithServices);
  } catch (error) {
    console.error('Error fetching today appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Update appointment status
router.patch('/appointments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, doctorNotes } = req.body;

    const updatedAppointment = await db
      .update(appointments)
      .set({
        status,
        doctorNotes,
        updatedAt: new Date()
      })
      .where(eq(appointments.id, parseInt(id)))
      .returning();

    res.json(updatedAppointment[0]);
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Add service to appointment
router.post('/appointments/:id/services', async (req, res) => {
  try {
    const { id } = req.params;
    const { serviceType, serviceName, description, unitPrice, quantity } = req.body;

    const totalPrice = parseFloat(unitPrice) * parseInt(quantity);

    const newService = await db
      .insert(appointmentServices)
      .values({
        appointmentId: parseInt(id),
        serviceType,
        serviceName,
        description,
        unitPrice: unitPrice.toString(),
        quantity,
        totalPrice: totalPrice.toString()
      })
      .returning();

    res.json(newService[0]);
  } catch (error) {
    console.error('Error adding service:', error);
    res.status(500).json({ error: 'Failed to add service' });
  }
});

// Delete service from appointment
router.delete('/appointments/services/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;

    await db
      .delete(appointmentServices)
      .where(eq(appointmentServices.id, parseInt(serviceId)));

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// Create medical bill for appointment
router.post('/appointments/:id/bill', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, discountAmount, insuranceCovered, notes } = req.body;

    // Get appointment details
    const appointment = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, parseInt(id)))
      .limit(1);

    if (!appointment.length) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Get services
    const services = await db
      .select()
      .from(appointmentServices)
      .where(eq(appointmentServices.appointmentId, parseInt(id)));

    // Calculate totals
    const baseAmount = parseFloat(appointment[0].basePrice.toString());
    const servicesAmount = services.reduce((total, service) => 
      total + parseFloat(service.totalPrice.toString()), 0
    );
    const subtotal = baseAmount + servicesAmount;
    const discount = parseFloat(discountAmount) || 0;
    const insurance = parseFloat(insuranceCovered) || 0;
    const taxAmount = (subtotal - discount) * 0.20; // 20% TVA
    const totalAmount = subtotal - discount + taxAmount - insurance;

    // Generate bill number
    const billCount = await db.select().from(medicalBills);
    const billNumber = `BILL-${Date.now()}-${(billCount.length + 1).toString().padStart(4, '0')}`;

    const newBill = await db
      .insert(medicalBills)
      .values({
        billNumber,
        appointmentId: parseInt(id),
        doctorId: appointment[0].doctorId,
        patientName: appointment[0].patientName,
        nationalId: appointment[0].nationalId,
        subtotal: subtotal.toString(),
        discountAmount: discount.toString(),
        taxAmount: taxAmount.toString(),
        totalAmount: totalAmount.toString(),
        paymentMethod,
        paymentStatus: 'pending',
        paidAmount: '0',
        insuranceCovered: insurance.toString(),
        notes
      })
      .returning();

    // Update appointment status to completed
    await db
      .update(appointments)
      .set({ status: 'completed', updatedAt: new Date() })
      .where(eq(appointments.id, parseInt(id)));

    res.json(newBill[0]);
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({ error: 'Failed to create bill' });
  }
});

// Process payment
router.patch('/bills/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { paidAmount, paymentMethod, paymentStatus } = req.body;

    const updatedBill = await db
      .update(medicalBills)
      .set({
        paidAmount: paidAmount.toString(),
        paymentMethod,
        paymentStatus
      })
      .where(eq(medicalBills.id, parseInt(id)))
      .returning();

    res.json(updatedBill[0]);
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// Get bills for today
router.get('/bills/today/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todayBills = await db
      .select()
      .from(medicalBills)
      .where(
        and(
          eq(medicalBills.doctorId, parseInt(doctorId)),
          gte(medicalBills.billDate, startOfDay),
          lte(medicalBills.billDate, endOfDay)
        )
      )
      .orderBy(desc(medicalBills.billDate));

    res.json(todayBills);
  } catch (error) {
    console.error('Error fetching today bills:', error);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

// Create new appointment
router.post('/appointments', async (req, res) => {
  try {
    const { appointmentNumber, doctorId, patientName, patientPhone, patientEmail, 
            nationalId, appointmentDate, duration, type, secretaryNotes, basePrice } = req.body;

    const newAppointment = await db
      .insert(appointments)
      .values({
        appointmentNumber,
        doctorId,
        patientName,
        patientPhone,
        patientEmail,
        nationalId,
        appointmentDate: new Date(appointmentDate),
        duration,
        type,
        secretaryNotes,
        basePrice: basePrice.toString()
      })
      .returning();

    res.json(newAppointment[0]);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

export default router;