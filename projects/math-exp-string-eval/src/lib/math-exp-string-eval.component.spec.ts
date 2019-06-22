import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MathExpStringEvalComponent } from './math-exp-string-eval.component';

describe('MathExpStringEvalComponent', () => {
  let component: MathExpStringEvalComponent;
  let fixture: ComponentFixture<MathExpStringEvalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MathExpStringEvalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MathExpStringEvalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
