import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionHorarioComponent } from './gestion-horario.component';

describe('GestionHorarioComponent', () => {
  let component: GestionHorarioComponent;
  let fixture: ComponentFixture<GestionHorarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionHorarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionHorarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
