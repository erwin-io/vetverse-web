import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Report } from 'src/app/core/model/report.model';
import { ReportsService } from 'src/app/core/services/reports.service';
import { Snackbar } from 'src/app/core/ui/snackbar';
import { AlertDialogModel } from 'src/app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  error:string;
  dataSource = new MatTableDataSource<Report>();
  data: Report[] = [];
  displayedColumns = [];
  @ViewChild('paginator', {static: false}) paginator: MatPaginator;
  pageSize = 10;
  isProcessing = false;


  constructor(
    private reportsService: ReportsService,
    private snackBar: Snackbar,
    private dialog: MatDialog,
    public router: Router) { }

  ngOnInit(): void {
    this.displayedColumns = ['reportId', 'reportName', 'controls'];
    this.data = [
      {
        reportId: '1',
        reportName: 'Services report'
      },
      {
        reportId: '2',
        reportName: 'Payments report'
      },
      {
        reportId: '3',
        reportName: 'Appointments report'
      },
      {
        reportId: '4',
        reportName: 'Client  report'
      },
      {
        reportId: '5',
        reportName: 'Services report'
      }
    ];
    this.dataSource.data = this.data;
    this.dataSource.paginator = this.paginator;
  }

  generateReport(reportId) {
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

    dialogRef.componentInstance.alertDialogConfig = dialogData;
    dialogRef.componentInstance.conFirm.subscribe(async (confirm: any) => {
      if(confirm) {
        this.isProcessing = true;
        dialogRef.componentInstance.isProcessing = this.isProcessing;
        try {
          this.reportsService
            .generateReport()
            .subscribe(
              async (res: any) => {
                let file = new Blob([res.body], { type: 'application/pdf' });
                const fileURL = URL.createObjectURL(file);
                window.open(fileURL, '_blank');
                dialogRef.close();
                this.isProcessing = false;
                dialogRef.componentInstance.isProcessing = this.isProcessing;
                console.log(res);
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

