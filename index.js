const fs = require("node:fs");
const { exec } = require("child_process");
const path = require("node:path");
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const { NodeSSH } = require("node-ssh");
const config = require("./config.json");

const ssh = new NodeSSH();
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

// Database
const db = require("enhanced.db");
const options = {
  clearOnStart: false,
};

db.options(options);
const userLogin = new db.Table("user");

// Load commands
for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

// Handle commands
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

// Once-a-lifetime events
client.once(Events.ClientReady, () => {
  console.log("Ready!");
});

client.login(config.token);

// Interaction command events

// mDesk Login command
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId !== "mdesklogin") return;

  const username = interaction.fields.getTextInputValue("username");
  const pwd = interaction.fields.getTextInputValue("pwd");

  // console.log({ username, pwd });

  await interaction.deferReply("Loging in to mDesk... Please wait...");

  try {
    const logon = await ssh.connect({
      host: config.address,
      username: username,
      port: 22,
      password: pwd,
      tryKeyboard: true,
    });
    // console.log(logon);
    // console.log(logon.connection._protocol._authenticated);
    if (logon.connection._protocol._authenticated) {
      logon.dispose();
      interaction.followUp({
        content: "Login success! Welcome back to mdesk!",
      });

      const userid = interaction.member.id;

      // Save user data to database

      userLogin.set(userid, true);
    }
  } catch (e) {
    if (e == "Error: All configured authentication methods failed") {
      await interaction.followUp({
        content: "Login failed. Please try again.",
      });
      return;
    } else {
      await interaction.followUp({
        content: "An error occur, please try again.",
      });
      console.log(e);
    }
  }
});

// Run command command
let command;
let confirmation;
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId !== "commandInput") return;

  command = interaction.fields.getTextInputValue("command");

  if (command.startsWith("sudo")) {
    command = command.replace("sudo", "");
  }

  // console.log(command);

  const commandEmbed = new EmbedBuilder()
    .setColor(0x0099ff)
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
    });

  const confirm = new ButtonBuilder()
    .setCustomId("CmdConfirm")
    .setLabel("Run command")
    .setStyle(ButtonStyle.Primary);

  const confirmRoot = new ButtonBuilder()
    .setCustomId("CmdConfirmRoot")
    .setLabel("Run as root")
    .setStyle(ButtonStyle.Danger);

  const cancel = new ButtonBuilder()
    .setCustomId("CmdCancel")
    .setLabel("Cancel")
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder().addComponents(
    confirm,
    confirmRoot,
    cancel
  );

  const CmdResponse = await interaction.reply({
    content: " ",
    embeds: [commandEmbed],
    components: [row],
    fetchReply: true,
  });

  const collectorFilter = (i) => i.user.id === interaction.user.id;

  try {
    confirmation = await CmdResponse.awaitMessageComponent({
      filter: collectorFilter,
      time: 60_000,
    });

    if (confirmation.customId === "CmdConfirm") {
      await confirmation.deferReply({
        content: `Running command: \`${command}\``,
        embeds: [],
        components: [],
      });

      command = "su " + `${config.botUser}` + " -c " + `'${command}'`;

      await exec(command, async (error, stdout, stderr) => {
        if (error) {
          await confirmation.followUp({
            content: `Command result:` + "```" + `${error.message}` + "```",
            embeds: [],
            components: [],
          });
        } else if (stderr) {
          await confirmation.followUp({
            content: `Command result:` + "```" + `${stderr}` + "```",
            embeds: [],
            components: [],
          });
        } else if (stdout) {
          await confirmation.followUp({
            content: `Command result:` + "```" + `${stdout}` + "```",
            embeds: [],
            components: [],
          });
        }
      });
    } else if (confirmation.customId === "CmdCancel") {
      await confirmation.update({
        content: "Action cancelled",
        components: [],
        embeds: [],
      });
    } else if (confirmation.customId === "CmdConfirmRoot") {
      const modal = new ModalBuilder()
        .setCustomId("cmdRootPwd")
        .setTitle("Verify your password");

      const cmdUsernameInput = new TextInputBuilder()
        .setRequired(true)
        .setCustomId("cmdUser")
        .setLabel("mDesk username:")
        .setPlaceholder("Username")
        .setStyle(TextInputStyle.Short);

      const cmdPwdInput = new TextInputBuilder()
        .setRequired(true)
        .setCustomId("cmdPwd")
        .setLabel("mDesk password:")
        .setPlaceholder("Password")
        .setStyle(TextInputStyle.Short);

      const firstActionRow = new ActionRowBuilder().addComponents(
        cmdUsernameInput
      );
      const secondActionRow = new ActionRowBuilder().addComponents(cmdPwdInput);
      modal.addComponents(firstActionRow, secondActionRow);

      await confirmation.showModal(modal);
    }
  } catch (e) {
    if (
      e ===
      "Error [InteractionCollectorError]: Collector received no interactions before ending with reason: time"
    ) {
      await CmdResponse.reply({
        content: "Response not received within 1 minute, cancelling",
        components: [],
      });
    } else {
      await CmdResponse.reply({ content: "An error occur, please try again." });
      console.log(e);
    }
  }
});

// Run command as root
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId === "cmdRootPwd") {
    const username = interaction.fields.getTextInputValue("cmdUser");
    const pwd = interaction.fields.getTextInputValue("cmdPwd");

    await interaction.deferReply();

    try {
      const logon = await ssh.connect({
        host: config.address,
        username: username,
        port: 22,
        password: pwd,
        tryKeyboard: true,
      });
      // console.log(logon);
      // console.log(logon.connection._protocol._authenticated);
      if (logon.connection._protocol._authenticated) {
        logon.dispose();
        await interaction.followUp({
          content: "Verification succeed! Running command as root...",
        });

        if (command.startsWith("sudo")) {
          command = command.replace("sudo", "");
        }

        command = "sudo " + `${command}`;

        await exec(command, async (error, stdout, stderr) => {
          if (error) {
            await confirmation.followUp({
              content:
                `Root command result:` + "```" + `${error.message}` + "```",
              embeds: [],
              components: [],
            });
          } else if (stderr) {
            await confirmation.followUp({
              content: `Root command result:` + "```" + `${stderr}` + "```",
              embeds: [],
              components: [],
            });
          } else if (stdout) {
            await confirmation.followUp({
              content: `Root command result:` + "```" + `${stdout}` + "```",
              embeds: [],
              components: [],
            });
          }
        });

        // console.log(command);
      }
    } catch (e) {
      if (e == "Error: All configured authentication methods failed") {
        await interaction.followUp({
          content: "Login failed. Please try again.",
        });
        return;
      } else {
        await interaction.followUp({
          content: "An error occur, please try again.",
        });
        console.log(e);
      }
    }
  }
});
