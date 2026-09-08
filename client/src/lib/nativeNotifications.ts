type MedicationReminderInput = {
  id?: number;
  name: string;
  dosage?: string | null;
  times?: string[] | null;
};

function notificationId(medicationId: number, index: number) {
  return Math.abs((medicationId * 100 + index + 1) % 2147483646) || 1;
}

export async function scheduleMedicationNotifications(medication: MedicationReminderInput) {
  if (!medication.id || !medication.times?.length) return;
  try {
    const [{ Capacitor }, { LocalNotifications }] = await Promise.all([
      import('@capacitor/core'),
      import('@capacitor/local-notifications'),
    ]);
    if (!Capacitor.isNativePlatform()) return;

    let permission = await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted') permission = await LocalNotifications.requestPermissions();
    if (permission.display !== 'granted') return;

    const notifications = medication.times.map((time, index) => {
      const [hour, minute] = time.split(':').map(Number);
      return {
        id: notificationId(medication.id!, index),
        title: `💊 ${medication.name}`,
        body: medication.dosage ? `Il est temps de prendre ${medication.dosage}.` : 'Il est temps de prendre votre médicament.',
        schedule: { on: { hour, minute }, allowWhileIdle: true },
        extra: { medicationId: medication.id },
      };
    });
    await LocalNotifications.schedule({ notifications });
  } catch (error) {
    console.warn('Native notifications unavailable:', error);
  }
}

export async function cancelMedicationNotifications(medicationId: number, count = 12) {
  try {
    const [{ Capacitor }, { LocalNotifications }] = await Promise.all([
      import('@capacitor/core'),
      import('@capacitor/local-notifications'),
    ]);
    if (!Capacitor.isNativePlatform()) return;
    await LocalNotifications.cancel({ notifications: Array.from({ length: count }, (_, i) => ({ id: notificationId(medicationId, i) })) });
  } catch (error) {
    console.warn('Could not cancel native notifications:', error);
  }
}
