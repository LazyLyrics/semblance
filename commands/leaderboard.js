const { SlashCommandBuilder } = require('@discordjs/builders')
const { leaderboardEmbeds } = require("../utils/responses")
const db = require("../utils/db.js")
const logger = require("../utils/logging")

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Get Server Leaderboard'),
  async execute(interaction) {
    const guild = interaction.guild
    const data = await db.getLeaderboard(guild.id)
    const responses = await leaderboardEmbeds(data, guild)
    await interaction.reply({
      embeds: responses
    })
  }
}
