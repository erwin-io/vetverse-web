import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { FormControl } from '@angular/forms';
import { Pet } from 'src/app/core/model/appointment.model';
import { PetService } from 'src/app/core/services/pet.service';
import { Snackbar } from 'src/app/core/ui/snackbar';

@Component({
  selector: 'app-health-records',
  templateUrl: './health-records.component.html',
  styleUrls: ['./health-records.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HealthRecordsComponent implements OnInit {

  error:string;
  dataSource = new MatTableDataSource<Pet>();
  data: Pet[] = [];
  displayedColumns = [];
  isLoading = false;
  loaderData =[];
  isProcessing = false;
  @ViewChild('paginator', {static: false}) paginator: MatPaginator;
  pageSize = 10;

  keywordCtrl = new FormControl('');

  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private petService: PetService,
    private snackBar: Snackbar,
    private dialog: MatDialog,
    public router: Router) { }

  ngOnInit(): void {
    this.getPets();
    this.generateLoaderData(this.pageSize);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  filter() {
    this.isLoading = true;
    const keyword = this.keywordCtrl.value.toLowerCase();
    this.dataSource.data = this.data.length > 0 ?
    this.data.filter(x=>x.name.toLowerCase().includes(keyword) ||
    x.petCategory.name.toLowerCase().includes(keyword)): [];
    this.dataSource.paginator = this.paginator;
    this.isLoading = false;
  }

  view(petId: string) {
    this.router.navigate(['/records/pet/' + petId]);
  }

  getPets(){
    this.displayedColumns = ['petId', 'name', 'category', 'owner', 'email' , 'mobileNumber', 'controls'];
    try{
      this.isLoading = true;
      this.petService.get()
      .subscribe(async res => {
        if(res.success){
          this.data = res.data;
          this.dataSource.data = this.data;
          this.dataSource.paginator = this.paginator;
          this.isLoading = false;
        }
        else{
          console.log(res)
          this.error = Array.isArray(res.message) ? res.message[0] : res.message;
          this.snackBar.snackbarError(this.error);
          this.isLoading = false;
        }
      }, async (err) => {
        console.log(err)
        this.error = Array.isArray(err.message) ? err.message[0] : err.message;
        this.snackBar.snackbarError(this.error);
        this.isLoading = false;
      });
    }
    catch(e){
      console.log(e)
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
    }

  }

  generateLoaderData(length: number){
    for (let i = 0; i < length; i++) {
      this.loaderData.push(i);
    }

  }
}
