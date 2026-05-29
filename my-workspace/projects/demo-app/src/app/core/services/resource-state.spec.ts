import { TestBed } from '@angular/core/testing';
import { ResourceState } from './resource-state';

describe('ResourceState', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should create', () => {
    const service = TestBed.inject(ResourceState);
    expect(service).toBeTruthy();
  });
});
