const { SlashCommandBuilder } = require('@discordjs/builders')
const { guildInfoEmbed } = require("../utils/responses")
const logger = require("../utils/logging")

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Get server information.'),
  async execute(interaction) {
    const guild = interaction.guild
    const id = guild.id
    const name = guild.name
    const members = guild.memberCount

    const response = await guildInfoEmbed(guild)
    logger.debug(`Created response embed - ${JSON.stringify(response)}`)
    await interaction.reply({
      embeds: [
        response
      ]
    })
  }
}
