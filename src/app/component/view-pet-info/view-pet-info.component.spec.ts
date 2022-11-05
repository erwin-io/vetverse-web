import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPetInfoComponent } from './view-pet-info.component';

describe('ViewPetInfoComponent', () => {
  let component: ViewPetInfoComponent;
  let fixture: ComponentFixture<ViewPetInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewPetInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPetInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
