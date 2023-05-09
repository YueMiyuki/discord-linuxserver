const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const config = require("../../config.json");

const Docker = require("dockerode");
const docker = new Docker({ socketPath: config.dockerSock });

module.exports = {
  data: new SlashCommandBuilder()
    .setName("docker")
    .setDescription("Docker management"),
  async execute(interaction) {
    await interaction.reply("Please wait...");
    const containerList = [];
    docker.listContainers({ all: true }, async function (err, containers) {
      if (err) {
        console.log(err);
        interaction.reply("An error occured!");
      } else {
        containers.map(async function (containerInfo) {
          // console.log(containerInfo.Id, containerInfo.Names)

          let containers =
            "Hash: " +
            containerInfo.Id.substring(0, 12) +
            " Name: " +
            containerInfo.Names;
          containers = containers.replace("/", "");
          //    containers = `"` + containers + `"`;

          containerList.push(containers);
          // console.log(containers);
        });

        // console.log(containerList);
        let options = containerList.map((item) => {
          const [hash, name] = item.split(" Name: ");
          const hashValue = hash.replace("Hash: ", "");
          const nameValue = name.trim();
          const optionData = {
            emoji: undefined,
            label: nameValue,
            description: hashValue,
            value: hashValue,
          };
          return optionData;
        });

        options = options.slice(0, 23);

        // console.log(options);

        const select = new StringSelectMenuBuilder()
          .setCustomId("containerSelection")
          .setPlaceholder("Select container")
          .addOptions(options);

        const dockerEmbed = new EmbedBuilder()
          .setColor("Random")
          .setTitle("Docker")
          .setDescription("Select a conainer below")
          .setTimestamp()
          .setFooter({
            text: "mDesk by mTech",
          });
        // console.log(containers);
        const row = new ActionRowBuilder().addComponents(select);

        await interaction.editReply({
          content: "",
          embeds: [dockerEmbed],
          components: [row],
          fetchReply: true,
        });
      }
    });
  },
};
