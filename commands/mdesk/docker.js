const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js')

const Docker = require('dockerode')

const db = require('enhanced.db')
const userLogin = new db.Table('user')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('docker')
    .setDescription('Docker management'),
  category: 'mdesk',
  async execute (interaction) {
    const client = interaction.client
    try {
      const config = client.config
      const docker = new Docker({ socketPath: config.dockerSock })

      const userid = await interaction.member.id
      if (!userLogin.get(userid)) {
        return await interaction.reply('You are not logged in!')
      }

      await interaction.reply('Please wait...')
      const containerList = []
      docker.listContainers({ all: true }, async function (err, containers) {
        if (err) {
          client.log(err, 'error')
          await interaction.editReply('An error occured!')
        } else {
          containers.map(async function (containerInfo) {
            let containers =
              'Hash: ' +
              containerInfo.Id.substring(0, 12) +
              ' Name: ' +
              containerInfo.Names
            containers = containers.replace('/', '')
            containerList.push(containers)
          })

          let options = containerList.map((item) => {
            const [hash, name] = item.split(' Name: ')
            const hashValue = hash.replace('Hash: ', '')
            const nameValue = name.trim()
            const optionData = {
              emoji: undefined,
              label: nameValue,
              description: hashValue,
              value: hashValue
            }
            return optionData
          })

          options = options.slice(0, 23)

          const select = new StringSelectMenuBuilder()
            .setCustomId('containerSelection')
            .setPlaceholder('Select container')
            .addOptions(options)

          const dockerEmbed = new EmbedBuilder()
            .setColor('Random')
            .setTitle('Docker')
            .setDescription('Select a conainer below')
            .setTimestamp()
            .setFooter({
              text: 'mDesk by mTech'
            })

          const cantFindContainer = new ButtonBuilder()
            .setCustomId('cantFindContainerButton')
            .setLabel("Can't find your container?")
            .setStyle(ButtonStyle.Success)

          const row = new ActionRowBuilder().addComponents(select)
          const buttonRow = new ActionRowBuilder().addComponents(
            cantFindContainer
          )

          await interaction.editReply({
            content: '',
            embeds: [dockerEmbed],
            components: [row, buttonRow],
            fetchReply: true
          })
        }
      })
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
