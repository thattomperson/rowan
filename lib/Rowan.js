const discord = require('discord.js');
const commands = require('./commands');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const client = new discord.Client

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity('Guess that Pokémon')

  // client.channels.find((c) => c.name == 'route-1')
  //   .send("Hi, are you a boi or gril??")
})

client.on('message', msg => {
  const prefix = ','
  if (!msg.content.startsWith(prefix) || msg.author.bot) return;

  const args = msg.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  if (commands[command]) {
    commands[command](msg, args)
  }
})

client.login(process.env.DISCORD_TOKEN)
