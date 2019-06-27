const { RichEmbed, Attachment } = require('discord.js')

const versions = [
  'red',
  'blue',
  'yellow',
  'gold',
  'silver',
  'crystal',
  'ruby',
  'sapphire',
  'emerald',
  'firered',
  'leafgreen',
  'diamond',
  'pearl',
  'platinum',
  'heartgold',
  'soulsilver',
  'black',
  'white',
  'black-2',
  'white-2',
  'x',
  'y',
  'omega-ruby',
  'alpha-sapphire',
  'moon',
  'ultra-sun'
]

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
    let species = await this.pokedex.getPokemonSpeciesByName(
      args[0].toLowerCase()
    )
    let pokemon = await this.pokedex.getPokemonByName(args[0].toLowerCase())

    const texts = species.flavor_text_entries
      .filter(t => t.language.name === 'en')
      .sort(
        (a, b) =>
          versions.indexOf(a.version.name) < versions.indexOf(b.version.name)
      )

    const text = texts[0].flavor_text

        console.log(pokemon, text)

    const embed = new RichEmbed()
      // Set the title of the field
      .setTitle(`${pascal(pokemon.name)} - ${pokemon.id}`)
      .setThumbnail(pokemon.sprites.front_default)
      // Set the color of the embed
      .setColor(0xff0000)
      // Set the main content of the embed
      .setDescription(text)
      .addField('ID', pokemon.id, true)
      .addField('Height', pokemon.height, true)
      .setImage(
        `https://raw.githubusercontent.com/thattomperson/rowan/master/assets/types/${pokemon.types
          .map(a => a.type.name)
          .join('-')}.png`
      )
    

    // .setFooter(`you can also use ${msg.client.prefix}moves ${pascal(pokemon.name)} and ${msg.client.prefix}locations ${pascal(pokemon.name)}`)
    // Send the embed to the same channel as the message
    console.log(embed)
    msg.channel.send('here you go')
    msg.channel.send(embed)
  }
}
