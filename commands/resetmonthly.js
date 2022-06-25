const { SlashCommandBuilder } = require('@discordjs/builders')
const { reset_monthly } = require('../utils/db')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetmonthly')
    .setDescription('Resets everybody\s xp and stats for this month to 0, make sure you want to do this!'),
  async execute(interaction) {
    await reset_monthly(interaction.guildId)
    await interaction.reply('Leaderboard Cleared.')
  }
}
