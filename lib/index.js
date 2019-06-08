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

const logChannel = '582773268310786058'

client.commands = new Discord.Collection();
client.pokedex =  new Pokedex();
client.prefix = process.env.CMD_PREFIX || 'r!'
client.error = rollbar.error

const commandFiles = fs.readdirSync(__dirname + '/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
  console.log(`loaded ${command.name}`)
}

const cooldowns = new Discord.Collection();

client.on('message', message => {

  console.log(client.prefix)

	if (!message.content.startsWith(client.prefix) || message.author.bot) return;

	const args = message.content.slice(client.prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
    || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    
    console.log("Command found")

	if (!command) return;

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
		command.execute.call(client, message, args);
	} catch (error) {
		rollbar.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

client.once('ready', () => {
  cron.schedule('0 0 12 * * *', async () => { 
    const user = await client.fetchUser('114949853330538496')
    user.send('Do your daily rewards')
  }, {
    timezone: 'Australia/Adelaide'
  })

  cron.schedule('0 0 13 * * *', async () => {
    const user = await client.fetchUser('114950492630548480')
    user.send('**!daily** Make sure you do your daily rewards')
  }, {
    timezone: 'Australia/Adelaide'
  })

  cron.schedule('* * * * *', async () => { 
    const trainers = client.guilds.reduce((a, g) => a+g.memberCount, 0);
    client.user.setActivity(`helping ${intToString(trainers)} trainers`)
  })
})

function intToString (value) {
  var suffixes = ["", "k", "m", "b","t"];
  var suffixNum = Math.floor((""+value).length/3);
  var shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000,suffixNum)) : value).toPrecision(2));
  if (shortValue % 1 != 0) {
      var shortNum = shortValue.toFixed(1);
  }
  return shortValue+suffixes[suffixNum];
}

client.on('error', (e) => rollbar.error(e))
client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log('ready'), e => {
    rollbar.error(e) 
  });


client.on('message', (msg) => {
  if (msg.channel.id == '582773268310786058' && msg.content == "r!info") {
    msg.channel.send('CPU: ' + JSON.stringify(process.cpuUsage()))
    msg.channel.send('MEM: ' + JSON.stringify(process.memoryUsage()))
    msg.channel.send("Guilds:\n```\n" + client.guilds.map(g => `${g.name}: ${g.memberCount}`).join("\n") + "\n```")
    msg.channel.send("Total users: " + client.guilds.reduce((a, g) => a + g.memberCount, 0))
  }
})

client.on('guildCreate', (g) => {
  client.channels.find(c => c.id === logChannel).send(`New Guild: \`${g.name}\`: ${g.memberCount} members`)
})