import { TestBed } from '@angular/core/testing';

import { FelvettKurzusService } from './felvett-kurzus.service';

describe('FelvettKurzusService', () => {
  let service: FelvettKurzusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FelvettKurzusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
