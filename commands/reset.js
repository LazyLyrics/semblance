const { SlashCommandBuilder } = require('@discordjs/builders')
const { reset } = require('../utils/db')
const { isAdmin } = require('../utils/permissions')
const logger = require('../utils/logging')
const { guildInfoFormat, userInfoFormat } = require('../utils/misc')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Resets everybody\'s xp and level to 0, make sure you want to do this!'),
  async execute(interaction) {
    if (isAdmin(interaction.member)) {
      logger.debug(`${userInfoFormat(interaction.member)} in guild ${guildInfoFormat(interaction.guild)} has ADMINISTRATOR permissions, continuing with leaderboard reset.`)
      await interaction.reply("Authorised: You have Administrator Permissions.")
      try {
        await reset(interaction.guildId)
        logger.debug(`Leaderboard for ${guildInfoFormat(interaction.guild)} has been reset.`)
        await interaction.followUp('Leaderboard Cleared.')
      } catch (e) {
        logger.error(e)
        await interaction.reply(
          "There was an error resetting the database, please try again later."
        )
      }
    } else {
      logger.debug(`${userInfoFormat(interaction.member)} in guild ${guildInfoFormat(interaction.guild)} does not have ADMINISTRATOR permissions, aborting leaderboard reset.`)
      await interaction.reply("You do not have administrator permissions.")
    }
  }
}
