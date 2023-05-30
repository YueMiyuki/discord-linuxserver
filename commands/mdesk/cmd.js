const {
  ActionRowBuilder,
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("cmd").setDescription("Run command"),
  category: "mdesk",

  async execute(interaction) {
    const client = interaction.client;
    try {
      const userid = await interaction.member.id;

      const auth = await client.dbAuth(userid);
      if (!auth) {
        await interaction.reply("You are not authorized to use this command!");
        return;
      }

      const modal = new ModalBuilder()
        .setCustomId("commandInput")
        .setTitle("Run command");

      const commandInput = new TextInputBuilder()
        .setRequired(true)
        .setCustomId("command")
        .setPlaceholder("whoami")
        .setLabel("What command do you want to run?")
        .setStyle(TextInputStyle.Short);

      const firstActionRow = new ActionRowBuilder().addComponents(commandInput);
      modal.addComponents(firstActionRow);

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
