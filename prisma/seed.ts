import prisma from "@/lib/prisma";
import "dotenv/config";

export async function main() {
  // Users
  const usersData = [
    { email: "alice@example.com", name: "Alice" },
    { email: "bob@example.com", name: "Bob" },
    { email: "carol@example.com", name: "Carol" },
    { email: "dave@example.com", name: "Dave" },
    { email: "eve@example.com", name: "Eve" },
    { email: "frank@example.com", name: "Frank" },
  ];

  const users: Record<
    string,
    { id: string; email: string; name: string | null }
  > = {};
  for (const u of usersData) {
    const up = await prisma.user.upsert({
      where: { email: u.email },
      create: u,
      update: {},
    });
    users[u.email] = up as { id: string; email: string; name: string | null };
  }

  // Patients
  const patientsData = [
    {
      email: "patient.anna@example.com",
      phone: "+3610000001",
      name: "Anna Patient",
      birthDate: new Date("1990-02-15T00:00:00Z"),
      sex: "FEMALE" as const,
    },
    {
      email: "patient.bela@example.com",
      phone: "+3610000002",
      name: "Béla Páciens",
      birthDate: new Date("1985-06-20T00:00:00Z"),
      sex: "MALE" as const,
    },
    {
      email: "patient.csilla@example.com",
      phone: "+3610000003",
      name: "Csilla Páciens",
      birthDate: new Date("2000-11-05T00:00:00Z"),
      sex: "FEMALE" as const,
    },
    {
      email: "patient.denes@example.com",
      phone: "+3610000004",
      name: "Dénes Páciens",
      birthDate: new Date("1978-09-12T00:00:00Z"),
      sex: "OTHER" as const,
    },
    {
      email: "patient.eva@example.com",
      phone: "+3610000005",
      name: "Éva Páciens",
      birthDate: new Date("1992-01-10T00:00:00Z"),
      sex: "FEMALE" as const,
    },
    {
      email: "patient.ferenc@example.com",
      phone: "+3610000006",
      name: "Ferenc Páciens",
      birthDate: new Date("1989-03-03T00:00:00Z"),
      sex: "MALE" as const,
    },
    {
      email: "patient.gyorgy@example.com",
      phone: "+3610000007",
      name: "György Páciens",
      birthDate: new Date("1975-12-25T00:00:00Z"),
      sex: "MALE" as const,
    },
    {
      email: "patient.hanna@example.com",
      phone: "+3610000008",
      name: "Hanna Páciens",
      birthDate: new Date("2001-07-07T00:00:00Z"),
      sex: "FEMALE" as const,
    },
  ];

  const patients: Record<string, { id: string; email: string; phone: string }> =
    {};
  for (const p of patientsData) {
    const up = await prisma.patient.upsert({
      where: { email: p.email },
      create: p,
      update: {
        // keep phone/name/birthDate updated if email already exists
        phone: p.phone,
        name: p.name,
        birthDate: p.birthDate,
        sex: p.sex,
      },
    });
    patients[p.email] = up as { id: string; email: string; phone: string };
  }

  // Doctor-Patient assignments
  const assignments: Array<{ doctorEmail: string; patientEmail: string }> = [
    {
      doctorEmail: "alice@example.com",
      patientEmail: "patient.anna@example.com",
    },
    {
      doctorEmail: "bob@example.com",
      patientEmail: "patient.bela@example.com",
    },
    {
      doctorEmail: "carol@example.com",
      patientEmail: "patient.csilla@example.com",
    },
    {
      doctorEmail: "dave@example.com",
      patientEmail: "patient.denes@example.com",
    },
    // cross-assignments to test unique constraints
    {
      doctorEmail: "alice@example.com",
      patientEmail: "patient.csilla@example.com",
    },
    // Alice has 3 patients
    {
      doctorEmail: "alice@example.com",
      patientEmail: "patient.hanna@example.com",
    },
    // Bob has 2 patients
    {
      doctorEmail: "bob@example.com",
      patientEmail: "patient.ferenc@example.com",
    },
    // Carol has 2 patients
    {
      doctorEmail: "carol@example.com",
      patientEmail: "patient.eva@example.com",
    },
    // Dave has 2 patients
    {
      doctorEmail: "dave@example.com",
      patientEmail: "patient.gyorgy@example.com",
    },
    // Eve has 1 patient
    {
      doctorEmail: "eve@example.com",
      patientEmail: "patient.hanna@example.com",
    },
    // Frank has 1 patient
    {
      doctorEmail: "frank@example.com",
      patientEmail: "patient.ferenc@example.com",
    },
  ];

  for (const a of assignments) {
    const user = users[a.doctorEmail];
    const patient = patients[a.patientEmail];
    if (!user || !patient) continue;
    await prisma.userPatient.upsert({
      where: { userId_patientId: { userId: user.id, patientId: patient.id } },
      create: { userId: user.id, patientId: patient.id },
      update: {},
    });
  }

  // Seed Operations used by appointments
  const operationNames = ["Consultation", "Follow-up", "Checkup"] as const;
  const operations: Record<string, { id: string; name: string }> = {};
  for (const name of operationNames) {
    const existingOp = await prisma.operation.findFirst({ where: { name } });
    const op =
      existingOp ??
      (await prisma.operation.create({
        data: {
          name,
          price:
            name === "Consultation"
              ? 15000
              : name === "Follow-up"
                ? 12000
                : 10000,
        },
      }));
    operations[name] = op as { id: string; name: string };
  }

  const teethCodes = [
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "31",
    "32",
    "33",
    "34",
    "35",
    "36",
    "37",
    "38",
    "41",
    "42",
    "43",
    "44",
    "45",
    "46",
    "47",
    "48",
  ];

  for (const code of teethCodes) {
    await prisma.tooth.upsert({
      where: { code },
      create: { code },
      update: {},
    });
  }

  for (const patient of Object.values(patients)) {
    await prisma.patientTooth.createMany({
      data: teethCodes.map((toothCode) => ({
        patientId: patient.id,
        toothCode,
      })),
      skipDuplicates: true,
    });
  }

  // Create time-based appointments for seeded doctors
  const baseDate = new Date(2026, 1, 10, 9, 0, 0, 0);
  const buildDate = (dayOffset: number, hour: number, minute: number) =>
    new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate() + dayOffset,
      hour,
      minute,
      0,
      0,
    );

  const appointmentPlan: Array<{
    doctorEmail: string;
    patientEmail: string;
    title: string;
    dayOffset: number;
    startHour: number;
    startMinute: number;
    durationMinutes: number;
    toothOperations: Array<{
      toothCode: string;
      operationName: (typeof operationNames)[number];
    }>;
  }> = [
    {
      doctorEmail: "alice@example.com",
      patientEmail: "patient.anna@example.com",
      title: "Konzultáció - Anna",
      dayOffset: 0,
      startHour: 9,
      startMinute: 0,
      durationMinutes: 45,
      toothOperations: [
        { toothCode: "11", operationName: "Consultation" },
        { toothCode: "12", operationName: "Checkup" },
      ],
    },
    {
      doctorEmail: "alice@example.com",
      patientEmail: "patient.csilla@example.com",
      title: "Kontroll - Csilla",
      dayOffset: 0,
      startHour: 11,
      startMinute: 0,
      durationMinutes: 30,
      toothOperations: [{ toothCode: "21", operationName: "Follow-up" }],
    },
    {
      doctorEmail: "bob@example.com",
      patientEmail: "patient.bela@example.com",
      title: "Állapotfelmérés - Béla",
      dayOffset: 1,
      startHour: 10,
      startMinute: 0,
      durationMinutes: 45,
      toothOperations: [
        { toothCode: "31", operationName: "Consultation" },
        { toothCode: "32", operationName: "Checkup" },
      ],
    },
    {
      doctorEmail: "carol@example.com",
      patientEmail: "patient.eva@example.com",
      title: "Rutin vizsgálat - Éva",
      dayOffset: 1,
      startHour: 13,
      startMinute: 30,
      durationMinutes: 30,
      toothOperations: [{ toothCode: "41", operationName: "Checkup" }],
    },
    {
      doctorEmail: "dave@example.com",
      patientEmail: "patient.denes@example.com",
      title: "Konzultáció - Dénes",
      dayOffset: 2,
      startHour: 9,
      startMinute: 30,
      durationMinutes: 45,
      toothOperations: [{ toothCode: "16", operationName: "Consultation" }],
    },
  ];

  for (const plan of appointmentPlan) {
    const doctor = users[plan.doctorEmail];
    const pat = patients[plan.patientEmail];
    if (!doctor || !pat) continue;

    await prisma.userPatient.upsert({
      where: { userId_patientId: { userId: doctor.id, patientId: pat.id } },
      create: { userId: doctor.id, patientId: pat.id },
      update: {},
    });

    const start = buildDate(plan.dayOffset, plan.startHour, plan.startMinute);
    const endTime = new Date(
      start.getTime() + plan.durationMinutes * 60 * 1000,
    );

    // Avoid duplicates: check by title + user + patient + start
    const existing = await prisma.appointment.findFirst({
      where: {
        title: plan.title,
        userId: doctor.id,
        patientId: pat.id,
        start,
      },
    });
    if (existing) continue;

    const appointment = await prisma.appointment.create({
      data: {
        title: plan.title,
        start,
        end: endTime,
        userId: doctor.id,
        patientId: pat.id,
      },
    });

    const appointmentToothOperations = plan.toothOperations
      .map((item) => {
        const op = operations[item.operationName];
        if (!op) return null;
        return {
          appointmentId: appointment.id,
          toothCode: item.toothCode,
          patientId: pat.id,
          operationId: op.id,
        };
      })
      .filter(
        (
          item,
        ): item is {
          appointmentId: string;
          toothCode: string;
          patientId: string;
          operationId: string;
        } => Boolean(item),
      );

    if (appointmentToothOperations.length > 0) {
      await prisma.appointmentToothOperation.createMany({
        data: appointmentToothOperations,
        skipDuplicates: true,
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
