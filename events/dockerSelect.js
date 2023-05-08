// Docker command handler
const { Events } = require("discord.js");
const config = require("../config.json");

const Docker = require("dockerode");
const docker = new Docker({ socketPath: config.dockerSock });

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "containerSelection") return;

    const container = interaction.values[0];
    const selectedContainer = docker.getContainer(container);
    


  },
};
