
function pascal(string) {
  return `${string}`
    .replace(new RegExp(/[-_]+/, 'g'), ' ')
    .split(' ')
    .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}


function _evolutions({species, evolves_to}, indent = 0) {
  let res = [];
  if (!evolves_to) {
    return;
  }

  for (let index = 0; index < evolves_to.length; index++) {
    const element = evolves_to[index];
    let message = `**${pascal(species.name)}** evolves into **${pascal(element.species.name)}**`

    for (let evoIndex = 0; evoIndex < element.evolution_details.length; evoIndex++) {
      const details = element.evolution_details[evoIndex];
      if (evoIndex > 0) {
        message += "\n  OR"
      }

      let first = true
      switch (details.trigger.name) {
        case 'level-up':
          if (details.min_level) {
            message += ` at level **${details.min_level}**`
            first = false
          }
          if (details.party_species) {
            message += ` ${first ? 'when' : 'and'} you have a **${pascal(details.party_species.name)}** in your party`
            first = false
          }
          if (details.known_move) {
            message += ` ${first ? 'when' : 'and'} it knows **${pascal(details.known_move.name)}**`
            first = false
          }
          if (details.known_move_type) {
            message += ` ${first ? 'when' : 'and'} it knows a move of **${pascal(details.known_move_type.name)}** type`
            first = false
          }
          if (details.location) {
            message += ` ${first ? 'when' : 'and'} it is at **${pascal(details.location.name)}**`
            first = false
          }
          if (details.min_happiness) {
            message += ` ${first ? 'when' : 'and'} it has a happiness of **${details.min_happiness}**`
            first = false
          }
          if (details.time_of_day) {
            message += ` ${first ? 'when' : 'and'} it is **${details.time_of_day} time**`
            first = false
          }
          break;
        case 'trade':
          message += ` in a trade`
          break;
        case 'use-item':
          message += ` ${first ? 'when' : 'and'} you use a **${pascal(details.item.name)}**`
          break;
        default:
          message += ` ${first ? 'when' : 'and'} idk fam, check it out ${JSON.stringify(details)}`
          break;
      }
    }

    res.push(message)
    res = res.concat(_evolutions(element))
  }
  return res
}


module.exports = {
  name: 'evolutions',
  aliases: ['evo'],
  description: 'Find out when a pokémon evolves and any special conditions!',
  usage: '[pokémon name or id]',
	async execute(msg, args) {
    try {
      let pokemon = await this.pokedex.getPokemonSpeciesByName(args[0].toLowerCase())
      let chain = (await this.pokedex.resource(pokemon.evolution_chain.url)).chain

      const res = _evolutions(chain)
      if (res.length > 0) {
        return msg.reply(res.join("\n"))
      }
      return msg.reply("Don't be dumb")
    } catch (e) {
      return msg.reply(`I couldn't find any evolutions in the pokedex for ${pascal(args[0])}`)
    }
	},
};