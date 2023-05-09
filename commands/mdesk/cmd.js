const {
  ActionRowBuilder,
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require('discord.js')

const db = require('enhanced.db')
const userLogin = new db.Table('user')

module.exports = {
  data: new SlashCommandBuilder().setName('cmd').setDescription('Run command'),

  async execute (interaction) {
    const userid = interaction.member.id
    if (!userLogin.get(userid)) {
      return await interaction.reply('You are not logged in!')
    }

    const modal = new ModalBuilder()
      .setCustomId('commandInput')
      .setTitle('Run command')

    const commandInput = new TextInputBuilder()
      .setRequired(true)
      .setCustomId('command')
      .setPlaceholder('whoami')
      .setLabel('What command do you want to run?')
      .setStyle(TextInputStyle.Short)

    const firstActionRow = new ActionRowBuilder().addComponents(commandInput)
    modal.addComponents(firstActionRow)

    await interaction.showModal(modal)
  }
}
