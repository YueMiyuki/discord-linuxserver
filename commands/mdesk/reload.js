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
  async execute (interaction) {
    const userid = interaction.member.id
    if (!userLogin.get(userid)) {
      return interaction.reply('You are not logged in!')
    }

    const commandName = interaction.options
      .getString('command', true)
      .toLowerCase()
    const command = interaction.client.commands.get(commandName)

    if (!command) {
      return interaction.reply(
        `There is no command with name \`${commandName}\`!`
      )
    }

    delete require.cache[
      require.resolve(`../${command.category}/${command.data.name}.js`)
    ]

    try {
      interaction.client.commands.delete(command.data.name)
      const newCommand = require(`../${command.category}/${command.data.name}.js`)
      interaction.client.commands.set(newCommand.data.name, newCommand)
      await interaction.reply(
        `Command \`${newCommand.data.name}\` was reloaded!`
      )
    } catch (error) {
      console.error(error)
      await interaction.reply(
        `There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``
      )
    }
  }
}
