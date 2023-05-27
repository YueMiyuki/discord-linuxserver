const {
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js")

const { exec } = require("child_process")

const { NodeSSH } = require("node-ssh")
const ssh = new NodeSSH()

let command
let confirmation

module.exports = {
  name: Events.InteractionCreate,
  async execute (interaction) {
    const client = interaction.client
    try {
      const config = client.config
      if (!interaction.isModalSubmit()) return
      if (interaction.customId === "commandInput") {
        command = await interaction.fields.getTextInputValue("command")

        if (command.startsWith("sudo")) {
          command = command.replace("sudo", "")
        }

        const commandEmbed = new EmbedBuilder()
          .setColor("Random")
          .setTitle("Run command")
          .setDescription(" ")
          .addFields(
            {
              name: "You are running this command:",
              value: `\`${command}\``,
            },
            { name: "\u200B", value: " " },
            {
              name: "Are you sure?",
              value: " ",
              inline: true,
            }
          )
          .setTimestamp()
          .setFooter({
            text: "mDesk by mTech",
          })

        const confirm = new ButtonBuilder()
          .setCustomId("CmdConfirm")
          .setLabel("Run command")
          .setStyle(ButtonStyle.Primary)

        const confirmRoot = new ButtonBuilder()
          .setCustomId("CmdConfirmRoot")
          .setLabel("Run as root")
          .setStyle(ButtonStyle.Danger)

        const cancel = new ButtonBuilder()
          .setCustomId("CmdCancel")
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Secondary)

        const row = new ActionRowBuilder().addComponents(
          confirm,
          confirmRoot,
          cancel
        )

        const CmdResponse = await interaction.reply({
          content: " ",
          embeds: [commandEmbed],
          components: [row],
          fetchReply: true,
        })

        const collectorFilter = (i) => i.user.id === interaction.user.id

        try {
          confirmation = await CmdResponse.awaitMessageComponent({
            filter: collectorFilter,
            time: 60_000,
          })

          if (confirmation.customId === "CmdConfirm") {
            await confirmation.deferReply({
              content: `Running command: \`${command}\``,
              embeds: [],
              components: [],
            })
            const nonSudoCommand =
              "su " + `${config.botUser}` + " -c " + `'${command}'`
            await exec(nonSudoCommand, async (error, stdout, stderr) => {
              if (error) {
                await confirmation.followUp({
                  content:
                    "Command result:" + "```" + `${error.message}` + "```",
                  embeds: [],
                  components: [],
                })
              } else if (stderr) {
                await confirmation.followUp({
                  content: "Command result:" + "```" + `${stderr}` + "```",
                  embeds: [],
                  components: [],
                })
              } else if (stdout) {
                await confirmation.followUp({
                  content: "Command result:" + "```" + `${stdout}` + "```",
                  embeds: [],
                  components: [],
                })
              }
            })
          } else if (confirmation.customId === "CmdCancel") {
            await confirmation.update({
              content: "Action cancelled",
              components: [],
              embeds: [],
            })
          } else if (confirmation.customId === "CmdConfirmRoot") {
            const modal = new ModalBuilder()
              .setCustomId("cmdRootPwd")
              .setTitle("Verify your password")

            const cmdUsernameInput = new TextInputBuilder()
              .setRequired(true)
              .setCustomId("cmdUser")
              .setLabel("mDesk username:")
              .setPlaceholder("Username")
              .setStyle(TextInputStyle.Short)

            const cmdPwdInput = new TextInputBuilder()
              .setRequired(true)
              .setCustomId("cmdPwd")
              .setLabel("mDesk password:")
              .setPlaceholder("Password")
              .setStyle(TextInputStyle.Short)

            const firstActionRow = new ActionRowBuilder().addComponents(
              cmdUsernameInput
            )
            const secondActionRow = new ActionRowBuilder().addComponents(
              cmdPwdInput
            )
            modal.addComponents(firstActionRow, secondActionRow)

            await confirmation.showModal(modal)
          }
        } catch (e) {
          if (
            e ===
            "Error [InteractionCollectorError]: Collector received no interactions before ending with reason: time"
          ) {
            await CmdResponse.reply({
              content: "Response not received within 1 minute, cancelling",
              components: [],
            })
          } else {
            await CmdResponse.reply({
              content: "An error occur, please try again.",
            })
            client.log(e, "error")
          }
        }
      } else if (interaction.customId === "cmdRootPwd") {
        const username = await interaction.fields.getTextInputValue("cmdUser")
        const pwd = await interaction.fields.getTextInputValue("cmdPwd")

        await interaction.deferReply()

        try {
          const logon = await ssh.connect({
            host: config.address,
            username,
            port: 22,
            password: pwd,
            tryKeyboard: true,
          })

          if (logon.connection._protocol._authenticated) {
            logon.dispose()
            await interaction.followUp({
              content: "Verification succeed! Running command as root...",
            })

            if (command.startsWith("sudo")) {
              command = command.replace("sudo", "")
            }

            command = "sudo " + `${command}`

            await exec(command, async (error, stdout, stderr) => {
              if (error) {
                await confirmation.followUp({
                  content:
                    "Root command result:" + "```" + `${error.message}` + "```",
                  embeds: [],
                  components: [],
                })
              } else if (stderr) {
                await confirmation.followUp({
                  content: "Root command result:" + "```" + `${stderr}` + "```",
                  embeds: [],
                  components: [],
                })
              } else if (stdout) {
                await confirmation.followUp({
                  content: "Root command result:" + "```" + `${stdout}` + "```",
                  embeds: [],
                  components: [],
                })
              }
            })
          }
        } catch (e) {
          if (e === "Error: All configured authentication methods failed") {
            await interaction.followUp({
              content: "Login failed. Please try again.",
            })
          } else {
            await interaction.followUp({
              content: "An error occur, please try again.",
            })
            client.log(e, "error")
          }
        }
      }
    } catch (e) {
      client.log(e, "error")
      await interaction.editReply({
        content: "An error occur!",
        embeds: [],
        components: [],
        fetchReply: true,
      })
    }
  },
}
