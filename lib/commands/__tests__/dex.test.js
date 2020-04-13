'use strict';

const Pokedex = require("pokedex-promise-v2");
const dexCommand = require('../dex');

describe('Pokedex', () => {
  it('should do things', (t) => {

    const _this = {pokedex: new Pokedex()};
    const _message = { channel: { send: jest.fn() } }
    const _args = ['eevee'];

    dexCommand.execute.call(_this, _message, _args)
      .then((r) => {
        expect(_message.channel.send.mock.calls.length).toBe(2);
        t()
      })
  })
});
