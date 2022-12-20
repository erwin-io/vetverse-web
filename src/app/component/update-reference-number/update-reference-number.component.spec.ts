import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateReferenceNumberComponent } from './update-reference-number.component';

describe('UpdateReferenceNumberComponent', () => {
  let component: UpdateReferenceNumberComponent;
  let fixture: ComponentFixture<UpdateReferenceNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateReferenceNumberComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateReferenceNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
