const { MessageEmbed } = require('discord.js');
const { getCompliment } = require('./misc.js')

async function memberInfoEmbed(discord_user, member) {
  const thumbnail = discord_user.avatarURL({dynamic: true})
  const compliment = await getCompliment()
  const embed = new MessageEmbed()
  .setColor('BLUE')
  .setThumbnail(thumbnail)
  .setTitle(discord_user.username)
  .setDescription(String(compliment))
  .addFields(
    { name: 'Level', value: String(member.level)},
    { name: 'Total Messages', value: String(member.messages)},
    { name: 'Messages this month', value: String(member.monthly_messages)},
    { name: 'XP', value: String(member.xp)},
    { name: 'XP this month', value: String(member.monthly_xp)}
  )
  .setTimestamp()

  return embed
}

async function guildInfoEmbed(guild) {
  const embed = new MessageEmbed()
  .setColor('BLUE')
  .setTitle(guild.name)
  // .setDescription(String(compliment))
  .addFields(
    { name: 'Total Messages', value: String(member.messages)},
    { name: 'Messages this month', value: String(member.monthly_messages)},
    { name: 'Total XP Generated', value: String(member.xp)},
    { name: 'XP generated this month', value: String(member.monthly_xp)}
  )
  .setTimestamp()

  return embed
}

module.exports = {
  memberInfoEmbed: memberInfoEmbed
}
