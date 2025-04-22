import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnseigneDetailPage } from './enseigne-detail.page';

describe('EnseigneDetailPage', () => {
  let component: EnseigneDetailPage;
  let fixture: ComponentFixture<EnseigneDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EnseigneDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
