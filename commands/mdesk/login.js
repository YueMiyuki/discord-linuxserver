const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  SlashCommandBuilder,
} = require("discord.js");

const db = require("enhanced.db");
const userLogin = new db.Table("user");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("login")
    .setDescription("Login to mDesk"),
  category: "mdesk",

  async execute(interaction) {
    const client = interaction.client;
    try {
      const userid = await interaction.member.id;

      if (userLogin.get(userid)) {
        return await interaction.reply("You are already logged in!");
      }

      const modal = new ModalBuilder()
        .setCustomId("mdesklogin")
        .setTitle("Login to mDesk");

      const usernameInput = new TextInputBuilder()
        .setRequired(true)
        .setCustomId("username")
        .setLabel("mDesk login username:")
        .setPlaceholder("Username")
        .setStyle(TextInputStyle.Short);

      const pwdInput = new TextInputBuilder()
        .setRequired(true)
        .setCustomId("pwd")
        .setLabel("mDesk login password:")
        .setPlaceholder("Password")
        .setStyle(TextInputStyle.Short);

      const firstActionRow = new ActionRowBuilder().addComponents(
        usernameInput
      );
      const secondActionRow = new ActionRowBuilder().addComponents(pwdInput);

      modal.addComponents(firstActionRow, secondActionRow);

      await interaction.showModal(modal);
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
