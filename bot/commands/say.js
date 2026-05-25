const { SlashCommandBuilder } = require("discord.js");
const config = require("../config.json");

module.exports = {
 data: new SlashCommandBuilder()
  .setName("say")
  .setDescription("Make the bot say something")
  .addStringOption(option =>
   option
    .setName("message")
    .setDescription("Message to send")
    .setRequired(true)
  ),

 async execute(interaction) {
  const allowedRoles = config.sayAllowedRoles || [];

  const hasPermission = interaction.member.roles.cache.some(role =>
   allowedRoles.includes(role.id)
  );

  if (!hasPermission) {
   return interaction.reply({
    content: "❌ You don’t have permission to use this command.",
    ephemeral: true
   });
  }

  const msg = interaction.options.getString("message");

  await interaction.reply({
   content: "Sent.",
   ephemeral: true
  });

  await interaction.channel.send(msg);
 }
};