const { SlashCommandBuilder } = require("discord.js")

const db = require("enhanced.db")
const userLogin = new db.Table("user")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kill")
    .setDescription("Kill the bot process"),
  category: "utility",
  async execute (interaction) {
    const client = interaction.client
    try {
      const userid = interaction.member.id
      if (!userLogin.get(userid)) {
        return await interaction.reply("You are not logged in!")
      }
      interaction.reply("Killing bot process...")
      client.log(
        "Kill bot progress requested by " +
          `${interaction.user.tag} (${interaction.member.id})`,
        "error"
      )
      process.exit()
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
