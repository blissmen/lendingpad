import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LbuttonComponent } from './lbutton.component';

describe('LbuttonComponent', () => {
  let component: LbuttonComponent;
  let fixture: ComponentFixture<LbuttonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LbuttonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LbuttonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
