const { SlashCommandBuilder } = require('@discordjs/builders')
const { reset_monthly } = require('../utils/db')
const { isAdmin } = require('../utils/permissions')
const logger = require('../utils/logging')
const { guildInfoFormat, userInfoFormat } = require('../utils/misc')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetmonthly')
    .setDescription('Resets everybody\'s montly xp and messages to 0, make sure you want to do this!'),
  async execute(interaction) {
    if (isAdmin(interaction.member)) {
      logger.debug(`${userInfoFormat(interaction.member)} in guild ${guildInfoFormat(interaction.guild)} has ADMINISTRATOR permissions, continuing with monthly leaderboard reset.`)
      await interaction.reply("Authorised: You have Administrator Permissions.")
      await reset_monthly(interaction.guildId)
      logger.debug(`Monthly leaderboard for ${guildInfoFormat(interaction.guild)} has been reset.`)
      await interaction.followUp('Monthly leaderboard Cleared.')
    } else {
      logger.debug(`${userInfoFormat(interaction.member)} in guild ${guildInfoFormat(interaction.guild)} does not have ADMINISTRATOR permissions, aborting monthly leaderboard reset.`)
      await interaction.reply("You do not have Administrator Permissions.")
    }
  }
}
