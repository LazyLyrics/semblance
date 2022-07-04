const { SlashCommandBuilder } = require('@discordjs/builders')
const { isAdmin } = require('../utils/permissions')
const logger = require('../utils/logging')
const { guildInfoFormat, userInfoFormat, roleInfoFormat } = require('../utils/misc')
const { supabase } = require('../utils/db')

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
    if (isAdmin(interaction.member)) {
      const guild = interaction.guild
      const level = interaction.options.getInteger('level')
      const role = interaction.options.getRole('role')
      logger.debug(`${userInfoFormat(interaction.member)} in guild ${guildInfoFormat(interaction.guild)} has ADMINISTRATOR permissions, continuing with role addition. ${roleInfoFormat(role)} at level ${level}`)
      const { data, error } = await supabase.from('Guilds').select('role_specs').match({id: guild.id}).maybeSingle()
      let role_specs = data.role_specs
      let spec = {
        id: role.id,
        level: level
      }
      role_specs.push(spec)
      const { data: update_data, error: update_error } = await supabase
      .from('Guilds')
      .update({
        role_specs: role_specs
      })
      .match({id: guild.id})
      await interaction.reply("Success")
    } else {
      logger.debug(`${userInfoFormat(interaction.member)} in guild ${guildInfoFormat(interaction.guild)} does not have ADMINISTRATOR permissions, aborting role addition.`)
      await interaction.reply("You do not have administrator permissions.")
    }
  }
}
