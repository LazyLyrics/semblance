const { SlashCommandBuilder } = require('@discordjs/builders')
const { getMember } = require('../utils/db.js')
const logger = require('../utils/logging.js')
const { memberInfoEmbed } = require('../utils/responses.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get user information.'),
  async execute(interaction) {
    const discord_user = interaction.user
    const guild = interaction.guild
    logger.debug(`Command interaction from ${discord_user.username} in guild ${guild.name}`)
    const member = await getMember(discord_user.id, guild.id)
    const response = await memberInfoEmbed(discord_user, member)
    logger.debug(`Created response embed - ${JSON.stringify(response)}`)
    await interaction.reply({
      embeds: [
        response
      ]
    })
  }
}
