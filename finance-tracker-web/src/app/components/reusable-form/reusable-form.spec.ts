import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReusableForm } from './reusable-form';

describe('ReusableForm', () => {
  let component: ReusableForm;
  let fixture: ComponentFixture<ReusableForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReusableForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReusableForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
