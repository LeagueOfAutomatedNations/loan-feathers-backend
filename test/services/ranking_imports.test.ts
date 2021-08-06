import app from '../../src/app';

describe('\'ranking_imports\' service', () => {
  it('registered the service', () => {
    const service = app.service('ranking-imports');
    expect(service).toBeTruthy();
  });
});
