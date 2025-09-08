import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

import { AppComponent } from './app.component';
import { ThemeToggleComponent } from './shared/components/theme-toggle/theme-toggle.component';

describe('AppComponent', () => {
  let storageMock: jasmine.SpyObj<Storage>;

  beforeEach(async () => {
    const storageSpy = jasmine.createSpyObj('Storage', ['create']);
    storageSpy.create.and.returnValue(Promise.resolve(storageSpy as any));

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        RouterTestingModule,
        IonicModule.forRoot(),
        ThemeToggleComponent
      ],
      providers: [
        { provide: Storage, useValue: storageSpy }
      ]
    }).compileComponents();

    storageMock = TestBed.inject(Storage) as jasmine.SpyObj<Storage>;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
