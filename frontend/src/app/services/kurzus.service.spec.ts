import { TestBed } from '@angular/core/testing';

import { KurzusService } from './kurzus.service';

describe('KurzusService', () => {
  let service: KurzusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KurzusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
