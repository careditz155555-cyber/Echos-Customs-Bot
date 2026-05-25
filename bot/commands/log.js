const {
 SlashCommandBuilder,
 EmbedBuilder
} = require("discord.js");

const {
 loadPayouts,
 savePayouts
} = require("../utils/data");

const config = require("../config.json");

module.exports = {
 data: new SlashCommandBuilder()
  .setName("log")
  .setDescription("Log a new order")

  .addStringOption(o =>
   o.setName("designer-roblox")
    .setDescription("Your Roblox username")
    .setRequired(true))

  .addStringOption(o =>
   o.setName("customer-roblox")
    .setDescription("Customer Roblox username")
    .setRequired(true))

  .addIntegerOption(o =>
   o.setName("price")
    .setDescription("Price charged")
    .setRequired(true))

  .addStringOption(o =>
   o.setName("type")
    .setDescription("Order type")
    .setRequired(true)),

 async execute(interaction) {

  // 🔒 DESIGNERS ONLY
  if (!interaction.member.roles.cache.has(config.designerRoleId)) {
   return interaction.reply({
    content: "❌ Designers only.",
    ephemeral: true
   });
  }

  const designerRoblox =
   interaction.options.getString("designer-roblox");

  const customerRoblox =
   interaction.options.getString("customer-roblox");

  const price =
   interaction.options.getInteger("price");

  const type =
   interaction.options.getString("type");

  const receivable = Math.floor(price * 0.7);

  const payouts = loadPayouts();

  const orderId =
   String(payouts.length + 1).padStart(4, "0");

  const order = {
   orderId,
   designerDiscordId: interaction.user.id,
   designerDiscordTag: interaction.user.tag,
   designerRoblox,
   customerRoblox,
   price,
   receivable,
   type,
   timestamp: Date.now()
  };

  payouts.push(order);

  savePayouts(payouts);

  // ✅ DESIGNER CONFIRMATION
  const designerEmbed = new EmbedBuilder()
   .setTitle(`✅ Order Logged #${orderId}`)
   .setColor("#57F287")
   .addFields(
    {
     name: "Customer",
     value: `\`${customerRoblox}\``,
     inline: true
    },
    {
     name: "Charged",
     value: `${price.toLocaleString()} R$`,
     inline: true
    },
    {
     name: "You Receive",
     value: `${receivable.toLocaleString()} R$`,
     inline: true
    }
   );

  await interaction.reply({
   embeds: [designerEmbed],
   ephemeral: true
  });

  // 🔔 HR CHANNEL LOG
  const hrChannel =
   interaction.client.channels.cache.get(
    config.hrLogChannelId
   );

  if (!hrChannel) return;

  const hrEmbed = new EmbedBuilder()
   .setTitle(`🧾 New Order Logged #${orderId}`)
   .setColor("#5865F2")

   .addFields(
    {
     name: "Designer",
     value: `<@${interaction.user.id}>`,
     inline: true
    },

    {
     name: "Designer Roblox",
     value: `\`${designerRoblox}\``,
     inline: true
    },

    {
     name: "Customer Roblox",
     value: `\`${customerRoblox}\``,
     inline: true
    },

    {
     name: "Order Type",
     value: type,
     inline: true
    },

    {
     name: "Charged",
     value: `${price.toLocaleString()} R$`,
     inline: true
    },

    {
     name: "Designer Receives",
     value: `${receivable.toLocaleString()} R$`,
     inline: true
    }
   )

   .setTimestamp();

  await hrChannel.send({
   content: `<@&${config.hrRoleId}>`,
   embeds: [hrEmbed],
   allowedMentions: {
    roles: [config.hrRoleId]
   }
  });
 }
};