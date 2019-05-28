const facts  = [
  'Azurill is the only Pokemon that can change gender.',
  'Psychic type Pokemon are weak to bug, ghost, and dark type because they\'re common fears.',
  'Sandshrews are hunted for their scales, go to <https://www.savepangolins.org/> to help save this endangered species'
];

module.exports = {
	name: 'fact',
	description: 'Get a random Pokemon fact!',
	execute(msg, args) {
    msg.reply(facts[Math.floor(Math.random()*facts.length)])
  },
};