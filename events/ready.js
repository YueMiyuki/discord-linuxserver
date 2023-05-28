const { Events } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    try {
      client.log(`Ready! Logged in as ${client.user.tag}`, "info");
      if (process.env.CI === "true") {
        client.ci();
      }
    } catch (e) {
      client.log(e, "error");
    }
  },
};
