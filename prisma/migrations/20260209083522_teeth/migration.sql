-- CreateTable
CREATE TABLE "Tooth" (
    "code" TEXT NOT NULL,

    CONSTRAINT "Tooth_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "PatientTooth" (
    "patientId" TEXT NOT NULL,
    "toothCode" TEXT NOT NULL,

    CONSTRAINT "PatientTooth_pkey" PRIMARY KEY ("patientId","toothCode")
);

-- CreateTable
CREATE TABLE "AppointmentToothOperation" (
    "appointmentId" TEXT NOT NULL,
    "toothCode" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,

    CONSTRAINT "AppointmentToothOperation_pkey" PRIMARY KEY ("appointmentId","toothCode","operationId")
);

-- AddForeignKey
ALTER TABLE "PatientTooth" ADD CONSTRAINT "PatientTooth_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientTooth" ADD CONSTRAINT "PatientTooth_toothCode_fkey" FOREIGN KEY ("toothCode") REFERENCES "Tooth"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentToothOperation" ADD CONSTRAINT "AppointmentToothOperation_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentToothOperation" ADD CONSTRAINT "AppointmentToothOperation_toothCode_fkey" FOREIGN KEY ("toothCode") REFERENCES "Tooth"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentToothOperation" ADD CONSTRAINT "AppointmentToothOperation_patientId_toothCode_fkey" FOREIGN KEY ("patientId", "toothCode") REFERENCES "PatientTooth"("patientId", "toothCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentToothOperation" ADD CONSTRAINT "AppointmentToothOperation_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "Operation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
