const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { loadPayouts, savePayouts } = require("../utils/data");
const config = require("../config.json");

module.exports = {
 data: new SlashCommandBuilder()
  .setName("complete")
  .setDescription("Clear payout queue (HR only)"),

 async execute(interaction) {

  // 🔒 HR ONLY LOCK
  if (!interaction.member.roles.cache.has(config.hrRoleId)) {
   return interaction.reply({
    content: "❌ HRs only can clear orders.",
    ephemeral: true
   });
  }

  const payouts = loadPayouts();

  if (!payouts.length) {
   return interaction.reply({
    content: "Nothing to clear."
   });
  }

  savePayouts([]);

  const embed = new EmbedBuilder()
   .setTitle("✅ Queue Cleared")
   .setColor("Green")
   .setDescription(`Cleared ${payouts.length} orders.`);

  await interaction.reply({ embeds: [embed] });
 }
};