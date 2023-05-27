const {
  Events,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");

const Docker = require("dockerode");

const si = require("systeminformation");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    const client = interaction.client;
    try {
      const config = interaction.client.config;
      const docker = new Docker({ socketPath: config.dockerSock });

      const dockerArray = await si.dockerAll();
      if (!interaction.isModalSubmit()) return;
      if (interaction.customId === "findContainerHashButton") {
        await interaction.deferReply("Please wait...");
        const container = interaction.fields.getTextInputValue(
          "findContainerHashInput"
        );

        const dockerResult = dockerArray.find((element) =>
          element.id.startsWith(container)
        );

        if (!dockerResult) {
          return await interaction.editReply("We can't find your container");
        }

        const originalContainerHash = dockerResult.id;
        const containerHash = originalContainerHash.substring(0, 12);
        const containerName = dockerResult.name;
        const containerImage = dockerResult.image;
        const containerCommand = dockerResult.command;
        const containerStatus = dockerResult.state;
        let newContainerStatus = containerStatus;

        if (newContainerStatus === "exited") {
          newContainerStatus = "stopped | exited";
        }

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
            {
              name: "Container status",
              value: `${newContainerStatus}`,
              inline: true,
            }
          )
          .setTimestamp()
          .setFooter({ text: "mDesk by mTech" });

        switch (containerStatus) {
          case "running": {
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
            const row = new ActionRowBuilder().addComponents(
              stop,
              restart,
              pause
            );
            reply = await interaction.editReply({
              embeds: [dockerStatuseEmbed],
              components: [row],
            });
            break;
          }

          case "exited":
          case "dead":
          case "created": {
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
          }
          case "paused": {
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
          }

          case "restarting": {
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
        }

        const collectorFilter = (i) => i.user.id === interaction.user.id;

        try {
          const confirmation = await reply.awaitMessageComponent({
            filter: collectorFilter,
            time: 60000,
          });
          const container = docker.getContainer(originalContainerHash);
          if (confirmation.customId === "runningStop") {
            confirmation.deferReply("Please wait...");
            try {
              await interaction.editReply({
                components: [],
              });
              await container.stop();
              await confirmation.editReply({
                content: "Container stopped successfully!",
                components: [],
                embeds: [],
              });
            } catch (e) {
              await interaction.editReply({
                content: "Something went wrong!" + "\n" + "Error: " + `${e}`,
                components: [],
                embeds: [],
              });
              client.log(e, "error");
            }
          } else if (confirmation.customId === "runningRestart") {
            confirmation.deferReply("Please wait...");
            try {
              await interaction.editReply({
                components: [],
              });
              await container.restart();
              await confirmation.editReply({
                content: "Container restarted successfully!",
                components: [],
                embeds: [],
              });
            } catch (e) {
              await interaction.editReply({
                content: "Something went wrong!" + "\n" + "Error: " + `${e}`,
                components: [],
                embeds: [],
              });
              client.log(e, "error");
            }
          } else if (confirmation.customId === "runningPause") {
            confirmation.deferReply("Please wait...");
            try {
              await interaction.editReply({
                components: [],
              });
              await container.pause();
              await confirmation.editReply({
                content: "Container paused successfully!",
                components: [],
                embeds: [],
              });
            } catch (e) {
              await interaction.editReply({
                content: "Something went wrong!" + "\n" + "Error: " + `${e}`,
                components: [],
                embeds: [],
              });
              client.log(e, "error");
            }
          } else if (confirmation.customId === "stopStart") {
            confirmation.deferReply("Please wait...");
            // For stopped containers
            try {
              await interaction.editReply({
                components: [],
              });
              await container.start();
              await confirmation.editReply({
                content: "Container started successfully!",
                components: [],
                embeds: [],
              });
            } catch (e) {
              await interaction.editReply({
                content: "Something went wrong!" + "\n" + "Error: " + `${e}`,
                components: [],
                embeds: [],
              });
              client.log(e, "error");
            }
          } else if (confirmation.customId === "pausedResume") {
            confirmation.deferReply("Please wait...");
            // For paused containers
            try {
              await interaction.editReply({
                components: [],
              });
              await container.unpause();
              await confirmation.editReply({
                content: "Container resumed successfully!",
                components: [],
                embeds: [],
              });
            } catch (e) {
              await interaction.editReply({
                content: "Something went wrong!" + "\n" + "Error: " + `${e}`,
                components: [],
                embeds: [],
              });
              client.log(e, "error");
            }
          } else if (confirmation.customId === "restartingStop") {
            confirmation.deferReply("Please wait...");
            // For some reason there are restarting containers
            try {
              await interaction.editReply({
                components: [],
              });
              await container.stop();
              await confirmation.editReply({
                content: "Container stopped successfully!",
                components: [],
                embeds: [],
              });
            } catch (e) {
              await interaction.editReply({
                content: "Something went wrong!" + "\n" + "Error: " + `${e}`,
                components: [],
                embeds: [],
              });
              client.log(e, "error");
            }
          } else if (confirmation.customId === "restartingRestart") {
            confirmation.deferReply("Please wait...");
            try {
              await interaction.editReply({
                components: [],
              });
              await container.restart();
              await confirmation.editReply({
                content: "Container restarting successfully!",
                components: [],
                embeds: [],
              });
            } catch (e) {
              await interaction.editReply({
                content: "Something went wrong!" + "\n" + "Error: " + `${e}`,
                components: [],
                embeds: [],
              });
              cilent.log(e, "error");
            }
          }
        } catch (e) {
          if (
            e ===
            "Error [InteractionCollectorError]: Collector received no interactions before ending with reason: time"
          ) {
            await interaction.editReply({
              content: "Button timeout, removing...",
              components: [],
            });
          } else {
            interaction.editReply({
              content: "Something went wrong!",
              components: [],
              embeds: [],
            });
            client.log(e, "error");
          }
        }
      }
    } catch (e) {
      client.log(e, "error");
      await interaction.editReply({
        content: "An error occur!",
        embeds: [],
        components: [],
        fetchReply: true,
      });
    }
  },
};
