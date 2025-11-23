import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnsavedChangesFooter } from './unsaved-changes-footer';

describe('UnsavedChangesFooter', () => {
  let component: UnsavedChangesFooter;
  let fixture: ComponentFixture<UnsavedChangesFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnsavedChangesFooter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnsavedChangesFooter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
