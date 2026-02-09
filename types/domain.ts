import { Sex } from "@/generated/prisma/enums";

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
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
        operations: {
          appointmentId: string;
        }[];
      }[];
    })
  | undefined;
