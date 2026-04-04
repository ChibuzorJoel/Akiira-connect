import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryGuideComponent } from './salary-guide.component';

describe('SalaryGuideComponent', () => {
  let component: SalaryGuideComponent;
  let fixture: ComponentFixture<SalaryGuideComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalaryGuideComponent]
    });
    fixture = TestBed.createComponent(SalaryGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
