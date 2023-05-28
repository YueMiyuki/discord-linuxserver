module.exports = {
  log: function (message, type) {
    require("console-stamp")(console, {
      format: ":date(yyyy/mm/dd HH:MM:ss) >",
    });

    const dateObject = new Date();
    const date = `0 ${dateObject.getDate()}`.slice(-2);
    const month = `0 ${dateObject.getMonth() + 1}`.slice(-2).replace(" ", "");
    const year = dateObject.getFullYear();
    const hours = dateObject.getHours();
    const minutes = dateObject.getMinutes();
    const seconds = dateObject.getSeconds();

    const chalk = require("chalk");
    const fs = require("node:fs");
    const log = console.log;

    if (type === "info") {
      log(chalk.blue(`[INFO] ${message}`));
      fs.appendFileSync(
        "./log.txt",
        "\n" +
          `${year}/${month}/${date} ${hours}:${minutes}:${seconds} ` +
          `[INFO] ${message}`,
        (err) => {
          if (err) {
            console.error(err);
          }
        }
      );
    } else if (type === "warn") {
      log(chalk.yellow(`[WARN] ${message}`));
      fs.appendFileSync(
        "./log.txt",
        "\n" +
          `${year}/${month}/${date} ${hours}:${minutes}:${seconds} ` +
          `[WARN] ${message}`,
        (err) => {
          if (err) {
            console.error(err);
          }
        }
      );
    } else if (type === "error") {
      log(chalk.red(`[ERROR] ${message}`));
      fs.appendFileSync(
        "./log.txt",
        "\n" +
          `${year}/${month}/${date} ${hours}:${minutes}:${seconds} ` +
          `[ERROR] ${message}`,
        (err) => {
          if (err) {
            console.error(err);
          }
        }
      );
    } else if (type === "debug") {
      log(chalk.green(`[DEBUG] ${message}`));
      fs.appendFileSync(
        "./log.txt",
        "\n" +
          `${year}/${month}/${date} ${hours}:${minutes}:${seconds} ` +
          `[DEBUG] ${message}`,
        (err) => {
          if (err) {
            console.error(err);
          }
        }
      );
    } else if (type === "ci") {
      log(chalk.cyan(`[CI] ${message}`));
      fs.appendFileSync(
        "./log.txt",
        "\n" +
          `${year}/${month}/${date} ${hours}:${minutes}:${seconds} ` +
          `[CI] ${message}`,
        (err) => {
          if (err) {
            console.error(err);
          }
        }
      );
    } else {
      log(chalk.blue(`[INFO] ${message}`));
      fs.appendFileSync(
        "./log.txt",
        "\n" +
          `${year}/${month}/${date} ${hours}:${minutes}:${seconds} ` +
          `[INFO] ${message}`,
        (err) => {
          if (err) {
            console.error(err);
          }
        }
      );
    }
  },
};
