import { Injectable } from '@angular/core';
import { Client } from './client.model';
import { Gender } from './gender.model';
import { Staff } from './staff.model';

export class Appointment {
  appointmentId: string;
  appointmentDate: string;
  comments: string;
  timeStart: string;
  timeEnd: string
  isPaid: boolean;
  isWalkIn: boolean;
  walkInAppointmentNotes?: string;
  staff: Staff;
  serviceRate: number;
  serviceType: ServiceType;
  consultaionType: ConsultaionType;
  appointmentStatus: AppointmentStatus;
  payments: Payment[];
  clientAppointment?: ClientAppointment;
  petAppointment?: PetAppointment;
  conferencePeerId: string;
  diagnosisAndTreatment: string;
  appointmentAttachments: AppointmentAttachments[];
  diagnosisAttachments: DiagnosisAttachments[];
}

export class ConsultaionType {
  consultaionTypeId: string;
  name: string;
}

export class ServiceType {
  serviceTypeId: string;
  name: string;
  description: string;
  price: number;
  durationInHours: string;
  isMedicalServiceType: boolean;
}

export class ClientAppointment {
  appointmentId: string;
  client: Client;
}

export class Payment {
  paymentId: string;
  paymentDate: string;
  isVoid: boolean;
  paymentType: PaymentType;
  referenceNo: string;
}

export class PaymentType {
  paymentTypeId: string;
  name: string;
}

export class AppointmentStatus {
  appointmentStatusId: string;
  name: string;
}

export class PetAppointment {
  appointmentId: string;
  appointment: Appointment;
  pet: Pet;
}

export class Pet {
  petId: string;
  name: string;
  birthDate: Date;
  weight: number;
  client: Client;
  entityStatusId: string;
  petCategory: PetCategory;
  gender: Gender;
  petAppointments?: PetAppointment[];
}

export class PetCategory {
  petCategoryId: string;
  name: string;
  entityStatusId: string;
  petType: PetType;
}

export class PetType {
  petTypeId: string;
  name: string;
  entityStatusId: string;
}
export class PetProfilePic {
  petId: string;
  file: Files;
}
export class Files {
  fileId?: string;
  fileName?: string;
  url?: string;
}

export class AppointmentAttachments {
  appointmentAttachmentId: string;
  file: Files;
}

export class DiagnosisAttachments {
  diagnosisAttachmentsId?: string;
  file?:Files;
}