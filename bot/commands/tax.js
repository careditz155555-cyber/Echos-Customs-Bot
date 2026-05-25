const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
 data: new SlashCommandBuilder()
  .setName("tax")
  .setDescription("Calculate Roblox tax")
  .addIntegerOption(option =>
   option
    .setName("amount")
    .setDescription("Robux amount")
    .setRequired(true)
  ),

 async execute(interaction) {

  const amount = interaction.options.getInteger("amount");

  const beforeTax = Math.ceil(amount / 0.7);
  const tax = beforeTax - amount;

  const embed = new EmbedBuilder()
   .setTitle("💰 Tax Calculator")
   .setColor("#da7799")
   .addFields(
    {
     name: "After Tax (You Get)",
     value: `\`${amount.toLocaleString()}\``,
     inline: true
    },
    {
     name: "Tax Taken",
     value: `\`${tax.toLocaleString()}\``,
     inline: true
    },
    {
     name: "Before Tax",
     value: `\`${beforeTax.toLocaleString()}\``,
     inline: true
    }
   )
   .setImage("https://cdn.discordapp.com/attachments/1508148304955969736/1508227626215538708/CHOS_CUSTOMS.png?ex=6a14c5ef&is=6a13746f&hm=4668f57d83605070782fa6ccfd1669fc94ccf2966fcc0afbd4f13554e3b1c091")
   .setFooter({
    text: "Tax Calculator • Roblox System"
   });

  await interaction.reply({ embeds: [embed] });
 }
};