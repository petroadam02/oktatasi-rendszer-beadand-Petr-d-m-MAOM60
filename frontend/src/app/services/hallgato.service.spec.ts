import { TestBed } from '@angular/core/testing';

import { HallgatoService } from './hallgato.service';

describe('HallgatoService', () => {
  let service: HallgatoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HallgatoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
