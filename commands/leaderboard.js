const { SlashCommandBuilder } = require('@discordjs/builders')
const { leaderboardEmbed } = require("../utils/responses")
const db = require("../utils/db.js")
const logger = require("../utils/logging")

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Get Server Leaderboard'),
  async execute(interaction) {
    const guild = interaction.guild
    const data = await db.getLeaderboard(guild.id)
    logger.debug("Leaderboard data: " + JSON.stringify(data))
    const response = await leaderboardEmbed("Leaderboard", data, guild)
    logger.debug(`Created response embed - ${JSON.stringify(response)}`)
    await interaction.reply({
      embeds: [
        response
      ]
    })
  }
}
