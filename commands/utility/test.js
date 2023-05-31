const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("A test command so that I know that the bot is working"),
  category: "utility",
  async execute(interaction) {
    const client = interaction.client;
    try {
      await interaction.reply("Work!");
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
