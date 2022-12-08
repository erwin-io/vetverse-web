import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordAndSecurityComponent } from './password-and-security.component';

describe('PasswordAndSecurityComponent', () => {
  let component: PasswordAndSecurityComponent;
  let fixture: ComponentFixture<PasswordAndSecurityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PasswordAndSecurityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordAndSecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
