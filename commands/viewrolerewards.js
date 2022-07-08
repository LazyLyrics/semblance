const { SlashCommandBuilder } = require('@discordjs/builders')
const { isAdmin } = require('../utils/permissions')
const logger = require('../utils/logging')
const { guildInfoFormat, userInfoFormat, roleInfoFormat } = require('../utils/misc')
const { getRoleSpecs } = require('../utils/db')
const { roleRewardsEmbed } = require('../utils/responses')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('viewrolerewards')
    .setDescription('View the current role rewards.'),
  async execute(interaction) {
    let roleSpecs
    const guild = interaction.guild
    if (isAdmin(interaction.member)) {
      logger.debug(`${userInfoFormat(interaction.member)} in guild ${guildInfoFormat(guild)} has ADMINISTRATOR permissions, continuing.`)
    } else {
      logger.debug(`${userInfoFormat(interaction.member)} in guild ${guildInfoFormat(interaction.guild)} does not have ADMINISTRATOR permissions, aborting.`)
      return
    }
    try {
      roleSpecs = await getRoleSpecs(guild.id)
    } catch (e) {
      logger.error(e.message)
      await interaction.reply("Error whilst retrieving roles. Please try again later.")
      return
    }
    try {
      const response = await roleRewardsEmbed(roleSpecs, interaction.guild)
      await interaction.reply(
        {
          embeds: [response]
        }
      )
    } catch (e) {
      logger.error(e.message)
      await interaction.reply("Error creating response. Please contact the development team.")
    }
  }

}
