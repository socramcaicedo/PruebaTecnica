import { TestBed } from '@angular/core/testing';

import { ResourceState } from './resource-state';

describe('ResourceState', () => {
  let service: ResourceState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResourceState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
