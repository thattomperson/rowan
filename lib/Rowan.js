const discord = require('discord.js');
const commands = require('./commands');
const adminCommands = require('./adminCommands');
const debug = require('debug')('rowan');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
  require('debug').enable('rowan')
}

const client = new discord.Client

client.on('ready', () => {
  debug(`Logged in as ${client.user.tag}!`);
  client.user.setActivity('Guess that Pokémon')

  // client.channels.find((c) => c.name == 'route-1')
  //   .send("Hi, are you a boi or gril??")
})

client.on('reconnecting', () => {
  debug('reconnecting')
})

client.on('disconnect', () => {
  debug('disconnect')
})

client.on('resume', () => {
  debug('resume')
})

client.on('message', msg => {
  if (msg.channel.type == "dm" && msg.author.id == '114949853330538496') {
    const args = msg.content.split(/ +/);
    const command = args.shift().toLowerCase();
  
    if (adminCommands[command]) {
      adminCommands[command](msg, args)
    }
  }
})

client.on('message', msg => {
  const prefix = process.env.PREFIX || 'r!'
  if (!msg.content.startsWith(prefix) || msg.author.bot) return;

  const args = msg.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  if (commands[command]) {
    commands[command](msg, args)
  }
})

client.login(process.env.DISCORD_TOKEN)

process.on('SIGINT', function() {
  
  client.destroy().then(() => {
    setTimeout(() => process.exit(0), 1000)
  })
});

