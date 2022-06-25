const { SlashCommandBuilder } = require('@discordjs/builders')
const { leaderboardEmbeds } = require("../utils/responses")
const db = require("../utils/db.js")
const logger = require("../utils/logging")

module.exports = {
  data: new SlashCommandBuilder()
    .setName('monthlyleaderboard')
    .setDescription('Get Server Leaderboard for this month.'),
  async execute(interaction) {
    const guild = interaction.guild
    const data = await db.getMonthlyLeaderboard(guild.id)
    const responses = await leaderboardEmbeds(data, guild, "monthly")
    await interaction.reply({
      embeds: responses
    })
  }
}
