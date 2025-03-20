import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GererfichierComponent } from './gererfichier.component';

describe('GererfichierComponent', () => {
  let component: GererfichierComponent;
  let fixture: ComponentFixture<GererfichierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GererfichierComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GererfichierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
