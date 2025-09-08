import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PinLoginPage } from './pin-login.page';

describe('PinLoginPage', () => {
  let component: PinLoginPage;
  let fixture: ComponentFixture<PinLoginPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PinLoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
