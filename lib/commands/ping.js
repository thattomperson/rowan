module.exports = {
	name: 'ping',
	description: 'Ping!',
	execute(message, args) {
    console.log('Pong')
		message.channel.send('Pong.');
	},
};