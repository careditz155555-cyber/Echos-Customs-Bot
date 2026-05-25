const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const config = require("../config.json");

// SAME IMAGE FOR EVERY REVIEW
const REVIEW_BANNER =
 "https://cdn.discordapp.com/attachments/1508147840592122048/1508446624047698114/IMG_5567.psd.png?ex=6a1591e4&is=6a144064&hm=5e839402936685ed1fd3e3307b277e69a8034ed69d01fca31e5f8393cab5d9ea";

module.exports = {
 data: new SlashCommandBuilder()
  .setName("review")
  .setDescription("Submit a customer review")

  .addUserOption(option =>
   option
    .setName("designer")
    .setDescription("Designer being reviewed")
    .setRequired(true)
  )

  .addStringOption(option =>
   option
    .setName("product")
    .setDescription("What product did you order?")
    .setRequired(true)
  )

  .addIntegerOption(option =>
   option
    .setName("rating")
    .setDescription("Rating out of 5")
    .setRequired(true)
    .addChoices(
     { name: "⭐", value: 1 },
     { name: "⭐⭐", value: 2 },
     { name: "⭐⭐⭐", value: 3 },
     { name: "⭐⭐⭐⭐", value: 4 },
     { name: "⭐⭐⭐⭐⭐", value: 5 }
    )
  )

  .addStringOption(option =>
   option
    .setName("review")
    .setDescription("Write your review")
    .setRequired(true)
  ),

 async execute(interaction) {

  const reviewChannel =
   interaction.guild.channels.cache.get(
    config.reviewChannelId
   );

  if (!reviewChannel) {
   return interaction.reply({
    content: "❌ Review channel not found.",
    ephemeral: true
   });
  }

  const designer =
   interaction.options.getUser("designer");

  const product =
   interaction.options.getString("product");

  const rating =
   interaction.options.getInteger("rating");

  const reviewText =
   interaction.options.getString("review");

  const stars =
   "⭐".repeat(rating);

  // IMAGE EMBED
  const imageEmbed = new EmbedBuilder()
   .setColor("#da7799")
   .setImage(REVIEW_BANNER);

  // REVIEW EMBED
  const reviewEmbed = new EmbedBuilder()
   .setColor("#da7799")

   .setAuthor({
    name: interaction.user.username,
    iconURL:
     interaction.user.displayAvatarURL({
      dynamic: true
     })
   })

   .addFields(
    {
     name: "Designer",
     value: `${designer}`,
     inline: true
    },

    {
     name: "Product",
     value: product,
     inline: true
    },

    {
     name: "Rating",
     value: stars,
     inline: false
    },

    {
     name: "Review",
     value: reviewText,
     inline: false
    }
   )

   .setTimestamp();

  await reviewChannel.send({
   embeds: [
    imageEmbed,
    reviewEmbed
   ]
  });

  await interaction.reply({
   content: "✅ Review submitted.",
   ephemeral: true
  });
 }
};