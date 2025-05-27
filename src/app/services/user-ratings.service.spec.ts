import { TestBed } from '@angular/core/testing';

import { UserRatingsService } from './user-ratings.service';

describe('UserRatingsService', () => {
  let service: UserRatingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserRatingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
