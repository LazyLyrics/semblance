const { SlashCommandBuilder } = require('@discordjs/builders')
const { isAdmin } = require('../utils/permissions')
const logger = require('../utils/logging')
const { guildInfoFormat, userInfoFormat, roleInfoFormat } = require('../utils/misc')
const { getRoleSpecs, updateRoleSpecs, removeRole } = require('../utils/db')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removerolereward')
    .setDescription('Remove a role from the list of role rewards.')
    .addIntegerOption(option =>
      option.setName('level')
      .setDescription('The level the role is currently being awarded at.')
      .setRequired(true)
    )
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role you\'d like to remove.')
        .setRequired(true)
    ),
  async execute(interaction) {
    let role_specs
    const role = interaction.options.getRole('role')
    const guild = interaction.guild
    const level = interaction.options.getInteger('level')
    if (isAdmin(interaction.member)) {
      logger.debug(`${userInfoFormat(interaction.member)} in guild ${guildInfoFormat(guild)} has ADMINISTRATOR permissions, continuing with role removal. ${roleInfoFormat(role)} at level ${level}`)
    } else {
      logger.debug(`${userInfoFormat(interaction.member)} in guild ${guildInfoFormat(interaction.guild)} does not have ADMINISTRATOR permissions, aborting role removal.`)
      await interaction.reply("You do not have administrator permissions.")
      return
    }
    try {
      role_specs = await getRoleSpecs(guild.id)
    } catch (e) {
      logger.error(e.message)
      await interaction.reply("Error whilst retrieving roles. Please try again later.")
      return
    }
    try {
      role_specs = removeRole(role_specs, role.id, level)
      await updateRoleSpecs(guild.id, role_specs)
    } catch (e) {
      logger.error(e.message)
      await interaction.reply("Error whilst updating roles. Please try again later.")
    }

    await interaction.reply("Success")
  }

}
