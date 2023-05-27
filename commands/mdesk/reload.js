const { SlashCommandBuilder } = require('discord.js')

const db = require('enhanced.db')
const userLogin = new db.Table('user')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reloads a command.')
    .addStringOption((option) =>
      option
        .setName('command')
        .setDescription('The command to reload.')
        .setRequired(true)
    ),
  category: 'mdesk',
  async execute (interaction) {
    const client = interaction.client
    try {
      const userid = await interaction.member.id
      if (!userLogin.get(userid)) {
        return await interaction.reply('You are not logged in!')
      }

      const commandName = await interaction.options
        .getString('command', true)
        .toLowerCase()
      const command = await interaction.client.commands.get(commandName)

      if (!command) {
        return await interaction.reply(
          `There is no command with name \`${commandName}\`!`
        )
      }

      delete require.cache[
        require.resolve(`../${command.category}/${command.data.name}.js`)
      ]

      try {
        await interaction.client.commands.delete(command.data.name)
        const newCommand = require(`../${command.category}/${command.data.name}.js`)
        await interaction.client.commands.set(newCommand.data.name, newCommand)
        await interaction.reply(
          `Command \`${newCommand.data.name}\` was reloaded!`
        )
      } catch (error) {
        console.error(error)
        await interaction.reply(
          `There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``
        )
      }
    } catch (e) {
      client.log(e, 'error')
      await interaction.editReply({
        content: 'An error occur!',
        embeds: [],
        components: [],
        fetchReply: true
      })
    }
  }
}
