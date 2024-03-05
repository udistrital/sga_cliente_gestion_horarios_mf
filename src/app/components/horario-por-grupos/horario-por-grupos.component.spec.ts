import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorarioPorGruposComponent } from './horario-por-grupos.component';

describe('HorarioPorGruposComponent', () => {
  let component: HorarioPorGruposComponent;
  let fixture: ComponentFixture<HorarioPorGruposComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorarioPorGruposComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HorarioPorGruposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
