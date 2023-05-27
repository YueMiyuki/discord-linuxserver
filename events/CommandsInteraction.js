// Command Interaction Handler
const { Events } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    const client = interaction.client;
    try {
      if (!interaction.isChatInputCommand()) return;

      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        client.log(
          `No command matching ${interaction.commandName} was found.`,
          "error"
        );
        return;
      }

      try {
        await command.execute(interaction);
        client.log(
          `Command ${command} ran by ${interaction.user.tag} (${interaction.member.id})`
        );
      } catch (error) {
        client.log(error, "error");
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
