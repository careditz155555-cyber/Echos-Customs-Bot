const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const config = require("../config.json");

module.exports = {
 data: new SlashCommandBuilder()
  .setName("freerelease")
  .setDescription("Start a free release reaction unlock")
  .addIntegerOption(option =>
   option.setName("reactions").setDescription("Reactions needed").setRequired(true)
  )
  .addStringOption(option =>
   option.setName("description").setDescription("What is being released?").setRequired(true)
  )
  .addAttachmentOption(option =>
   option.setName("preview").setDescription("Preview image").setRequired(true)
  )
  .addAttachmentOption(option =>
   option.setName("file").setDescription("Release file upload").setRequired(false)
  )
  .addStringOption(option =>
   option.setName("link").setDescription("Release file link instead of upload").setRequired(false)
  ),

 async execute(interaction) {
  if (!interaction.member.roles.cache.has(config.hrRoleId)) {
   return interaction.reply({ content: "❌ HRs only.", ephemeral: true });
  }

  const needed = interaction.options.getInteger("reactions");
  const description = interaction.options.getString("description");
  const preview = interaction.options.getAttachment("preview");
  const file = interaction.options.getAttachment("file");
  const link = interaction.options.getString("link");

  if (needed < 1) {
   return interaction.reply({ content: "❌ Reactions must be at least 1.", ephemeral: true });
  }

  if (!file && !link) {
   return interaction.reply({ content: "❌ Provide either a file or a link.", ephemeral: true });
  }

  const releaseChannel = interaction.client.channels.cache.get(config.freeReleaseUnlockedChannelId);

  if (!releaseChannel) {
   return interaction.reply({ content: "❌ Free release channel not found.", ephemeral: true });
  }

  await interaction.reply({ content: "✅ Free release started.", ephemeral: true });

  const lockedEmbed = new EmbedBuilder()
   .setTitle("🎁 Free Release")
   .setColor("#da7799")
   .setDescription(
    `${description}\n\n` +
    `React with 🎉 to unlock this release.\n\n` +
    `**Required Reactions:** ${needed}\n` +
    `**Released By:** <@${interaction.user.id}>`
   )
   .setTimestamp();

  const releaseMessage = await releaseChannel.send({
   content: `<@&${config.freeReleaseRoleId}>`,
   embeds: [lockedEmbed],
   allowedMentions: { roles: [config.freeReleaseRoleId] }
  });

  await releaseMessage.react("🎉");

  const collector = releaseMessage.createReactionCollector({
   filter: reaction => reaction.emoji.name === "🎉",
   time: 24 * 60 * 60 * 1000
  });

  collector.on("collect", async reaction => {
   const users = await reaction.users.fetch();
   const realUsers = users.filter(user => !user.bot);

   if (realUsers.size >= needed) {
    collector.stop("unlocked");

    const downloadValue = link
     ? `[Click here to download](${link})`
     : `[Download attached file](${file.url})`;

    const unlockedEmbed = new EmbedBuilder()
     .setTitle("🎉 Goal Reached! Free Release")
     .setColor("#da7799")
     .setDescription(description)
     .addFields(
      { name: "Download", value: downloadValue },
      { name: "Released By", value: `<@${interaction.user.id}>` }
     )
     .setImage(preview.url)
     .setTimestamp();

    await releaseChannel.send({
     content: `<@&${config.freeReleaseRoleId}>`,
     embeds: [unlockedEmbed],
     allowedMentions: { roles: [config.freeReleaseRoleId] }
    });
   }
  });
 }
};