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

    const originalContainerHash = dockerResult.id;
    const containerHash = originalContainerHash.substring(0, 12);
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
      const container = docker.getContainer(originalContainerHash);
      if (confirmation.customId === "runningStop") {
        try {
          await container.stop();
          await confirmation.reply("Container stopped successfully!");
        } catch (e) {
          await confirmation.reply(
            "Failed to stop container!" + "\n" + "Error: " + `${e}`
          );
          console.log(e);
        }
      } else if (confirmation.customId === "runningRestart") {
        try {
          await container.restart();
          await confirmation.reply("Container restarted successfully!");
        } catch (e) {
          await confirmation.reply(
            "Failed to restart container!" + "\n" + "Error: " + `${e}`
          );
          console.log(e);
        }
      } else if (confirmation.customId === "runningPause") {
        try {
          await container.pause();
          await confirmation.reply("Container paused successfully!");
        } catch (e) {
          await confirmation.reply(
            "Failed to pause container!" + "\n" + "Error: " + `${e}`
          );
          console.log(e);
        }
      }
      // For stopped containers
      else if (confirmation.customId === "stopStart") {
        try {
          await container.start();
          await confirmation.reply("Container started successfully!");
        } catch (e) {
          await confirmation.reply(
            "Failed to start container!" + "\n" + "Error: " + `${e}`
          );
          console.log(e);
        }
      }
      // For paused containers
      else if (confirmation.customId === "pausedResume") {
        try {
          await container.unpause();
          await confirmation.reply("Container resumed successfully!");
        } catch (e) {
          await confirmation.reply(
            "Failed to resume container!" + "\n" + "Error: " + `${e}`
          );
          console.log(e);
        }
      }
      // For some reason there are restarting containers
      else if (confirmation.customId === "restartingStop") {
        try {
          await container.stop();
          await confirmation.reply("Container stopped successfully!");
        } catch (e) {
          await confirmation.reply(
            "Failed to stop container!" + "\n" + "Error: " + `${e}`
          );
          console.log(e);
        }
      } else if (confirmation.customId === "restartingRestart") {
        try {
          await container.restart();
          await confirmation.reply("Container restarted successfully!");
        } catch (e) {
          await confirmation.reply(
            "Failed to restart container!" + "\n" + "Error: " + `${e}`
          );
          console.log(e);
        }
      }
    } catch (e) {
      console.log(e);
      await confirmation.editReply({
        content: "Button timeout, removing...",
        components: [],
      });
    }
  },
};
