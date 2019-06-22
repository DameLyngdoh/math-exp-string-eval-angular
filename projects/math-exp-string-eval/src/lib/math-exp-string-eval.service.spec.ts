import { TestBed } from '@angular/core/testing';

import { MathExpStringEvalService } from './math-exp-string-eval.service';

describe('MathExpStringEvalService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MathExpStringEvalService = TestBed.get(MathExpStringEvalService);
    expect(service).toBeTruthy();
  });
});
