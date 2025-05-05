import { TestBed } from '@angular/core/testing';

import { UpToDateService } from './up-to-date.service';

describe('UpToDateService', () => {
  let service: UpToDateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UpToDateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
