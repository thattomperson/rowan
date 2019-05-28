const  Pokedex = require("pokedex-promise-v2");
const pokedex = new Pokedex();

const debug = require('debug')('rowan:cmd:admin');

function info(msg, args) {
  msg.channel.send(JSON.stringify({mem: process.memoryUsage(), proc: process.cpuUsage()}))
}


module.exports = {
  info
}

