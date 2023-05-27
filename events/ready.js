const { Events } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    try {
      client.log(`Ready! Logged in as ${client.user.tag}`, "info");
      if (client.config.ci === true) {
        client.log("Startup test succeed!", "ci");
        client.log("Killing process...", "ci");
        process.exit();
      }
    } catch (e) {
      client.log(e, "error");
    }
  },
};
