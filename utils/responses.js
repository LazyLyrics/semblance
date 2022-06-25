const { MessageEmbed } = require('discord.js');
const { getCompliment } = require('./misc.js')
const { supabase } = require('./db');
const logger = require('./logging.js');

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
  const icon = guild.iconURL({dynamic: true})
  const embed = new MessageEmbed()
  .setColor('BLUE')
  .setTitle(guild.name)
  .addFields(
    { name: 'Total Messages', value: String("Coming Soon")},
    { name: 'Messages this month', value: String("Coming Soon")},
    { name: 'Total XP Generated', value: String("Coming Soon")},
    { name: 'XP generated this month', value: String("Coming Soon")}
  )
  .setTimestamp()
  .setThumbnail(icon)

  return embed
}

async function leaderboardEmbed(title, leaderboard, guild) {
  const icon = guild.iconURL({dynamic: true})
  let fields = []
  for (let i = 0; i < leaderboard.length; i++) {
    const member = leaderboard[i];
    logger.debug("Retrieving username for: " + JSON.stringify(member))
    const { data, error } = await supabase.from('Users').select("name").match({id: member.user_id}).single()
    logger.debug(JSON.stringify(data))
    const field = {name: String(i + 1), value: String(data.name)}
    logger.debug("Created leaderboard field: " + JSON.stringify(field))
    fields.push(
      field
    )
  }

  const embed = new MessageEmbed()
  .setColor('BLUE')
  .setTitle(title)
  .addFields(
    fields
  )
  .setTimestamp()
  .setThumbnail(icon)

  return embed
}

module.exports = {
  memberInfoEmbed: memberInfoEmbed,
  guildInfoEmbed: guildInfoEmbed,
  leaderboardEmbed: leaderboardEmbed
}
