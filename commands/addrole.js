const { SlashCommandBuilder } = require('@discordjs/builders')
const { isAdmin } = require('../utils/permissions')
const logger = require('../utils/logging')
const { guildInfoFormat, userInfoFormat, roleInfoFormat } = require('../utils/misc')
const { getRoleSpecs, updateRoleSpecs } = require('../utils/db')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addrole')
    .setDescription('Add a new role to be awarded at the indicated level.')
    .addIntegerOption(option =>
      option.setName('level')
      .setDescription('The level at which you\'d like to award a role.')
      .setRequired(true)
    )
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Which role would you like to award when the given level is achieved?')
        .setRequired(true)
    ),
  async execute(interaction) {
    let role_specs
    const role = interaction.options.getRole('role')
    const guild = interaction.guild
    const level = interaction.options.getInteger('level')
    if (isAdmin(interaction.member)) {
      logger.debug(`${userInfoFormat(interaction.member)} in guild ${guildInfoFormat(guild)} has ADMINISTRATOR permissions, continuing with role addition. ${roleInfoFormat(role)} at level ${level}`)
    } else {
      logger.debug(`${userInfoFormat(interaction.member)} in guild ${guildInfoFormat(interaction.guild)} does not have ADMINISTRATOR permissions, aborting role addition.`)
      await interaction.reply("You do not have administrator permissions.")
      return
    }
    let spec = {
      id: role.id,
      level: level
    }
    try {
      role_specs = await getRoleSpecs(guild.id)
      role_specs.push(spec)
    } catch (e) {
      logger.error(e.message)
      await interaction.reply("Error whilst retrieving roles. Please try again later.")
      return
    }
    try {
      await updateRoleSpecs(guild.id, role_specs)
    } catch (e) {
      logger.error(e.message)
      await interaction.reply("Error whilst updating roles. Please try again later.")
    }

    await interaction.reply("Success")
  }

}
