import { Appointment } from './appointment.model';
import { Gender } from './gender.model';
import { Role } from './role.model';
import { User } from './user.model';
import { UserType } from './usertype.model';

export class Messages {
  messageId: string;
  message: string;
  dateTime?: Date;
  appointment?: Appointment;
  fromUser: any;
  toUser: any;
  isClient: boolean;
}
