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

    let reply;
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
        const stop = new ButtonBuilder()
          .setCustomId("runningStop")
          .setLabel("Stop")
          .setStyle(ButtonStyle.Danger);
        const restart = new ButtonBuilder()
          .setCustomId("runningRestart")
          .setLabel("Restart")
          .setStyle(ButtonStyle.Primary);
        const pause = new ButtonBuilder()
          .setCustomId("runningPause")
          .setLabel("Pause")
          .setStyle(ButtonStyle.Primary);
        const row = new ActionRowBuilder().addComponents(stop, restart, pause);
        reply = await interaction.editReply({
          embeds: [dockerStatuseEmbed],
          components: [row],
        });
        break;

      case "exited":
      case "dead":
      case "created":
        const start = new ButtonBuilder()
          .setCustomId("stopStart")
          .setLabel("Start")
          .setStyle(ButtonStyle.Success);
        const edcRow = new ActionRowBuilder().addComponents(start);
        reply = await interaction.editReply({
          embeds: [dockerStatuseEmbed],
          components: [edcRow],
        });
        break;

      case "paused":
        const pausedResume = new ButtonBuilder()
          .setCustomId("pausedResume")
          .setLabel("Resume")
          .setStyle(ButtonStyle.Success);
        const pRow = new ActionRowBuilder().addComponents(pausedResume);
        reply = await interaction.editReply({
          embeds: [dockerStatuseEmbed],
          components: [pRow],
        });
        break;

      case "restarting":
        const restartingStop = new ButtonBuilder()
          .setCustomId("restartingStop")
          .setLabel("Stop")
          .setStyle(ButtonStyle.Danger);
        const restartingRestart = new ButtonBuilder()
          .setCustomId("restartingRestart")
          .setLabel("Restart")
          .setStyle(ButtonStyle.Primary);
        const rRow = new ActionRowBuilder().addComponents(
          restartingStop,
          restartingRestart
        );
        reply = await interaction.editReply({
          embeds: [dockerStatuseEmbed],
          components: [rRow],
        });
        break;
    }

    const collectorFilter = (i) => i.user.id === interaction.user.id;

    try {
      const confirmation = await reply.awaitMessageComponent({
        filter: collectorFilter,
        time: 60000,
      });
      const container = docker.getContainer(containerHash);
      if (confirmation.customId === "runningStop") {
        const res = container.stop()
        console.log(res)
      } else if (confirmation.customId === "runningRestart") {
      } else if (confirmation.customId === "runningPause") {
      }
      // For stopped containers
      else if (confirmation.customId === "stopStart") {
      }
      // For paused containers
      else if (confirmation.customId === "pausedResume") {
      }
      // For some reason there are restarting containers
      else if (confirmation.customId === "restartingStop") {
      } else if (confirmation.customId === "restartingRestart") {
      }
    } catch (e) {
      await interaction.editReply({
        content: "Button timeout, removing...",
        components: [],
      });
    }
  },
};
