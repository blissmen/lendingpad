import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lbutton',
  standalone: true,
  imports: [CommonModule ],
  templateUrl: './lbutton.component.html',
  styleUrl: './lbutton.component.scss'
})
export class LbuttonComponent {

  @Output() onbClick = new EventEmitter<void>();

  @Input() type: 'primary' | 'secondary' = 'primary';
  @Input() text: string = '';
  @Input() icon: string = '';
  onClick() {
    this.onbClick.emit();
  }
} 