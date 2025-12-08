import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { TodoBaseService } from '../todo-base.service';
import { ITodo } from '../../models/todo.interface';
import { HttpClient } from '@angular/common/http';


@Injectable({ providedIn: 'root' })
export class TodoService extends TodoBaseService {

    constructor(private http: HttpClient) {
        super();
    }

    static GIVEN_START_DATE_INDEX = new Date('2024-01-01')
    static GIVEN_END_DATE_INDEX = new Date('2024-07-01');

    override setTodos(todos: ITodo[]): void {
        this.todos.set(todos);
    }
    override addTodo(todo: ITodo): void {
        throw new Error('Method not implemented.');
    }
    override deleteTodo(id: number): void {
        this.todos.update(list => list.filter(t => t.id !== id));
    }
    override updateTodo(id: number, changes: Partial<ITodo>): void {
        this.todos.set(this.todos().map(t =>
            t.id === id ? { ...t, ...changes } : t
        ));
    }
    // Initialize with some mock to-do items
    public pullData() {
        console.log("Pulling data...");
        this.http.get<ITodo[]>('https://jsonplaceholder.typicode.com/todos?_limit=20').subscribe(data => {
            const normalized = data.map(item => ({
                ...item,
                creationDate: this.randomDate(TodoService.GIVEN_START_DATE_INDEX, TodoService.GIVEN_END_DATE_INDEX)
            }));
            this.todos.set(normalized);

        }, error => {
            console.error("Error fetching data:", error);
        });
    }

    // Signal holding the list of to-do items
    public todos = signal<ITodo[]>([]);

    private randomDate(start: Date, end: Date): Date {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }
    /** Mark an item as done/undone */
    toggleDone(item: ITodo): void {
        this.updateTodo(item.id, { completed: !item.completed });
    }

    /** Update an item's description */
    updateDescription(item: ITodo, newDesc: string): void {
      this.updateTodo(item.id, { title: newDesc });
    }

 
}
