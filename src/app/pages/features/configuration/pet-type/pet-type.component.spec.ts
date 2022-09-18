import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetTypeComponent } from './pet-type.component';

describe('PetTypeComponent', () => {
  let component: PetTypeComponent;
  let fixture: ComponentFixture<PetTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PetTypeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PetTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
