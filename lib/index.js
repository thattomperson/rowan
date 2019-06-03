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
const cron = require('node-cron');

const defaultCooldown = 1

client.commands = new Discord.Collection();
client.pokedex =  new Pokedex();
client.prefix = process.env.PREFIX || 'r!'
client.error = rollbar.error

const commandFiles = fs.readdirSync(__dirname + '/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
	if (!message.content.startsWith(client.prefix) || message.author.bot) return;

	const args = message.content.slice(client.prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
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
		command.execute.call(client, message, args);
	} catch (error) {
		rollbar.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

client.login(process.env.DISCORD_TOKEN);

process.on('SIGINT', function() {
  client.destroy().then(() => {
    setTimeout(() => process.exit(0), 1000)
  })
});

cron.schedule('0 0 12 * * *', async () => { 
  const user = await client.fetchUser('114949853330538496', true)
  user.send('Do your daily rewards')
}, {
  timezone: 'Australia/Adelaide'
})