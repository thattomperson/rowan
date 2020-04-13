// include and initialize the rollbar library with your access token
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

var Rollbar = require("rollbar");

var rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true
});

const fs = require('fs');
const Discord = require('discord.js');
const Pokedex = require("pokedex-promise-v2");
const DBL = require("dblapi.js");
const client = new Discord.Client();
const dbl = new DBL(process.env.DBL_TOKEN, client);
const utils = require('./utils')
const runs = utils.counter(60 * 60 * 1000)

const defaultCooldown = 1

const logChannel = '582773268310786058'

client.commands = new Discord.Collection();
client.pokedex =  new Pokedex();
client.prefix = process.env.CMD_PREFIX || 'r!'
client.error = (err) => {
  rollbar.error(err)
  console.error(err)
}

const commandFiles = fs.readdirSync(__dirname + '/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
  console.log(`loaded ${command.name}`)
}

const cooldowns = new Discord.Collection();

client.on('message', message => {
	if (!message.content.startsWith(client.prefix) || message.author.bot) return;

	const args = message.content.slice(client.prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
    || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    
    
    if (!command) return;
    
  console.log("Command found")
	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${client.prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || defaultCooldown) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
    console.log(`running ${command.name} with [${args.join(' ')}]`)
    command.execute.call(client, message, args);
    runs.inc()

	} catch (err) {
    client.error(err)
		message.reply('there was an error trying to execute that command!');
	}
});

client.once('ready', () => {
  client.user.setActivity(`Pokemon in the wild`, { type: 'WATCHING' })
})

client.on('error', client.error)

client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log('ready'))
  .catch(err => rollbar.error(err))

client.on('message', (msg) => {
  if (msg.channel.id == logChannel && msg.content == `${client.prefix}info`) {
    
    let embed = new Discord.MessageEmbed()
    embed.setTitle('Bot Info')
    embed.setColor(0x00ff00)
    embed.addField('CPU', JSON.stringify(process.cpuUsage()))
    embed.addField('Mem', JSON.stringify(process.memoryUsage()))
    embed.addField('Users', JSON.stringify(client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)))
    embed.addField('Runs', JSON.stringify(runs.val()))
    
    msg.channel.send(embed)
      .then(c => console.log(c))
      .catch(client.error)
  }
})