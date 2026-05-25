const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { loadPayouts } = require("../utils/data");
const config = require("../config.json");

module.exports = {
 data: new SlashCommandBuilder()
  .setName("queue")
  .setDescription("View active payout orders"),

 async execute(interaction) {

  const allowed =
   interaction.member.roles.cache.has(config.designerRoleId) ||
   interaction.member.roles.cache.has(config.hrRoleId);

  if (!allowed) {
   return interaction.reply({
    content: "❌ No permission.",
    ephemeral: true
   });
  }

  const payouts = loadPayouts();

  if (!payouts.length) {
   return interaction.reply({
    content: "Queue is empty."
   });
  }

  const list = payouts
   .map(p => `#${p.orderId} | ${p.roblox} | ${p.receivable} R$ | ${p.type}`)
   .join("\n");

  const embed = new EmbedBuilder()
   .setTitle("📦 Active Orders Queue")
   .setColor("Orange")
   .setDescription(list);

  await interaction.reply({ embeds: [embed] });
 }
};