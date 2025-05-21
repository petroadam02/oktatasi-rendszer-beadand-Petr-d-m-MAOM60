import { TestBed } from '@angular/core/testing';

import { OktatoService } from './oktato.service';

describe('OktatoService', () => {
  let service: OktatoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OktatoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
