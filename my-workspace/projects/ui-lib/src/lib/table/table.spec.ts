import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Table } from './table';

describe('Table', () => {
  let fixture: ComponentFixture<Table>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Table] }).compileComponents();
    fixture = TestBed.createComponent(Table);
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
