import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoVerConflictosColocacionComponent } from './dialogo-ver-conflictos-colocacion.component';

describe('DialogoVerConflictosColocacionComponent', () => {
  let component: DialogoVerConflictosColocacionComponent;
  let fixture: ComponentFixture<DialogoVerConflictosColocacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogoVerConflictosColocacionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogoVerConflictosColocacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
