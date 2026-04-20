import { Sex, ToothStatus } from "@/generated/prisma/enums";

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
  borderColor?: string;
  userId?: string;
};

export type SelectedPatient =
  | ({
      email: string;
      name: string;
      id: string;
      clinicId: string;
      phone: string;
      birthDate: Date;
      sex: Sex;
    } & {
      teeth: {
        toothCode: string;
        status: ToothStatus;
        operations: {
          appointmentId: string;
        }[];
      }[];
    })
  | undefined;
