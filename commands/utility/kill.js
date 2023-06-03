const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kill")
    .setDescription("Kill the bot process"),
  category: "utility",
  async execute(interaction) {
    const client = interaction.client;
    try {
      const userid = interaction.member.id;

      const auth = await client.dbAuth(userid);
      if (!auth) {
        await interaction.reply("You are not authorized to use this command!");
        return;
      }

      interaction.reply("Killing bot process...");
      client.log(
        "Kill bot progress requested by " +
          `${interaction.user.tag} (${interaction.member.id})`,
        "debug"
      );
      process.exit();
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
