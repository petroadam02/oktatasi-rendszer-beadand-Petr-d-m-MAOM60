import { TestBed } from '@angular/core/testing';

import { TargyService } from './targy.service';

describe('TargyService', () => {
  let service: TargyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TargyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
