import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapModalPage } from './map-modal.page';

describe('MapModalPage', () => {
  let component: MapModalPage;
  let fixture: ComponentFixture<MapModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MapModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
