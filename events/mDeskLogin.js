// mDesk Login command handler
const { Events } = require("discord.js");

// Database
const db = require("enhanced.db");
const options = {
  clearOnStart: false,
};

db.options(options);
const userLogin = new db.Table("user");

const { NodeSSH } = require("node-ssh");
const ssh = new NodeSSH();

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    const client = interaction.client;
    try {
      const config = interaction.client.config;

      if (!interaction.isModalSubmit()) return;
      if (interaction.customId !== "mdesklogin") return;

      const username = await interaction.fields.getTextInputValue("username");
      const pwd = await interaction.fields.getTextInputValue("pwd");

      await interaction.deferReply("Loging in to mDesk... Please wait...");

      try {
        const logon = await ssh.connect({
          host: config.address,
          username,
          port: 22,
          password: pwd,
          tryKeyboard: true,
        });

        if (logon.connection._protocol._authenticated) {
          logon.dispose();
          await interaction.followUp({
            content: "Login success! Welcome back to mdesk!",
          });

          const userid = interaction.member.id;
          userLogin.set(userid, true);
        }
      } catch (e) {
        if (e === "Error: All configured authentication methods failed") {
          await interaction.followUp({
            content: "Login failed. Please try again.",
          });
        } else {
          await interaction.followUp({
            content: "An error occur, please try again.",
          });
          client.log(e, "error");
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
