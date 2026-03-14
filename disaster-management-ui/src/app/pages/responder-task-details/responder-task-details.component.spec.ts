import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponderTaskDetailsComponent } from './responder-task-details.component';

describe('ResponderTaskDetailsComponent', () => {
  let component: ResponderTaskDetailsComponent;
  let fixture: ComponentFixture<ResponderTaskDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResponderTaskDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResponderTaskDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
