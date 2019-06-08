'use strict';

const Pokedex = require("pokedex-promise-v2");
const dexCommand = require('../dex');

describe('Pokedex', () => {
  it('should do things', (t) => {
    const _this = {pokedex: new Pokedex()};
    const _message = {reply: (s) => expect(s).toBe("hi")}
    const _args = ['eevee'];

    dexCommand.execute.call(_this, _message, _args)
      .then(t)
  })
});
