const { SlashCommandBuilder } = require('@discordjs/builders')
const { reset } = require('../utils/db')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Resets everybody\s xp and level to 0, make sure you want to do this!'),
  async execute(interaction) {
    await reset(interaction.guildId)
    await interaction.reply('Leaderboard Cleared.')
  }
}
