import app from '../../src/app';

describe('\'alliances\' service', () => {
  it('registered the service', () => {
    const service = app.service('alliances');
    expect(service).toBeTruthy();
  });
});
