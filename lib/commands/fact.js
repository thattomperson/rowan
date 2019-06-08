const facts  = [
  'Azurill is the only pokémon that can change gender.',
  'Psychic type pokémon are weak to bug, ghost, and dark type because they\'re common fears.',
  'Sandshrews are hunted for their scales, go to <https://www.savepangolins.org/> to help save this endangered species'
];

module.exports = {
	name: 'fact',
	description: 'Get a random pokémon fact!',
	execute(msg, args) {
    msg.reply(facts[Math.floor(Math.random()*facts.length)])
  },
};