const Discord = require('discord.js');

const handler = {};

let ClientID = null,
	Guild = null;

let addTextChannel = (textChannel, title, body, color, footer) => {
	handler[textChannel] = { title, body, color, footer };
};

let add = (channel, title, body, color, footer) => {
	switch(Guild.channels.cache.get(channel).type){
		case 'category':
			Guild.channels.cache.filter(c => c.parentID === channel).forEach(textChannel => {
				addTextChannel(textChannel.id, title, body, color, footer);
			});
			break;
		case 'text':
			addTextChannel(channel, title, body, color, footer);
			break;
	}
};

let sendMessage = channel => {
	Guild.channels.cache.get(channel).send(new Discord.MessageEmbed({
		title: handler[channel]['title'],
		fields: [
			{
				name: "** **",
				value: handler[channel]['body']
			}
		]
	}).setColor(handler[channel]['color']
		   ).setFooter(handler[channel]['footer']));
};

let deleteLastMessage = (channel, callback) => {
	channel.messages.fetch({ limit: 100 }).then(messages => {
		let lastMessage = messages.find(message => message.author.id === ClientID);
		if(!lastMessage) return callback();
		lastMessage.delete().then(() => callback());
	});
};

module.exports = {
	init: (clientId, guild, messages) => {
		ClientID = clientId;
		Guild = guild;
		messages.forEach(item => {
			if(item['channels']) return item['channels'].forEach(channel => {
				add(channel, item['title'], item['body'], item['color'] || '#FFFFFF', item['footer']);
			});
			add(item['channel'], item['title'], item['body'], item['color'] || '#FFFFFF', item['footer']);
		});
		Object.keys(handler).forEach(channel => deleteLastMessage(Guild.channels.cache.get(channel), () => sendMessage(channel)));
	},
	handle: message => {
		if(!handler[message.channel.id] || message.channel.lastMessage.author.id === ClientID) return;
		deleteLastMessage(message.channel, () => sendMessage(message.channel.id));
	}
};
