import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewVeterinarianInfoComponent } from './view-veterinarian-info.component';

describe('ViewVeterinarianInfoComponent', () => {
  let component: ViewVeterinarianInfoComponent;
  let fixture: ComponentFixture<ViewVeterinarianInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewVeterinarianInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewVeterinarianInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
