const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Get server information.'),
  async execute(interaction) {
    const guild = interaction.guild
    const id = guild.id
    const name = guild.name
    const members = guild.memberCount

    await interaction.reply({
      content: `Server Name: ${name} \nMember Count: ${members}`
    }
    )
  }
}
