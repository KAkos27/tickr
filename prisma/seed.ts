import prisma from "@/lib/prisma";
import "dotenv/config";

export async function main() {
  // ── Users ──────────────────────────────────────────────────────────────────
  const usersData = [
    { email: "alice@example.com", name: "Dr. Kovács Alice" },
    { email: "bob@example.com", name: "Dr. Szabó Bálint" },
    { email: "carol@example.com", name: "Dr. Tóth Csilla" },
    { email: "dave@example.com", name: "Dr. Nagy Dávid" },
    { email: "eve@example.com", name: "Dr. Kiss Éva" },
    { email: "frank@example.com", name: "Dr. Varga Ferenc" },
  ];

  const users: Record<
    string,
    { id: string; email: string; name: string | null }
  > = {};
  for (const u of usersData) {
    const up = await prisma.user.upsert({
      where: { email: u.email },
      create: u,
      update: { name: u.name },
    });
    users[u.email] = up as { id: string; email: string; name: string | null };
  }

  // ── Clinics ────────────────────────────────────────────────────────────────
  const clinicNames = ["Alpha Clinic", "Beta Clinic"] as const;
  const clinics: Record<string, { id: string; name: string }> = {};
  for (const name of clinicNames) {
    const existing = await prisma.clinic.findFirst({ where: { name } });
    const clinic = existing ?? (await prisma.clinic.create({ data: { name } }));
    clinics[name] = clinic as { id: string; name: string };
  }

  // ── Clinic memberships ─────────────────────────────────────────────────────
  const clinicMemberships: Array<{
    clinicName: (typeof clinicNames)[number];
    userEmail: string;
    role: "OWNER" | "ADMIN" | "MEMBER";
    color: string;
  }> = [
    {
      clinicName: "Alpha Clinic",
      userEmail: "alice@example.com",
      role: "OWNER",
      color: "#6366f1",
    },
    {
      clinicName: "Alpha Clinic",
      userEmail: "bob@example.com",
      role: "ADMIN",
      color: "#22c55e",
    },
    {
      clinicName: "Alpha Clinic",
      userEmail: "carol@example.com",
      role: "MEMBER",
      color: "#ec4899",
    },
    {
      clinicName: "Beta Clinic",
      userEmail: "dave@example.com",
      role: "OWNER",
      color: "#f97316",
    },
    {
      clinicName: "Beta Clinic",
      userEmail: "eve@example.com",
      role: "ADMIN",
      color: "#3b82f6",
    },
    {
      clinicName: "Beta Clinic",
      userEmail: "frank@example.com",
      role: "MEMBER",
      color: "#14b8a6",
    },
  ];

  for (const membership of clinicMemberships) {
    const clinic = clinics[membership.clinicName];
    const user = users[membership.userEmail];
    if (!clinic || !user) continue;

    await prisma.clinicMember.upsert({
      where: { clinicId_email: { clinicId: clinic.id, email: user.email } },
      create: {
        clinicId: clinic.id,
        userId: user.id,
        email: user.email,
        role: membership.role,
        color: membership.color,
      },
      update: {
        userId: user.id,
        role: membership.role,
        color: membership.color,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { activeClinicId: clinic.id },
    });
  }

  // ── Patients ───────────────────────────────────────────────────────────────
  const patientsData = [
    {
      email: "patient.anna@example.com",
      phone: "+3610000001",
      name: "Molnár Anna",
      birthDate: new Date("1990-02-15T00:00:00Z"),
      sex: "FEMALE" as const,
      clinicName: "Alpha Clinic" as const,
    },
    {
      email: "patient.bela@example.com",
      phone: "+3610000002",
      name: "Horváth Béla",
      birthDate: new Date("1985-06-20T00:00:00Z"),
      sex: "MALE" as const,
      clinicName: "Alpha Clinic" as const,
    },
    {
      email: "patient.csilla@example.com",
      phone: "+3610000003",
      name: "Farkas Csilla",
      birthDate: new Date("2000-11-05T00:00:00Z"),
      sex: "FEMALE" as const,
      clinicName: "Alpha Clinic" as const,
    },
    {
      email: "patient.denes@example.com",
      phone: "+3610000004",
      name: "Takács Dénes",
      birthDate: new Date("1978-09-12T00:00:00Z"),
      sex: "MALE" as const,
      clinicName: "Beta Clinic" as const,
    },
    {
      email: "patient.eva@example.com",
      phone: "+3610000005",
      name: "Balogh Éva",
      birthDate: new Date("1992-01-10T00:00:00Z"),
      sex: "FEMALE" as const,
      clinicName: "Beta Clinic" as const,
    },
    {
      email: "patient.ferenc@example.com",
      phone: "+3610000006",
      name: "Papp Ferenc",
      birthDate: new Date("1989-03-03T00:00:00Z"),
      sex: "MALE" as const,
      clinicName: "Beta Clinic" as const,
    },
    {
      email: "patient.gyorgy@example.com",
      phone: "+3610000007",
      name: "Lakatos György",
      birthDate: new Date("1975-12-25T00:00:00Z"),
      sex: "MALE" as const,
      clinicName: "Beta Clinic" as const,
    },
    {
      email: "patient.hanna@example.com",
      phone: "+3610000008",
      name: "Simon Hanna",
      birthDate: new Date("2001-07-07T00:00:00Z"),
      sex: "FEMALE" as const,
      clinicName: "Alpha Clinic" as const,
    },
  ];

  const patients: Record<string, { id: string; email: string; phone: string }> =
    {};
  for (const p of patientsData) {
    const clinic = clinics[p.clinicName];
    if (!clinic) continue;
    const up = await prisma.patient.upsert({
      where: { email: p.email },
      create: {
        email: p.email,
        phone: p.phone,
        name: p.name,
        birthDate: p.birthDate,
        sex: p.sex,
        clinicId: clinic.id,
      },
      update: {
        phone: p.phone,
        name: p.name,
        birthDate: p.birthDate,
        sex: p.sex,
        clinicId: clinic.id,
      },
    });
    patients[p.email] = up as { id: string; email: string; phone: string };
  }

  // ── Doctor–Patient assignments ─────────────────────────────────────────────
  const assignments: Array<{ doctorEmail: string; patientEmail: string }> = [
    {
      doctorEmail: "alice@example.com",
      patientEmail: "patient.anna@example.com",
    },
    {
      doctorEmail: "alice@example.com",
      patientEmail: "patient.csilla@example.com",
    },
    {
      doctorEmail: "alice@example.com",
      patientEmail: "patient.hanna@example.com",
    },
    {
      doctorEmail: "bob@example.com",
      patientEmail: "patient.bela@example.com",
    },
    {
      doctorEmail: "bob@example.com",
      patientEmail: "patient.ferenc@example.com",
    },
    {
      doctorEmail: "carol@example.com",
      patientEmail: "patient.csilla@example.com",
    },
    {
      doctorEmail: "carol@example.com",
      patientEmail: "patient.eva@example.com",
    },
    {
      doctorEmail: "dave@example.com",
      patientEmail: "patient.denes@example.com",
    },
    {
      doctorEmail: "dave@example.com",
      patientEmail: "patient.gyorgy@example.com",
    },
    {
      doctorEmail: "eve@example.com",
      patientEmail: "patient.hanna@example.com",
    },
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

  // ── Operations (realistic dental interventions) ────────────────────────────
  const operationsData: Array<{
    name: string;
    alphaPrice: number;
    betaPrice: number;
  }> = [
    { name: "Kontroll vizsgálat", alphaPrice: 8000, betaPrice: 8500 },
    { name: "Fogtisztítás", alphaPrice: 12000, betaPrice: 12500 },
    { name: "Fogkő eltávolítás", alphaPrice: 15000, betaPrice: 15500 },
    { name: "Tömés", alphaPrice: 18000, betaPrice: 19000 },
    { name: "Foghúzás", alphaPrice: 15000, betaPrice: 16000 },
    { name: "Gyökérkezelés", alphaPrice: 35000, betaPrice: 37000 },
    { name: "Korona készítés", alphaPrice: 65000, betaPrice: 68000 },
    { name: "Híd pillér készítés", alphaPrice: 60000, betaPrice: 63000 },
    { name: "Implantátum beültetés", alphaPrice: 250000, betaPrice: 265000 },
    { name: "Fogfehérítés", alphaPrice: 45000, betaPrice: 48000 },
    { name: "Panoráma röntgen", alphaPrice: 6000, betaPrice: 6500 },
    { name: "Inlay / Onlay", alphaPrice: 55000, betaPrice: 58000 },
    { name: "Parodontológiai kezelés", alphaPrice: 25000, betaPrice: 27000 },
    { name: "Gyökércsúcs rezekció", alphaPrice: 40000, betaPrice: 42000 },
  ];

  const operations: Record<string, { id: string; name: string }> = {};
  for (const opData of operationsData) {
    const existing = await prisma.operation.findFirst({
      where: { name: opData.name },
    });
    const op =
      existing ??
      (await prisma.operation.create({ data: { name: opData.name } }));
    operations[opData.name] = op as { id: string; name: string };

    // Prices per clinic
    for (const clinic of Object.values(clinics)) {
      const price =
        clinic.name === "Alpha Clinic" ? opData.alphaPrice : opData.betaPrice;
      await prisma.clinicOperationPrice.upsert({
        where: {
          clinicId_operationId: { clinicId: clinic.id, operationId: op.id },
        },
        create: { clinicId: clinic.id, operationId: op.id, price },
        update: { price },
      });
    }
  }

  // ── Teeth ──────────────────────────────────────────────────────────────────
  // Permanent teeth (FDI 11-48)
  const permanentTeethCodes = [
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

  // Deciduous teeth (FDI 51-85)
  const deciduousTeethCodes = [
    "51",
    "52",
    "53",
    "54",
    "55",
    "61",
    "62",
    "63",
    "64",
    "65",
    "71",
    "72",
    "73",
    "74",
    "75",
    "81",
    "82",
    "83",
    "84",
    "85",
  ];

  const teethCodes = [...permanentTeethCodes, ...deciduousTeethCodes];

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

  // ── Pre-existing tooth statuses (simulate patient history) ─────────────────
  const toothStatuses: Array<{
    patientEmail: string;
    toothCode: string;
    status:
      | "CARIES"
      | "MISSING"
      | "FILLING"
      | "CROWN"
      | "ROOT_CANAL"
      | "BRIDGE"
      | "IMPLANT"
      | "IMPACTED";
  }> = [
    // Anna – has some fillings and a missing tooth
    {
      patientEmail: "patient.anna@example.com",
      toothCode: "16",
      status: "FILLING",
    },
    {
      patientEmail: "patient.anna@example.com",
      toothCode: "26",
      status: "FILLING",
    },
    {
      patientEmail: "patient.anna@example.com",
      toothCode: "36",
      status: "MISSING",
    },
    {
      patientEmail: "patient.anna@example.com",
      toothCode: "46",
      status: "CARIES",
    },
    // Béla – root canal + crown
    {
      patientEmail: "patient.bela@example.com",
      toothCode: "14",
      status: "ROOT_CANAL",
    },
    {
      patientEmail: "patient.bela@example.com",
      toothCode: "15",
      status: "CROWN",
    },
    {
      patientEmail: "patient.bela@example.com",
      toothCode: "38",
      status: "IMPACTED",
    },
    {
      patientEmail: "patient.bela@example.com",
      toothCode: "48",
      status: "IMPACTED",
    },
    // Csilla – implant
    {
      patientEmail: "patient.csilla@example.com",
      toothCode: "21",
      status: "IMPLANT",
    },
    {
      patientEmail: "patient.csilla@example.com",
      toothCode: "37",
      status: "FILLING",
    },
    // Dénes – bridge + several fillings
    {
      patientEmail: "patient.denes@example.com",
      toothCode: "11",
      status: "BRIDGE",
    },
    {
      patientEmail: "patient.denes@example.com",
      toothCode: "12",
      status: "BRIDGE",
    },
    {
      patientEmail: "patient.denes@example.com",
      toothCode: "13",
      status: "BRIDGE",
    },
    {
      patientEmail: "patient.denes@example.com",
      toothCode: "25",
      status: "FILLING",
    },
    {
      patientEmail: "patient.denes@example.com",
      toothCode: "35",
      status: "FILLING",
    },
    {
      patientEmail: "patient.denes@example.com",
      toothCode: "45",
      status: "MISSING",
    },
    // Éva – caries
    {
      patientEmail: "patient.eva@example.com",
      toothCode: "17",
      status: "CARIES",
    },
    {
      patientEmail: "patient.eva@example.com",
      toothCode: "27",
      status: "CARIES",
    },
    // György – many missing teeth (older patient)
    {
      patientEmail: "patient.gyorgy@example.com",
      toothCode: "18",
      status: "MISSING",
    },
    {
      patientEmail: "patient.gyorgy@example.com",
      toothCode: "28",
      status: "MISSING",
    },
    {
      patientEmail: "patient.gyorgy@example.com",
      toothCode: "38",
      status: "MISSING",
    },
    {
      patientEmail: "patient.gyorgy@example.com",
      toothCode: "48",
      status: "MISSING",
    },
    {
      patientEmail: "patient.gyorgy@example.com",
      toothCode: "16",
      status: "CROWN",
    },
    {
      patientEmail: "patient.gyorgy@example.com",
      toothCode: "26",
      status: "CROWN",
    },
    {
      patientEmail: "patient.gyorgy@example.com",
      toothCode: "36",
      status: "ROOT_CANAL",
    },
  ];

  for (const ts of toothStatuses) {
    const patient = patients[ts.patientEmail];
    if (!patient) continue;
    await prisma.patientTooth.update({
      where: {
        patientId_toothCode: { patientId: patient.id, toothCode: ts.toothCode },
      },
      data: { status: ts.status },
    });
  }

  // ── Appointments ───────────────────────────────────────────────────────────
  // Use dates relative to "today" so seed data always looks fresh
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buildDate = (dayOffset: number, hour: number, minute: number) =>
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + dayOffset,
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
    toothOps: Array<{ toothCode: string; operationName: string }>;
  }> = [
    // ── Past appointments (history) ────────
    {
      doctorEmail: "alice@example.com",
      patientEmail: "patient.anna@example.com",
      title: "Tömés - Molnár Anna",
      dayOffset: -14,
      startHour: 9,
      startMinute: 0,
      durationMinutes: 45,
      toothOps: [
        { toothCode: "16", operationName: "Tömés" },
        { toothCode: "26", operationName: "Tömés" },
      ],
    },
    {
      doctorEmail: "bob@example.com",
      patientEmail: "patient.bela@example.com",
      title: "Gyökérkezelés - Horváth Béla",
      dayOffset: -10,
      startHour: 10,
      startMinute: 0,
      durationMinutes: 60,
      toothOps: [{ toothCode: "14", operationName: "Gyökérkezelés" }],
    },
    {
      doctorEmail: "bob@example.com",
      patientEmail: "patient.bela@example.com",
      title: "Korona - Horváth Béla",
      dayOffset: -3,
      startHour: 10,
      startMinute: 0,
      durationMinutes: 45,
      toothOps: [{ toothCode: "15", operationName: "Korona készítés" }],
    },
    {
      doctorEmail: "alice@example.com",
      patientEmail: "patient.csilla@example.com",
      title: "Implantátum - Farkas Csilla",
      dayOffset: -7,
      startHour: 14,
      startMinute: 0,
      durationMinutes: 90,
      toothOps: [{ toothCode: "21", operationName: "Implantátum beültetés" }],
    },
    {
      doctorEmail: "dave@example.com",
      patientEmail: "patient.denes@example.com",
      title: "Híd - Takács Dénes",
      dayOffset: -21,
      startHour: 9,
      startMinute: 30,
      durationMinutes: 60,
      toothOps: [
        { toothCode: "11", operationName: "Híd pillér készítés" },
        { toothCode: "12", operationName: "Híd pillér készítés" },
        { toothCode: "13", operationName: "Híd pillér készítés" },
      ],
    },

    // ── Today's appointments ────────
    {
      doctorEmail: "alice@example.com",
      patientEmail: "patient.anna@example.com",
      title: "Kontroll - Molnár Anna",
      dayOffset: 0,
      startHour: 9,
      startMinute: 0,
      durationMinutes: 30,
      toothOps: [{ toothCode: "46", operationName: "Kontroll vizsgálat" }],
    },
    {
      doctorEmail: "bob@example.com",
      patientEmail: "patient.bela@example.com",
      title: "Fogkő - Horváth Béla",
      dayOffset: 0,
      startHour: 10,
      startMinute: 0,
      durationMinutes: 45,
      toothOps: [
        { toothCode: "11", operationName: "Fogkő eltávolítás" },
        { toothCode: "21", operationName: "Fogkő eltávolítás" },
        { toothCode: "31", operationName: "Fogkő eltávolítás" },
        { toothCode: "41", operationName: "Fogkő eltávolítás" },
      ],
    },
    {
      doctorEmail: "carol@example.com",
      patientEmail: "patient.eva@example.com",
      title: "Tömés - Balogh Éva",
      dayOffset: 0,
      startHour: 11,
      startMinute: 0,
      durationMinutes: 45,
      toothOps: [
        { toothCode: "17", operationName: "Tömés" },
        { toothCode: "27", operationName: "Tömés" },
      ],
    },

    // ── Future appointments ────────
    {
      doctorEmail: "alice@example.com",
      patientEmail: "patient.hanna@example.com",
      title: "Fogtisztítás - Simon Hanna",
      dayOffset: 1,
      startHour: 9,
      startMinute: 0,
      durationMinutes: 30,
      toothOps: [
        { toothCode: "11", operationName: "Fogtisztítás" },
        { toothCode: "21", operationName: "Fogtisztítás" },
      ],
    },
    {
      doctorEmail: "bob@example.com",
      patientEmail: "patient.bela@example.com",
      title: "Panoráma röntgen - Horváth Béla",
      dayOffset: 1,
      startHour: 14,
      startMinute: 0,
      durationMinutes: 20,
      toothOps: [{ toothCode: "38", operationName: "Panoráma röntgen" }],
    },
    {
      doctorEmail: "alice@example.com",
      patientEmail: "patient.anna@example.com",
      title: "Foghúzás + Implantátum konzultáció - Molnár Anna",
      dayOffset: 3,
      startHour: 10,
      startMinute: 0,
      durationMinutes: 60,
      toothOps: [{ toothCode: "36", operationName: "Foghúzás" }],
    },
    {
      doctorEmail: "carol@example.com",
      patientEmail: "patient.csilla@example.com",
      title: "Parodontológiai kezelés - Farkas Csilla",
      dayOffset: 2,
      startHour: 15,
      startMinute: 0,
      durationMinutes: 45,
      toothOps: [{ toothCode: "37", operationName: "Parodontológiai kezelés" }],
    },
    {
      doctorEmail: "dave@example.com",
      patientEmail: "patient.gyorgy@example.com",
      title: "Korona - Lakatos György",
      dayOffset: 4,
      startHour: 9,
      startMinute: 0,
      durationMinutes: 60,
      toothOps: [
        { toothCode: "16", operationName: "Korona készítés" },
        { toothCode: "26", operationName: "Korona készítés" },
      ],
    },
    {
      doctorEmail: "eve@example.com",
      patientEmail: "patient.hanna@example.com",
      title: "Fogfehérítés - Simon Hanna",
      dayOffset: 5,
      startHour: 11,
      startMinute: 0,
      durationMinutes: 60,
      toothOps: [
        { toothCode: "11", operationName: "Fogfehérítés" },
        { toothCode: "21", operationName: "Fogfehérítés" },
      ],
    },
  ];

  for (const plan of appointmentPlan) {
    const doctor = users[plan.doctorEmail];
    const pat = patients[plan.patientEmail];
    if (!doctor || !pat) continue;

    const membership = clinicMemberships.find(
      (m) => m.userEmail === plan.doctorEmail,
    );
    const clinicId = membership ? clinics[membership.clinicName].id : null;
    if (!clinicId) continue;

    // Ensure doctor-patient link
    await prisma.userPatient.upsert({
      where: { userId_patientId: { userId: doctor.id, patientId: pat.id } },
      create: { userId: doctor.id, patientId: pat.id },
      update: {},
    });

    const start = buildDate(plan.dayOffset, plan.startHour, plan.startMinute);
    const endTime = new Date(
      start.getTime() + plan.durationMinutes * 60 * 1000,
    );

    const existing = await prisma.appointment.findFirst({
      where: { title: plan.title, userId: doctor.id, patientId: pat.id, start },
    });
    if (existing) continue;

    const appointment = await prisma.appointment.create({
      data: {
        title: plan.title,
        start,
        end: endTime,
        userId: doctor.id,
        patientId: pat.id,
        clinicId,
      },
    });

    const toothOpsData = plan.toothOps
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
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    if (toothOpsData.length > 0) {
      await prisma.appointmentToothOperation.createMany({
        data: toothOpsData,
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
