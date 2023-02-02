const Discord = require('discord.js');
const botconfig = require('./botconfig.json');
const messageHandler = require('./messageHandler.js');
const bot = new Discord.Client();
const deleter = require('./deleter.js');
let guild = bot.guilds.cache.get("882238507001741342");

let channels = [];

bot.on("ready", async () => {
  guild = bot.guilds.cache.get(botconfig.guild);
  messageHandler.init(bot.user.id, bot.guilds.cache.get(botconfig.guild), botconfig.messages)
  console.log(`${bot.user.username} is working!`);

  botconfig.channels.forEach(c => {
    c = guild.channels.cache.get(c);
    switch (c.type) {
      case 'text':
        channels.push(c);
        break;
      case 'category':
        channels = channels.concat(guild.channels.cache.filter(c => c.parentID === c.id && c.type === 'text').array());
        break;
    }
  });


});

bot.on('message', message => messageHandler.handle(message));

bot.on('error', err => console.error(err));

process.on('uncaughtException', err => console.error(err.stack));

process.on('unhandledRejection', err => console.error(`Uncaught Promise Rejection: \n${err.stack}`));

bot.on('guildMemberRemove', member => {
  if (member.guild.id !== botconfig.guild) return;
  const logChannel = bot.channels.cache.get(botconfig.logChannel);
  const guild = bot.guilds.cache.get("882238507001741342");
  logChannel.send(`Deleting messages from \`${member.user.tag}\``);
  deleter.delete(member.user, channels, n => {
    let deletedembed = new Discord.MessageEmbed()
      .setAuthor("Auto Purge", bot.user.displayAvatarURL())
      .setThumbnail(`${member.user.displayAvatarURL({ dynamic: true })}`)
      .addField("User Left", `**${member.user.tag}**\n\`${member.user.id}\``)
      .addField("Advertisements Deleted", `\`${n}\``)
      .setColor("c04949")
      .setFooter(`User joined ${member.joinedAt}`, guild.iconURL({ dynamic: true }))

    if (botconfig.logChannel)
      logChannel.send(deletedembed);
  });
});

bot.login(botconfig.token);
