import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponderRescueDetailComponent } from './responder-rescue-detail.component';

describe('ResponderRescueDetailComponent', () => {
  let component: ResponderRescueDetailComponent;
  let fixture: ComponentFixture<ResponderRescueDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResponderRescueDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResponderRescueDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
