const { SlashCommandBuilder } = require('@discordjs/builders')
const { leaderboardEmbed } = require("../utils/responses")
const db = require("../utils/db.js")
const logger = require("../utils/logging")

module.exports = {
  data: new SlashCommandBuilder()
    .setName('monthlyleaderboard')
    .setDescription('Get Server Leaderboard for this month.'),
  async execute(interaction) {
    const guild = interaction.guild
    const data = await db.getMonthlyLeaderboard(guild.id)
    logger.debug("Leaderboard data: " + JSON.stringify(data))
    const response = await leaderboardEmbed("Monthly Leaderboard", data, guild)
    logger.debug(`Created response embed - ${JSON.stringify(response)}`)
    await interaction.reply({
      embeds: [
        response
      ]
    })
  }
}
