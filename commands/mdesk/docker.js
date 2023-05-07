const { SlashCommandBuilder } = require('discord.js')
const config = require('../../config.json')

const Docker = require('dockerode');
const docker = new Docker({socketPath: config.dockerSock});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('docker')
    .setDescription('Docker management'),
  async execute (interaction) {

  }
}
