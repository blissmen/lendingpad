import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {  TodoService } from './services/impl/todo.service';
import { ITodo } from './models/todo.interface';
import { LbuttonComponent } from "../components/lbutton/lbutton.component";

@Component({
    selector: 'app-todo.component',
    templateUrl: './todo.component.html',
    styleUrl: './todo.component.scss',
    imports: [CommonModule, FormsModule, LbuttonComponent]
})
export class TodoComponent {
constructor(public todoService: TodoService) {
    this.todoService.pullData();
}

  // Signals for applied filter dates (creation date range)
  filterStart = signal<Date | null>(null);
  filterEnd = signal<Date | null>(null);
  // Signals for the temporary filter input values (drafts)
  filterStartDraft = signal<string | null>(null);
  filterEndDraft = signal<string | null>(null);

  // Signals for current sorting state
  sortKey = signal<'name' | 'date'>('name');
  sortAsc = signal<boolean>(true);

get filterStartDraftModel(): string | null {
  return this.filterStartDraft();
}
set filterStartDraftModel(value: string | null) {
  this.filterStartDraft.set(value);
}

get filterEndDraftModel(): string | null {
  return this.filterEndDraft();
}
set filterEndDraftModel(value: string | null) {
  this.filterEndDraft.set(value);
}   
  // Computed signal for the visible list (filtered and sorted)
  visibleTodos = computed<ITodo[]>(() => {
    let items = this.todoService.todos();  // get current list from service signal
    // Apply date filtering
    const start = this.filterStart();
    const end = this.filterEnd();
    if (start) {
      items = items.filter(item => item.creationDate >= start);
    }
    if (end) {
      items = items.filter(item => item.creationDate <= end);
    }
    // Apply sorting
    if (this.sortKey() === 'name') {
      items = [...items].sort((a, b) => a.title.localeCompare(b.title));
    } else if (this.sortKey() === 'date') {
      items = [...items].sort((a, b) => a.creationDate.getTime() - b.creationDate.getTime());
    }
    if (!this.sortAsc()) {
      items.reverse();
    }
    return items;
  });

  // UI state for editing
  editingNameId: number | null = null;     // which item is in "edit name" mode
  selectedItem: ITodo | null = null;    // currently selected item for description editing

  // Mobile filter sidebar open state
  mobileFilterOpen: boolean = false;

  /** Filter panel actions */
  openFilterPanel(): void {
    // Open filter sidebar (on mobile): initialize draft inputs from current applied filter
    this.filterStartDraft.set(this.filterStart() ? this.formatDateISO(this.filterStart()!) : null);
    this.filterEndDraft.set(this.filterEnd() ? this.formatDateISO(this.filterEnd()!) : null);
    this.mobileFilterOpen = true;
  }
  applyFilter(): void {
    // Apply the date range filter from the draft values
    const startStr = this.filterStartDraft();
    const endStr = this.filterEndDraft();
    this.filterStart.set(startStr ? new Date(startStr) : null);
    this.filterEnd.set(endStr ? new Date(endStr) : null);
    this.mobileFilterOpen = false;
  }
  resetFilter(): void {
    console.log("Resetting filter");
    // Clear filter fields and remove filter
    this.filterStartDraft.set(null);
    this.filterEndDraft.set(null);
    this.filterStart.set(null);
    this.filterEnd.set(null);
    this.mobileFilterOpen = false;
  }

  /** Sorting by column */
  sortBy(key: 'name' | 'date'): void {
    if (this.sortKey() === key) {
      // Toggle sort direction if same column clicked again
      this.sortAsc.set(!this.sortAsc());
    } else {
      // Switch to new sort column (default to ascending)
      this.sortKey.set(key);
      this.sortAsc.set(true);
    }
  }

  toggleDone(item: ITodo): void {
    this.todoService.toggleDone(item);
  }

  deleteItem(item: ITodo): void {
    this.todoService.deleteTodo(item.id);
    // If the deleted item was being edited in the sidebar, close the panel
    if (this.selectedItem && this.selectedItem.id === item.id) {
      this.selectedItem = null;
    }
  }

  /** Open the description edit panel for an item */
  openDescription(item: ITodo): void {
    // Use a copy of the item for editing, to avoid mutating the list before save
    this.selectedItem = { ...item };
  }
  saveDescription(newDesc: string): void {
    console.log("Saving description:", newDesc,this.selectedItem);
    if (this.selectedItem) {
      this.todoService.updateDescription(this.selectedItem, newDesc);
    }
    console.log("Description saved.",this.todoService.todos());
    this.selectedItem = null;
  }
  closePanel(): void {
    this.selectedItem = null;
  }

  // Helper: format a Date as YYYY-MM-DD string (for <input type="date> value)
  private formatDateISO(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}