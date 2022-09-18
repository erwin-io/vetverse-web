import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetCategoryComponent } from './pet-category.component';

describe('PetCategoryComponent', () => {
  let component: PetCategoryComponent;
  let fixture: ComponentFixture<PetCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PetCategoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PetCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
