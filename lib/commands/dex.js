const { RichEmbed } = require('discord.js');


const versions = ['red', 'blue', 'yellow', 'gold', 'silver', 'crystal', 'ruby', 'sapphire', 'emerald', 'firered', 'leafgreen', 'diamond', 'pearl', 'platinum', 'heartgold', 'soulsilver', 'black', 'white', 'black-2', 'white-2', 'x', 'y', 'omega-ruby', 'alpha-sapphire', 'moon', 'ultra-sun'];

function pascal(string) {
  return `${string}`
    .replace(new RegExp(/[-_]+/, 'g'), ' ')
    .split(' ')
    .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

module.exports = {
  name: 'pokedex',
  aliases: ['dex'],
  description: 'Look up a pokémon in the Pokedex!',
  usage: '[pokémon name or id]',
	async execute(msg, args) {
    try {
      let species = await this.pokedex.getPokemonSpeciesByName(args[0].toLowerCase())
      let pokemon = await this.pokedex.getPokemonByName(args[0].toLowerCase())

      const texts = species.flavor_text_entries.filter(t => t.language.name === 'en')
        .sort((a, b) => versions.indexOf(a.version.name) < versions.indexOf(b.version.name))
        

      const text = texts[0].flavor_text

      console.log(texts)

      const embed = new RichEmbed()
        // Set the title of the field
        .setTitle(pascal(pokemon.name))
        .setThumbnail(pokemon.sprites.front_default)
        // Set the color of the embed
        .setColor(0xFF0000)
        // Set the main content of the embed
        .setDescription(text)
        .addField('Height', pokemon.height, true)
        .addField('ID', pokemon.id, true)
        .addField('Types', pokemon.types.map(a => a.type.name).join(' '))
      // Send the embed to the same channel as the message
      msg.channel.send(embed);

      // console.log(species, pokemon)
    } catch (e) {
      console.error(e)
      return msg.reply(`I couldn't find any evolutions in the pokedex for ${pascal(args[0])}`)
    }
	},
};