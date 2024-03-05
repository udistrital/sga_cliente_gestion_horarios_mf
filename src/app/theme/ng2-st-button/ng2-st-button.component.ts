import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-custom-cell',
  template: `
    <div>  
      <button mat-button color="primary" (click)="action()" [disabled]="value.disabled" [hidden]="value.hidden">\
        
      </button>
    </div>
  `,
  styles: [
    'div { display: flex; justify-content:center; align-items:center; }',
    'button { height: 2rem; width: 2rem; }', 
    'mat-icon { font-size: 2rem; }'
  ]
})
export class Ng2StButtonComponent implements OnInit {

  @Input() value: any;
  @Input() rowData: any;
  @Output() valueChanged: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  action() {
    this.valueChanged.emit({value: this.value.value, rowData: this.rowData});
  }

  getIconName(type: string): string {
    switch (type) {
      case 'ver':
        return 'search';
      case 'editar':
        return 'edit';
      case 'borrar':
        return 'delete';
      case 'crear':
        return 'add';
      case 'enviar':
        return 'send';
      case 'evaluar':
        return 'check';
      default:
        return '';
    }
  }
}
