// Docker command handler
const { Events, EmbedBuilder } = require("discord.js");
const config = require("../config.json");

const Docker = require("dockerode");
const docker = new Docker({ socketPath: config.dockerSock });

const si = require("systeminformation");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    const dockerArray = await si.dockerAll();
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "containerSelection") return;

    await interaction.deferReply({
      message: "Please wait...",
      fetchReply: true,
    });
    const container = interaction.values[0];

    const dockerResult = dockerArray.find((element) =>
      element.id.startsWith(container)
    );

    const containerHash = dockerResult.id.substring(0, 12);
    const containerName = dockerResult.name;
    const containerImage = dockerResult.image;
    const containerCommand = dockerResult.command;
    const containerStatus = dockerResult.status;

    const dockerStatuseEmbed = new EmbedBuilder()
      .setColor("RANDOM")
      .setTitle("Docker container status")
      .setDescription(
        `Container Name: ${containerName}` +
          "\n" +
          `Container Hash: ${containerHash}`
      )
      .addFields(
        { name: "Container image", value: containerImage, inline: true },
        { name: "Container command", value: containerCommand, inline: true },
        { name: "\u200B", value: "\u200B" },
        { name: "Container status", value: containerStatus, inline: true }
      );

    console.log(dockerResult);
    console.log(Object.keys(dockerResult.ports));

    await interaction.editReply({
      message: "Yeah just work",
      embeds: [dockerStatuseEmbed],
    });
  },
};
