import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectionList } from '@angular/material/list';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { Report } from 'src/app/core/model/report.model';
import { ReportsService } from 'src/app/core/services/reports.service';
import { Snackbar } from 'src/app/core/ui/snackbar';
import { AlertDialogModel } from 'src/app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit {
  error: string;
  dataSource = new MatTableDataSource<Report>();
  data: Report[] = [];
  displayedColumns = [];
  @ViewChild('paginator', { static: false }) paginator: MatPaginator;
  @ViewChild('reports', { static: false }) reports: MatSelectionList;
  pageSize = 10;
  isProcessing = false;
  maxDate = new Date();
  from: FormControl = new FormControl(new Date());
  to: FormControl = new FormControl(new Date());

  constructor(
    private reportsService: ReportsService,
    private snackBar: Snackbar,
    private dialog: MatDialog,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.displayedColumns = ['reportName', 'controls'];
    this.data = [
      {
        reportId: 'service-report',
        reportName: 'Services report',
        canFilterByDate: true,
      },
      {
        reportId: 'payments-report',
        reportName: 'Payments report',
        canFilterByDate: true,
      },
      {
        reportId: 'appointments-report',
        reportName: 'Appointments report',
        canFilterByDate: true,
      },
      {
        reportId: 'clients-report',
        reportName: 'Clients report',
        canFilterByDate: false,
      },
      {
        reportId: 'pets-report',
        reportName: 'Pets report',
        canFilterByDate: false,
      },
      {
        reportId: 'staff-report',
        reportName: 'Staff report',
        canFilterByDate: false,
      },
      {
        reportId: 'vet-report',
        reportName: 'Veterinarian report',
        canFilterByDate: true,
      },
    ];
    this.dataSource.data = this.data;
    this.dataSource.paginator = this.paginator;
  }

  get selectedReport() {
    return this.reports && this.reports.selectedOptions.hasValue() ? this.reports.selectedOptions.selected[0].value.reportId : '';
  }

  get hasSelectedReport() {
    return this.reports && this.reports.selectedOptions.hasValue();
  }

  get selectedFilterByDateReport() {
    return this.reports && this.reports.selectedOptions.hasValue() && this.reports.selectedOptions.selected[0].value.canFilterByDate;
  }

  get reportParams() {
    return {
      from: this.from.value,
      to: this.to.value,
    }
  }

  generateReport() {
    const reportId = this.selectedReport;
    const dialogData = new AlertDialogModel();
    dialogData.title = 'Confirm';
    dialogData.message = 'Generate report?';
    dialogData.confirmButton = {
      visible: true,
      text: 'yes',
      color: 'primary',
    };
    dialogData.dismissButton = {
      visible: true,
      text: 'cancel',
    };
    const dialogRef = this.dialog.open(AlertDialogComponent, {
      maxWidth: '400px',
      closeOnNavigation: true,
    });

    const params = this.reportParams;
    dialogRef.componentInstance.alertDialogConfig = dialogData;
    dialogRef.componentInstance.conFirm.subscribe(async (confirm: any) => {
      if (confirm) {
        this.isProcessing = true;
        dialogRef.componentInstance.isProcessing = this.isProcessing;
        try {
          switch(reportId){
            case 'service-report':
              this.reportsService.generateServiceReport(params).subscribe(
                async (res: any) => {
                  let file = new Blob([res], { type: 'application/pdf' });
                  const fileURL = URL.createObjectURL(file);
                  window.open(fileURL, '_blank');
                  dialogRef.close();
                  this.isProcessing = false;
                  dialogRef.componentInstance.isProcessing = this.isProcessing;
                },
                async (err) => {
                  this.isProcessing = false;
                  dialogRef.componentInstance.isProcessing = this.isProcessing;
                  this.error = Array.isArray(err.message)
                    ? err.message[0]
                    : err.message;
                  this.snackBar.snackbarError(this.error);
                }
              );
            break;
            case 'payments-report':
              this.reportsService.generatePaymentsReport(params).subscribe(
                async (res: any) => {
                  let file = new Blob([res], { type: 'application/pdf' });
                  const fileURL = URL.createObjectURL(file);
                  window.open(fileURL, '_blank');
                  dialogRef.close();
                  this.isProcessing = false;
                  dialogRef.componentInstance.isProcessing = this.isProcessing;
                },
                async (err) => {
                  this.isProcessing = false;
                  dialogRef.componentInstance.isProcessing = this.isProcessing;
                  this.error = Array.isArray(err.message)
                    ? err.message[0]
                    : err.message;
                  this.snackBar.snackbarError(this.error);
                }
              );
            break;
            case 'appointments-report':
              this.reportsService.generateAppointmentsReport(params).subscribe(
                async (res: any) => {
                  let file = new Blob([res], { type: 'application/pdf' });
                  const fileURL = URL.createObjectURL(file);
                  window.open(fileURL, '_blank');
                  dialogRef.close();
                  this.isProcessing = false;
                  dialogRef.componentInstance.isProcessing = this.isProcessing;
                },
                async (err) => {
                  this.isProcessing = false;
                  dialogRef.componentInstance.isProcessing = this.isProcessing;
                  this.error = Array.isArray(err.message)
                    ? err.message[0]
                    : err.message;
                  this.snackBar.snackbarError(this.error);
                }
              );
            break;
            case 'clients-report':
              this.reportsService.generateClientsReport().subscribe(
                async (res: any) => {
                  let file = new Blob([res], { type: 'application/pdf' });
                  const fileURL = URL.createObjectURL(file);
                  window.open(fileURL, '_blank');
                  dialogRef.close();
                  this.isProcessing = false;
                  dialogRef.componentInstance.isProcessing = this.isProcessing;
                },
                async (err) => {
                  this.isProcessing = false;
                  dialogRef.componentInstance.isProcessing = this.isProcessing;
                  this.error = Array.isArray(err.message)
                    ? err.message[0]
                    : err.message;
                  this.snackBar.snackbarError(this.error);
                }
              );
            break;
            case 'pets-report':
              this.reportsService.generatePetsReport().subscribe(
                async (res: any) => {
                  let file = new Blob([res], { type: 'application/pdf' });
                  const fileURL = URL.createObjectURL(file);
                  window.open(fileURL, '_blank');
                  dialogRef.close();
                  this.isProcessing = false;
                  dialogRef.componentInstance.isProcessing = this.isProcessing;
                },
                async (err) => {
                  this.isProcessing = false;
                  dialogRef.componentInstance.isProcessing = this.isProcessing;
                  this.error = Array.isArray(err.message)
                    ? err.message[0]
                    : err.message;
                  this.snackBar.snackbarError(this.error);
                }
              );
            break;
            case 'staff-report':
              this.reportsService.generateStaffReport().subscribe(
                async (res: any) => {
                  let file = new Blob([res], { type: 'application/pdf' });
                  const fileURL = URL.createObjectURL(file);
                  window.open(fileURL, '_blank');
                  dialogRef.close();
                  this.isProcessing = false;
                  dialogRef.componentInstance.isProcessing = this.isProcessing;
                },
                async (err) => {
                  this.isProcessing = false;
                  dialogRef.componentInstance.isProcessing = this.isProcessing;
                  this.error = Array.isArray(err.message)
                    ? err.message[0]
                    : err.message;
                  this.snackBar.snackbarError(this.error);
                }
              );
            break;
            case 'vet-report':
              this.reportsService.generateVetReport(params).subscribe(
                async (res: any) => {
                  let file = new Blob([res], { type: 'application/pdf' });
                  const fileURL = URL.createObjectURL(file);
                  window.open(fileURL, '_blank');
                  dialogRef.close();
                  this.isProcessing = false;
                  dialogRef.componentInstance.isProcessing = this.isProcessing;
                },
                async (err) => {
                  this.isProcessing = false;
                  dialogRef.componentInstance.isProcessing = this.isProcessing;
                  this.error = Array.isArray(err.message)
                    ? err.message[0]
                    : err.message;
                  this.snackBar.snackbarError(this.error);
                }
              );
            break;
            default:
              this.snackBar.snackbarError('report not available');
              this.isProcessing = false;
              dialogRef.componentInstance.isProcessing = this.isProcessing;
            break;
          }
        } catch (e) {
          this.isProcessing = false;
          dialogRef.componentInstance.isProcessing = this.isProcessing;
          this.error = Array.isArray(e.message) ? e.message[0] : e.message;
          this.snackBar.snackbarError(this.error);
        }
      }
    });
  }
}
