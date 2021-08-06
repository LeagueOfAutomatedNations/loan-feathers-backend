import app from '../../src/app';

describe('\'alliance_invites\' service', () => {
  it('registered the service', () => {
    const service = app.service('alliance-invites');
    expect(service).toBeTruthy();
  });
});
