import { Appointment } from "./appointment.model";

export class Reminder {
  reminderId: string;
  title: string;
  description: string;
  isAppointment: boolean;
  dueDate: Date;
  delivered: boolean;
  appointment: Appointment;
}
