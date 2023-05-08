// Docker command handler
const {
  Events,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
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
    const containerStatus = dockerResult.state;

    const dockerStatuseEmbed = new EmbedBuilder()
      .setColor("Random")
      .setTitle("Docker container status")
      .setDescription(
        `Container Name: ${containerName}` +
          "\n" +
          `Container Hash: ${containerHash}`
      )
      .addFields(
        { name: "Container image", value: `${containerImage}` + "⠀⠀⠀" },
        {
          name: "Container command",
          value: `${containerCommand}`,
        },
        { name: "Container status", value: `${containerStatus}`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: "mDesk by mTech" });

    switch (containerStatus) {
      case "running":
      case "restarting":
        // Stop button
        console.log("stopped");
        const stop = new ButtonBuilder()
          .setCustomId("stop")
          .setLabel("Stop")
          .setStyle(ButtonStyle.Danger);
        const restart = new ButtonBuilder()
          .setCustomId("restart")
          .setLabel("Restart")
          .setStyle(ButtonStyle.Primary);
        const pause = new ButtonBuilder()
          .setCustomId("pause")
          .setLabel("Pause")
          .setStyle(ButtonStyle.Primary);
        const row = new ActionRowBuilder().addComponents(stop, restart, pause);
        await interaction.editReply({
          embeds: [dockerStatuseEmbed],
          components: [row],
        });
        break;

      case "exited":
      case "dead":
      case "created":
        console.log("edc");
        // Start button
        const start = new ButtonBuilder()
          .setCustomId("start")
          .setLabel("Start")
          .setStyle(ButtonStyle.Success);
        const edcRow = new ActionRowBuilder().addComponents(start);
        await interaction.editReply({
          embeds: [dockerStatuseEmbed],
          components: [edcRow],
        });
        break;

      case "paused":
        // Resume button
        console.log("p");
        const pausedResume = new ButtonBuilder()
          .setCustomId("resume")
          .setLabel("Resume")
          .setStyle(ButtonStyle.Success);
        const pRow = new ActionRowBuilder().addComponents(pausedResume);
        await interaction.editReply({
          embeds: [dockerStatuseEmbed],
          components: [pRow],
        });
        break;

      case "restarting":
        const restartingStop = new ButtonBuilder()
          .setCustomId("stop")
          .setLabel("Stop")
          .setStyle(ButtonStyle.Danger);
        const restartingRestart = new ButtonBuilder()
          .setCustomId("restart")
          .setLabel("Restart")
          .setStyle(ButtonStyle.Primary);
        const rRow = new ActionRowBuilder().addComponents(
          restartingStop,
          restartingRestart
        );
        await interaction.editReply({
          embeds: [dockerStatuseEmbed],
          components: [rRow],
        });
        break;
    }
  },
};
