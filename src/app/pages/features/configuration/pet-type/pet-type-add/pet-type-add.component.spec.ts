import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetTypeAddComponent } from './pet-type-add.component';

describe('PetTypeAddComponent', () => {
  let component: PetTypeAddComponent;
  let fixture: ComponentFixture<PetTypeAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PetTypeAddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PetTypeAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
