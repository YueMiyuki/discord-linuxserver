// Docker command handler
const { Events } = require("discord.js");
const config = require("../config.json");

const Docker = require("dockerode");
const docker = new Docker({ socketPath: config.dockerSock });

const si = require("systeminformation");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    await interaction.deferReply({ message: "Please wait...", fetchReply: true });
    const dockerArray = await si.dockerAll();
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "containerSelection") return;

    const container = interaction.values[0];

    const dockerResult = dockerArray.find((element) =>
      element.id.startsWith(container)
    );

    console.log(dockerResult);

    await interaction.editReply("Yeah just work");
  },
};
