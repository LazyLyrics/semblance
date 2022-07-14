const Canvas = require("canvas")
const { MessageAttachment } = require('discord.js');
const logger = require("./logging");
const { getAverageColor } = require('fast-average-color-node')
const { getXPInfo } = require('./levelling')

// async function memberInfoEmbed(discord_user, member) {
//   const thumbnail = discord_user.avatarURL({dynamic: true})
//   const compliment = await getCompliment()
//   const embed = new MessageEmbed()
//   .setColor('BLUE')
//   .setThumbnail(thumbnail)
//   .setTitle(discord_user.username)
//   .setDescription(String(compliment))
//   .addFields(
//     { name: 'Level', value: String(member.level)},
//     { name: 'Total Messages', value: String(member.messages)},
//     { name: 'Messages this month', value: String(member.monthly_messages)},
//     { name: 'XP', value: String(member.xp)},
//     { name: 'XP this month', value: String(member.monthly_xp)}
//   )
//   .setTimestamp()

//   return embed
// }

async function memberInfoCanvas(discordUser, member) {
  const canvas = Canvas.createCanvas(800, 200);
  const context = canvas.getContext('2d');
  const avatarURL = await discordUser.avatarURL({format: "png", size: 256, forceStatic: true})
  const avatar = await Canvas.loadImage(avatarURL);
  // Draw Rectangle
  context.fillStyle = '#121212'
  context.fillRect(0, 0, canvas.width, canvas.height)


  // Draw accent path
  const averageColour = await getAverageColor(avatarURL)
  const averageColourHex = averageColour.hex
  context.fillStyle = averageColourHex
  context.beginPath()
  context.moveTo(650, 0)
  context.lineTo(750, canvas.height)
  context.lineTo(canvas.width, canvas.height)
  context.lineTo(canvas.width, 0)
  context.closePath()
  context.fill()

  // Add Avatar
  context.drawImage(avatar, 0, 0, canvas.height, canvas.height)

  // Add Avatar Border
  context.fillRect(canvas.height, 0, 10, canvas.height)

  // Add username
  const titleSize = 32
  context.font = `${titleSize}px Sans-serif`
  context.fillStyle = '#ffffff'
  context.fillText(discordUser.tag, (titleSize / 2) + canvas.height + 10, (titleSize / 2) + titleSize)

  // Add other details
  bodySize = 24
  context.font = `${bodySize}px sans-serif`
  context.fillText(`Level ${member.level}`, canvas.height + (titleSize / 2) + 10, (titleSize * 3 ))

  // Draw xp bar

  const xpInfo = getXPInfo(member.xp)
  context.fillRect(canvas.height + (titleSize / 2) + 10, canvas.height - 40, 400, 20)
  context.fillStyle = averageColourHex
  context.fillRect(canvas.height + (titleSize / 2) + 10, canvas.height - 40, 400*xpInfo.percentageUntilNext, 20)

  const attachment = new MessageAttachment(canvas.toBuffer('image/png'), 'userInfo.png')
  return attachment
}

module.exports = {
  memberInfoCanvas: memberInfoCanvas
}
