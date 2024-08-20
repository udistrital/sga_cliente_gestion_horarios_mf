import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaCopiarHorariosComponent } from './lista-copiar-horarios.component';

describe('ListaCopiarHorariosComponent', () => {
  let component: ListaCopiarHorariosComponent;
  let fixture: ComponentFixture<ListaCopiarHorariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaCopiarHorariosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListaCopiarHorariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
