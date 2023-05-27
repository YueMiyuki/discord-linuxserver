const {
  Events,
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
} = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    const client = interaction.client;
    try {
      if (!interaction.isButton()) return;
      if (interaction.customId !== "cantFindContainerButton") return;
      const modal = new ModalBuilder()
        .setCustomId("findContainerHashButton")
        .setTitle("Find Contianer");

      const findContainerHashInput = new TextInputBuilder()
        .setCustomId("findContainerHashInput")
        .setLabel("Input your container hash to find it")
        .setStyle(TextInputStyle.Paragraph);

      const firstActionRow = new ActionRowBuilder().addComponents(
        findContainerHashInput
      );
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
