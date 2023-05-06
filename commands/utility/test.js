const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('A test command so that I know that the bot is working'),
	async execute(interaction) {
		await interaction.reply('Work!');
	},
};