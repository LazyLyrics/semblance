const { SlashCommandBuilder } = require('@discordjs/builders')
const { getMember } = require('../utils/db.js')
const logger = require('../utils/logging.js')
const { memberInfoEmbed } = require('../utils/responses.js')
const { memberInfoCanvas } = require('../utils/canvas')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get user information.'),
  async execute(interaction) {
    const discordUser = interaction.user
    const guild = interaction.guild
    try {
      const member = await getMember(discordUser.id, guild.id)
      // const response = await memberInfoEmbed(discordUser, member)
      const attachment = await memberInfoCanvas(discordUser, member)
      logger.debug(JSON.stringify(attachment))
      await interaction.reply({
        // embeds: [
        //   response
        // ],
        files: [
          attachment
        ]
      })
    } catch (e) {
      logger.error(e.message)
      await interaction.reply(
        "Could not find user in database."
      )
    }
  }
}
