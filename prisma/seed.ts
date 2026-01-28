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

  // Create appointments for a specific user id
  const targetUserId = "cmkjv3fg900005oavplni2zzg";
  let targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });
  if (!targetUser) {
    // Create a placeholder doctor user with the exact id
    targetUser = await prisma.user.create({
      data: {
        id: targetUserId,
        email: "doctor.seed@example.com",
        name: "Seed Doctor",
      },
    });
  }

  // Ensure the target doctor has some patients assigned
  const targetPatientsEmails = [
    "patient.anna@example.com",
    "patient.csilla@example.com",
    "patient.hanna@example.com",
  ];
  for (const pEmail of targetPatientsEmails) {
    const pat = patients[pEmail];
    if (!pat) continue;
    await prisma.userPatient.upsert({
      where: { userId_patientId: { userId: targetUserId, patientId: pat.id } },
      create: { userId: targetUserId, patientId: pat.id },
      update: {},
    });
  }

  // Create some time-based appointments for the target doctor
  const now = new Date();
  const toISODate = (d: Date) => d;

  const appointmentPlan: Array<{
    patientEmail: string;
    title: string;
    operationName: (typeof operationNames)[number];
    startOffsetMinutes: number;
    durationMinutes: number;
  }> = [
    {
      patientEmail: "patient.anna@example.com",
      title: "Consultation with Anna",
      operationName: "Consultation",
      startOffsetMinutes: 60,
      durationMinutes: 45,
    },
    {
      patientEmail: "patient.csilla@example.com",
      title: "Follow-up with Csilla",
      operationName: "Follow-up",
      startOffsetMinutes: 180,
      durationMinutes: 30,
    },
    {
      patientEmail: "patient.hanna@example.com",
      title: "Routine checkup for Hanna",
      operationName: "Checkup",
      startOffsetMinutes: 300,
      durationMinutes: 30,
    },
  ];

  for (const plan of appointmentPlan) {
    const pat = patients[plan.patientEmail];
    const op = operations[plan.operationName];
    if (!pat || !op) continue;

    const start = new Date(now.getTime() + plan.startOffsetMinutes * 60 * 1000);
    const endTime = new Date(
      start.getTime() + plan.durationMinutes * 60 * 1000,
    );

    // Avoid duplicates: check by title + user + patient + start
    const existing = await prisma.appointment.findFirst({
      where: {
        title: plan.title,
        userId: targetUserId,
        patientId: pat.id,
        start,
      },
    });
    if (existing) continue;

    await prisma.appointment.create({
      data: {
        title: plan.title,
        start: toISODate(start),
        end: toISODate(endTime),
        userId: targetUserId,
        patientId: pat.id,
        operationId: op.id,
      },
    });
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
