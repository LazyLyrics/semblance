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

async function leaderboardEmbeds(leaderboard, guild, type) {
  let embeds = [];

  for (let i = 0; i < leaderboard.length; i++) {
    let member = leaderboard[i]
    let xp;
    let messages;

    if (type == "monthly") {
      xp = `${member.monthly_xp}xp`
      messages = `${member.monthly_messages} messages`
    } else {
      xp = `${member.xp}xp`
      messages = `${member.messages} messages`
    }
    const { data, error } = await supabase.from('Users').select("name, avatar_url").match({id: member.user_id}).single()
    const embed = new MessageEmbed()
    .setColor('BLUE')
    .addField(`${String(i + 1)}. ${String(data.name)}`, `${xp} | ${messages}`)
    .setThumbnail(data.avatar_url)
    embeds.push(
      embed
    )
  }
  return embeds
}

module.exports = {
  memberInfoEmbed: memberInfoEmbed,
  guildInfoEmbed: guildInfoEmbed,
  leaderboardEmbeds: leaderboardEmbeds
}
