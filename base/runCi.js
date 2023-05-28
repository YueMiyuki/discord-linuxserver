module.exports = {
  ci: async function () {
    const { execSync } = require("child_process");
    const log = require("./log.js").log;

    log("Startup test succeed!", "ci");
    log("Node version: " + process.version + "\n", "debug");

    log("Attempting to run deploy...", "ci");

    try {
      process.stdout.write(execSync("node ./base/deploy.js"));
    } catch (e) {
      log("Deploy script return failed!", "error");
      throw new Error(e);
    }

    log("Attempting to run systeminformation methods test...", "ci");

    try {
      process.stdout.write(
        execSync("node ./base/systeminformationMethodTest.js")
      );
    } catch (e) {
      log("Deploy script return failed!", "error");
      throw new Error(e);
    }

    log("Test finished!", "info");
    log("Killing process...", "ci");
    process.exit();
  },
};
