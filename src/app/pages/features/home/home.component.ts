import { Component, OnInit, ViewChild } from '@angular/core';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexStroke, ApexTooltip, ApexDataLabels, ChartComponent, ApexFill, ApexNonAxisChartSeries, ApexResponsive } from 'ng-apexcharts';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { Snackbar } from 'src/app/core/ui/snackbar';
import { forkJoin, Observable } from 'rxjs';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { AppointmentService } from 'src/app/core/services/appointment.service';

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
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild("pieChart") pieChart: ChartComponent;
  @ViewChild("areaChart") areaChart: ChartComponent;
  public pieChartOptions: Partial<PieChartOptions>;
  public chartOptions: Partial<ChartOptions>;
  isLoading;
  user: LoginResult;
  series: ApexAxisChartSeries;
  pieSeries: ApexNonAxisChartSeries;
  tooltip: ApexTooltip
  error;
  isVet = false;
  pieLabels;
  yearFilter = new Date().getFullYear();

  summary: any[];
  vetSummary: any[];
  constructor(private dashboardService: DashboardService,
    private appointmentService: AppointmentService,
    private storageService: StorageService,
    private snackBar: Snackbar) {
      this.user = this.storageService.getLoginUser();
      this.isVet = this.user.role.roleId === "3";
      if(this.isVet) {
        this.initVetSummary();
      }
      else {
        this.initSummary();
      }
      window.onbeforeunload = confirmExit;
      function confirmExit() {
          return "You have attempted to leave this page. Are you sure?";
      }
  }

  ngOnInit(): void {
  }

  initSummary() {

    this.isLoading = true;
    forkJoin([
      this.dashboardService.getYearlyRevenue({
        year: 2022,
      }),
      this.dashboardService.getYearlyRevenueGraph({
        year: 2022,
      }),
  ]).subscribe(
      async ([summary, graph]) => {
          // do things
          if (summary.success) {
            this.pieSeries = [
              summary.data["cash"],
              summary.data["gcash"],
            ];
            this.pieLabels = ["Cash", "GCash"];

          }
          if(graph.success) {
            this.series = [
                {
                  color: "#00BFA5",
                  name: "Cash",
                  data: [
                    graph.data.cash["0"],
                    graph.data.cash["1"],
                    graph.data.cash["2"],
                    graph.data.cash["3"],
                    graph.data.cash["4"],
                    graph.data.cash["5"],
                    graph.data.cash["6"],
                    graph.data.cash["7"],
                    graph.data.cash["8"],
                    graph.data.cash["9"],
                    graph.data.cash["10"],
                    graph.data.cash["11"]
                  ]
                },
                {
                  color: "#004D40",
                  name: "Gcash",
                  data: [
                    graph.data.gcash["0"],
                    graph.data.gcash["1"],
                    graph.data.gcash["2"],
                    graph.data.gcash["3"],
                    graph.data.gcash["4"],
                    graph.data.gcash["5"],
                    graph.data.gcash["6"],
                    graph.data.gcash["7"],
                    graph.data.gcash["8"],
                    graph.data.gcash["9"],
                    graph.data.gcash["10"],
                    graph.data.gcash["11"]
                  ]
                }
              ];
            this.tooltip = {
              y: {
                formatter: (value, series) => {
                  // use series argument to pull original string from chart data
                  return `₱${value.toFixed(2)}`;
                }
              }
            };
            this.iniPieChart();
            this.initAreaChart();
          }
          this.isLoading = false;
      },
      (error) => console.error(error),
      () => {
      }
  )
  }

  initVetSummary() {

    this.isLoading = true;
    forkJoin([
      this.dashboardService.getVetAppointmentSummary({
        staffId: this.user.userTypeIdentityId,
        year: 2022,
      }),
      this.dashboardService.getVetYearlyAppointmentGraph({
        staffId: this.user.userTypeIdentityId,
        appointmentStatusId: 3,
        year: 2022,
      }),
  ]).subscribe(
      async ([summary, graph]) => {
          // do things
          if (summary.success) {
            this.pieSeries = [
              summary.data["completed"],
              summary.data["pending"],
              summary.data["approved"],
              summary.data["cancelled"],
            ];
            this.pieLabels = ["Completed", "Pending", "Approved", "Cancelled"];
          }
          if(graph.success) {
            this.series = [
                {
                  color: "#009688",
                  name: "Total completed appoint(s)",
                  data: [
                    graph.data["0"],
                    graph.data["1"],
                    graph.data["2"],
                    graph.data["3"],
                    graph.data["4"],
                    graph.data["5"],
                    graph.data["6"],
                    graph.data["7"],
                    graph.data["8"],
                    graph.data["9"],
                    graph.data["10"],
                    graph.data["11"]
                  ]
                }
              ];
            this.tooltip = {
              y: {
                formatter: (value, series) => {
                  // use series argument to pull original string from chart data
                  return value.toString();
                }
              }
            };
            this.iniPieChart();
            this.initAreaChart();
          }
          this.isLoading = false;
      },
      (error) => console.error(error),
      () => {
      }
  )
  }

  initAreaChart() {
    this.chartOptions = {
      series: this.series,
      chart: {
        height: 350,
        type: "area"
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth"
      },
      xaxis: {
        type: "category",
        categories: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December"
        ]
      },
      tooltip: this.tooltip
    };

  }
  iniPieChart() {
    this.pieChartOptions = {
      series: this.pieSeries,
      chart: {
        type: "donut"
      },
      labels: this.pieLabels,
      responsive: [
        {
          breakpoint: 200,
          options: {
            chart: {
              width: 100
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };

  }

}
