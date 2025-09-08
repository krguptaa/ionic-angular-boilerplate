import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Storage } from '@ionic/storage-angular';

import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { APP_CONSTANTS } from '../constants';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let storageMock: jasmine.SpyObj<Storage>;
  let toastServiceMock: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('Storage', ['get', 'set', 'remove', 'create']);
    const toastSpy = jasmine.createSpyObj('ToastService', ['showSuccess', 'showError']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Storage, useValue: storageSpy },
        { provide: ToastService, useValue: toastSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    storageMock = TestBed.inject(Storage) as jasmine.SpyObj<Storage>;
    toastServiceMock = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false when user is not logged in', () => {
    spyOn(service, 'getCurrentUser').and.returnValue(null);
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should return true when user is logged in', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'user' as any,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    // Set both subjects to simulate logged in state
    (service as any).currentUserSubject.next(mockUser);
    (service as any).isAuthenticatedSubject.next(true);
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('should login successfully', (done) => {
    const mockCredentials = { email: 'test@example.com', password: 'password' };
    const mockResponse = {
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 3600,
      user: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user' as any,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    storageMock.set.and.returnValue(Promise.resolve());
    toastServiceMock.showSuccess.and.stub();

    service.login(mockCredentials).subscribe(response => {
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne(`${APP_CONSTANTS.API_BASE_URL}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should handle login error', (done) => {
    const mockCredentials = { email: 'test@example.com', password: 'wrong-password' };

    toastServiceMock.showError.and.stub();

    service.login(mockCredentials).subscribe({
      next: () => fail('Should have failed'),
      error: (error) => {
        expect(error).toBeTruthy();
        done();
      }
    });

    const req = httpMock.expectOne(`${APP_CONSTANTS.API_BASE_URL}/auth/login`);
    req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
  });
});