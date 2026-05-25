const {
 SlashCommandBuilder,
 PermissionFlagsBits,
 EmbedBuilder
} = require("discord.js");

const config = require("../config.json");

module.exports = {
 data: new SlashCommandBuilder()
  .setName("purge")
  .setDescription("Delete multiple messages")
  .addIntegerOption(option =>
   option
    .setName("amount")
    .setDescription("Amount of messages to delete")
    .setRequired(true)
  ),

 async execute(interaction) {

  // 🔒 HR ONLY
  if (!interaction.member.roles.cache.has(config.hrRoleId)) {
   return interaction.reply({
    content: "❌ HRs only.",
    ephemeral: true
   });
  }

  const amount = interaction.options.getInteger("amount");

  // ❌ INVALID NUMBER
  if (amount < 1 || amount > 100) {
   return interaction.reply({
    content: "❌ Amount must be between 1 and 100.",
    ephemeral: true
   });
  }

  try {

   await interaction.channel.bulkDelete(amount, true);

   const embed = new EmbedBuilder()
    .setTitle("🧹 Messages Purged")
    .setColor("Green")
    .setDescription(`Deleted **${amount}** messages.`);

   await interaction.reply({
    embeds: [embed],
    ephemeral: true
   });

  } catch (err) {

   console.error(err);

   await interaction.reply({
    content: "❌ Failed to purge messages.",
    ephemeral: true
   });
  }
 }
};