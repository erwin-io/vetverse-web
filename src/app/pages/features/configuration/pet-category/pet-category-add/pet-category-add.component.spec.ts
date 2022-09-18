import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetCategoryAddComponent } from './pet-category-add.component';

describe('PetCategoryAddComponent', () => {
  let component: PetCategoryAddComponent;
  let fixture: ComponentFixture<PetCategoryAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PetCategoryAddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PetCategoryAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
