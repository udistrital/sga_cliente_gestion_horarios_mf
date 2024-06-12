import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopiarHorarioComponent } from './copiar-horario.component';

describe('CopiarHorarioComponent', () => {
  let component: CopiarHorarioComponent;
  let fixture: ComponentFixture<CopiarHorarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CopiarHorarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CopiarHorarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
