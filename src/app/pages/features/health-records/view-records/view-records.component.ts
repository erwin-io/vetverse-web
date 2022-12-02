import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Pet, PetAppointment } from 'src/app/core/model/appointment.model';
import { PetService } from 'src/app/core/services/pet.service';
import { Snackbar } from 'src/app/core/ui/snackbar';

@Component({
  selector: 'app-view-records',
  templateUrl: './view-records.component.html',
  styleUrls: ['./view-records.component.scss']
})
export class ViewRecordsComponent implements OnInit, AfterViewInit {
  petId;
  petDetails: Pet;
  isLoading = false;
  error;
  dataSource = new MatTableDataSource<any>();
  displayedColumns = [];
  loaderData =[];
  @ViewChild('paginator', {static: false}) paginator: MatPaginator;
  pageSize = 10;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private route: ActivatedRoute,
    private snackBar: Snackbar,
    public router: Router,
    private petService: PetService) {
    this.petId = this.route.snapshot.paramMap.get('petId');
    this.initPet(this.petId);
   }

  ngOnInit(): void {
    this.displayedColumns = ['appointmentId', 'appointmentDate', 'diagnosisAndTreatment', 'controls'];
    this.generateLoaderData(this.pageSize);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  async initPet(petId: string){
    this.isLoading = true;
    try{
      await this.petService.getPetMedicalRecords(petId)
      .subscribe(async res => {
        if (res.success) {
          this.petDetails = res.data;
          this.dataSource.data = res.data.petAppointments.map((pa) => {
            return {
              appointmentId: pa.appointment.appointmentId,
              appointmentDate: pa.appointment.appointmentDate,
              diagnosisAndTreatment: pa.appointment.diagnosisAndTreatment
            }
          });
          this.dataSource.paginator = this.paginator;
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.error = Array.isArray(res.message) ? res.message[0] : res.message;
          this.snackBar.snackbarError(this.error);
          if(this.error.toLowerCase().includes("not found")){
            this.router.navigate(['/records/']);
          }
        }
      }, async (err) => {
        this.isLoading = false;
        this.error = Array.isArray(err.message) ? err.message[0] : err.message;
        this.snackBar.snackbarError(this.error);
        if(this.error.toLowerCase().includes("not found")){
          this.router.navigate(['/records/']);
        }
      });
    }
    catch(e){
      this.isLoading = false;
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
      if(this.error.toLowerCase().includes("not found")){
        this.router.navigate(['/records/']);
      }
    }
  }

  view(appointmentId) {
    window.open("/appointments/details/" + appointmentId, "_blank");
  }

  generateLoaderData(length: number){
    for (let i = 0; i < length; i++) {
      this.loaderData.push(i);
    }

  }

}
