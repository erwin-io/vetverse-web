import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexStroke,
  ApexTooltip,
  ApexDataLabels,
  ChartComponent,
  ApexFill,
  ApexNonAxisChartSeries,
  ApexResponsive,
} from 'ng-apexcharts';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { Snackbar } from 'src/app/core/ui/snackbar';
import { forkJoin, Observable } from 'rxjs';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { FormControl } from '@angular/forms';
import { YearPickerDialogComponent } from 'src/app/component/year-picker-dialog/year-picker-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CalendarPickerDialogComponent } from 'src/app/component/calendar-picker-dialog/calendar-picker-dialog.component';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
};

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
};

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  @ViewChild('pieChart') pieChart: ChartComponent;
  @ViewChild('areaChart') areaChart: ChartComponent;
  public pieChartOptions: Partial<PieChartOptions>;
  public chartOptions: Partial<ChartOptions>;
  isLoading;
  user: LoginResult;
  series: ApexAxisChartSeries;
  pieSeries: ApexNonAxisChartSeries;
  tooltip: ApexTooltip;
  error;
  isVet = false;
  pieLabels;
  pieColors;
  yearFilter = new Date().getFullYear();
  selectFilterTypeCtrl = new FormControl();
  selectedYearCtrl = new FormControl();
  selectedMonthCtrl = new FormControl();
  selectedMonthData = new Date();
  categories = [];

  summary: any[];
  vetSummary: any[];
  constructor(
    private dashboardService: DashboardService,
    private appointmentService: AppointmentService,
    private storageService: StorageService,
    private dialog: MatDialog,
    private snackBar: Snackbar
  ) {
    this.user = this.storageService.getLoginUser();
    this.isVet = this.user.role.roleId === '3';
    this.clearCharts();
    if (this.isVet) {
      this.initVetYearlySummary(new Date().getFullYear());
    } else {
      this.initYearlySummary(new Date().getFullYear());
    }
    this.selectFilterTypeCtrl.valueChanges.subscribe((selectedValue) => {
      this.clearCharts();
      this.selectedYearCtrl.setValue(null);
      this.selectedMonthCtrl.setValue(null);
    });
    this.selectedYearCtrl.valueChanges.subscribe((selectedValue) => {
      console.log(selectedValue);
      this.clearCharts();
      if(this.selectFilterTypeCtrl.value.toLowerCase().includes("yearly") && selectedValue) {
        this.selectedMonthCtrl.setValue(null);
        if (this.isVet) {
          this.initVetYearlySummary(selectedValue);
        } else {
          this.initYearlySummary(selectedValue);
        }
        this.selectedMonthCtrl.setValue(null);
      }
    });
    this.selectedMonthCtrl.valueChanges.subscribe((selectedValue) => {
      console.log(selectedValue);
      this.clearCharts();
      if(this.selectFilterTypeCtrl.value.toLowerCase().includes("Monthly") && selectedValue) {
        if (this.isVet) {
        } else {
        }
      }
    });
    window.onbeforeunload = confirmExit;
    function confirmExit() {
      return 'You have attempted to leave this page. Are you sure?';
    }
  }

  ngOnInit(): void {}

  initYearlySummary(year) {
    this.isLoading = true;
    forkJoin([
      this.dashboardService.getYearlyRevenue({
        year,
      }),
      this.dashboardService.getYearlyRevenueGraph({
        year,
      }),
    ]).subscribe(
      async ([summary, graph]) => {
        // do things
        if (summary.success) {
          this.pieSeries = [summary.data['cash'], summary.data['gcash']];
          this.iniPieChart();
        }
        if (graph.success) {
          this.series = [
            {
              color: '#00BFA5',
              name: 'Cash',
              data: [
                graph.data.cash['0'],
                graph.data.cash['1'],
                graph.data.cash['2'],
                graph.data.cash['3'],
                graph.data.cash['4'],
                graph.data.cash['5'],
                graph.data.cash['6'],
                graph.data.cash['7'],
                graph.data.cash['8'],
                graph.data.cash['9'],
                graph.data.cash['10'],
                graph.data.cash['11'],
              ],
            },
            {
              color: '#004D40',
              name: 'Gcash',
              data: [
                graph.data.gcash['0'],
                graph.data.gcash['1'],
                graph.data.gcash['2'],
                graph.data.gcash['3'],
                graph.data.gcash['4'],
                graph.data.gcash['5'],
                graph.data.gcash['6'],
                graph.data.gcash['7'],
                graph.data.gcash['8'],
                graph.data.gcash['9'],
                graph.data.gcash['10'],
                graph.data.gcash['11'],
              ],
            },
          ];
          this.tooltip = {
            y: {
              formatter: (value, series) => {
                // use series argument to pull original string from chart data
                return `₱${value.toFixed(2)}`;
              },
            },
          };
          this.initAreaChart();
        }
        this.isLoading = false;
      },
      (error) => console.error(error),
      () => {}
    );
  }

  initVetYearlySummary(year) {
    this.isLoading = true;
    forkJoin([
      this.dashboardService.getVetAppointmentSummary({
        staffId: this.user.userTypeIdentityId,
        year,
      }),
      this.dashboardService.getVetYearlyAppointmentGraph({
        staffId: this.user.userTypeIdentityId,
        appointmentStatusId: 3,
        year,
      }),
    ]).subscribe(
      async ([summary, graph]) => {
        // do things
        if (summary.success) {
          this.pieSeries = [
            summary.data['completed'],
            summary.data['approved'],
            summary.data['pending'],
            summary.data['cancelled'],
          ];
        }
        if (graph.success) {
          this.series = [
            {
              color: '#009688',
              name: 'Total completed appoint(s)',
              data: [
                graph.data['0'],
                graph.data['1'],
                graph.data['2'],
                graph.data['3'],
                graph.data['4'],
                graph.data['5'],
                graph.data['6'],
                graph.data['7'],
                graph.data['8'],
                graph.data['9'],
                graph.data['10'],
                graph.data['11'],
              ],
            },
          ];
          this.tooltip = {
            y: {
              formatter: (value, series) => {
                // use series argument to pull original string from chart data
                return value.toString();
              },
            },
          };
          this.iniPieChart();
          this.initAreaChart();
        }
        this.isLoading = false;
      },
      (error) => console.error(error),
      () => {}
    );
  }

  initAreaChart() {
    this.chartOptions = {
      series: this.series,
      chart: {
        height: 350,
        type: 'area',
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
      xaxis: {
        type: 'category',
        categories: this.categories,
      },
      tooltip: this.tooltip,
    };
  }
  iniPieChart() {
    this.pieChartOptions = {
      series: this.pieSeries,
      chart: {
        type: 'donut',
      },
      labels: this.pieLabels,
      responsive: [
        {
          breakpoint: 200,
          options: {
            chart: {
              width: 100,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    };
  }

  async openYearPickerDialog() {
    const dialogRef = this.dialog.open(CalendarPickerDialogComponent, {
      closeOnNavigation: false,
      maxWidth: '500px',
      width: '500px',
    });
    dialogRef.componentInstance.selected = this.selectedYearCtrl.value;
    dialogRef.componentInstance.startView = 'multi-year';
    dialogRef.componentInstance.conFirm.subscribe((selected: any) => {
      console.log(selected);
      this.selectedYearCtrl.setValue(selected.year);
      dialogRef.close();
    });
  }

  async openMonthPickerDialog() {
    const dialogRef = this.dialog.open(CalendarPickerDialogComponent, {
      closeOnNavigation: false,
      maxWidth: '500px',
      width: '500px',
    });
    dialogRef.componentInstance.selected = this.selectedYearCtrl.value;
    dialogRef.componentInstance.startView = 'year';
    dialogRef.componentInstance.conFirm.subscribe((selected: any) => {
      console.log(selected);
      this.selectedMonthCtrl;
      this.selectedMonthCtrl.setValue(
        new Date(`${selected.year}-${selected.month}-01`)
      );
      dialogRef.close();
    });
  }

  clearCharts() {
    if (this.isVet) {
      this.pieSeries = [0, 0, 0, 0];
      this.pieLabels = ['Completed', 'Approved', 'Pending', 'Cancelled'];
      this.pieColors = ['#00BFA5', '#004D40', '#A7FFEB', '#1DE9B6'];
      this.series = [
        {
          color: '#009688',
          name: 'Total completed appoint(s)',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        }
      ];
      this.categories = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
    } else {
      this.pieSeries = [0, 0];
      this.pieLabels = ['Cash', 'GCash'];
      this.pieColors = ['#00BFA5', '#004D40'];
      this.series = [
        {
          color: '#00BFA5',
          name: 'Cash',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        {
          color: '#00BFA5',
          name: 'GCash',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
      ];
      this.categories = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

    }
    this.iniPieChart();
    this.initAreaChart();
  }
}
