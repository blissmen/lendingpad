import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ITodo } from '../models/todo.interface';

@Component({
  selector: 'app-edit-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-panel.component.html',
  styleUrls: ['./edit-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditPanelComponent implements OnChanges {
  @Input() item!: ITodo;
  @Output() save = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  descriptionDraft: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && this.item) {
      // Reset the draft whenever a new item is input
      this.descriptionDraft = this.item.title;
    }
  }

  onSave(): void {
    this.save.emit(this.descriptionDraft);
  }

  onClose(): void {
    this.close.emit();
  }
}
