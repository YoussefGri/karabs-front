import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { HomePage } from './home.page';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../services/auth.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { EnseignesService } from 'src/app/services/enseignes.service';
describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let authServiceMock: any;
  let enseigneServiceMock: any;

  beforeEach(waitForAsync(() => {
    authServiceMock = {
      currentUser$: of({ name: 'Test User', email: 'test@example.com' }),
      logout: jasmine.createSpy('logout')
    };

    enseigneServiceMock = {
      getAllEnseignes: jasmine.createSpy('getAllEnseignes').and.returnValue(of({
        enseignes: Array(15).fill(0).map((_, i) => ({
          id: i + 1,
          nom: `Enseigne ${i + 1}`,
          imageUrl: `assets/default.jpg`,
          categorie: `Catégorie ${(i % 3) + 1}`
        }))
      }))
    };

    TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: EnseignesService, useValue: enseigneServiceMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user data on init', () => {
    expect(component.user).toEqual({ name: 'Test User', email: 'test@example.com' });
  });

  it('should load 10 random enseignes', (done) => {
    component.loadRandomEnseignes();
    setTimeout(() => {
      expect(component.enseignes.length).toBe(10);
      done();
    }, 100);
  });

  it('should call logout method from authService when logout is called', () => {
    component.logout();
    expect(authServiceMock.logout).toHaveBeenCalled();
  });

  it('should select random enseignes', () => {
    const mockEnseignes = Array(20).fill(0).map((_, i) => ({ id: i + 1 }));
    const result1 = component.getRandomEnseignes(mockEnseignes, 10);
    const result2 = component.getRandomEnseignes(mockEnseignes, 10);
    
    expect(result1.length).toBe(10);
    expect(result2.length).toBe(10);
    
    // Il est possible (mais peu probable) que les deux tableaux soient identiques
    // donc ce test pourrait échauder aléatoirement
    expect(JSON.stringify(result1) === JSON.stringify(result2)).toBeFalse();
  });
});