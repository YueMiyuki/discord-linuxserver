module.exports = {
  log: function (message, type) {
    require("console-stamp")(console, {
      format: ":date(yyyy/mm/dd HH:MM:ss) >",
    });

    const chalk = require("chalk");
    const log = console.log;

    if (type === "info") {
      log(chalk.blue(`[INFO] ${message}`));
    } else if (type === "warn") {
      log(chalk.yellow(`[WARN] ${message}`));
    } else if (type === "error") {
      log(chalk.red(`[ERROR] ${message}`));
    } else if (type === "debug") {
      log(chalk.green(`[DEBUG] ${message}`));
    } else if (type === "ci") {
      log(chalk.cyan(`[CI] ${message}`));
    } else {
      log(chalk.blue(`[INFO] ${message}`));
    }
  },
};
