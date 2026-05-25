const {
 SlashCommandBuilder,
 EmbedBuilder,
 ActionRowBuilder,
 ButtonBuilder,
 ButtonStyle
} = require("discord.js");

const config = require("../config.json");

function parseDuration(input) {
 const match = input.match(/^(\d+)(s|m|h|d)$/i);
 if (!match) return null;

 const amount = parseInt(match[1]);
 const unit = match[2].toLowerCase();

 if (unit === "s") return amount * 1000;
 if (unit === "m") return amount * 60 * 1000;
 if (unit === "h") return amount * 60 * 60 * 1000;
 if (unit === "d") return amount * 24 * 60 * 60 * 1000;

 return null;
}

module.exports = {
 data: new SlashCommandBuilder()
  .setName("giveaway")
  .setDescription("Start a giveaway")
  .addStringOption(o =>
   o.setName("prize").setDescription("Example: 2,000R").setRequired(true)
  )
  .addAttachmentOption(o =>
   o.setName("logo").setDescription("Upload logo/image").setRequired(true)
  )
  .addIntegerOption(o =>
   o.setName("winners").setDescription("Amount of winners").setRequired(true)
  )
  .addStringOption(o =>
   o.setName("duration").setDescription("Example: 10m, 1h, 2d").setRequired(true)
  )
  .addStringOption(o =>
   o.setName("invite").setDescription("Server invite link").setRequired(true)
  )
  .addStringOption(o =>
   o.setName("ping")
    .setDescription("Who to ping")
    .setRequired(true)
    .addChoices(
     { name: "No ping", value: "none" },
     { name: "@everyone", value: "everyone" },
     { name: "@here", value: "here" },
     { name: "Role", value: "role" }
    )
  )
  .addRoleOption(o =>
   o.setName("role").setDescription("Role to ping if Role was chosen").setRequired(false)
  ),

 async execute(interaction) {
  if (!interaction.member.roles.cache.has(config.hrRoleId)) {
   return interaction.reply({ content: "❌ HRs only.", ephemeral: true });
  }

  const giveawayChannel = interaction.guild.channels.cache.get(config.giveawayChannelId);

  if (!giveawayChannel) {
   return interaction.reply({ content: "❌ Giveaway channel not found.", ephemeral: true });
  }

  const prize = interaction.options.getString("prize");
  const logo = interaction.options.getAttachment("logo");
  const winners = interaction.options.getInteger("winners");
  const durationText = interaction.options.getString("duration");
  const inviteInput = interaction.options.getString("invite");
  const pingChoice = interaction.options.getString("ping");
  const role = interaction.options.getRole("role");

  const invite = inviteInput.startsWith("http")
   ? inviteInput
   : `https://${inviteInput}`;

  const durationMs = parseDuration(durationText);

  if (!durationMs) {
   return interaction.reply({
    content: "❌ Invalid duration. Use `10m`, `1h`, or `2d`.",
    ephemeral: true
   });
  }

  if (winners < 1) {
   return interaction.reply({
    content: "❌ Winners must be at least 1.",
    ephemeral: true
   });
  }

  let pingContent = "";

  if (pingChoice === "everyone") pingContent = "@everyone";
  if (pingChoice === "here") pingContent = "@here";

  if (pingChoice === "role") {
   if (!role) {
    return interaction.reply({
     content: "❌ You chose role ping, but did not select a role.",
     ephemeral: true
    });
   }

   pingContent = `<@&${role.id}>`;
  }

  const entries = new Set();
  const endTime = Math.floor((Date.now() + durationMs) / 1000);
  const buttonId = `enter_giveaway_${Date.now()}`;

  function buildEmbed(ended = false, winnerText = null) {
   const embed = new EmbedBuilder()
    .setColor("#da7799")
    .setThumbnail(logo.url)
    .setDescription(
     `# ${prize}\n\n` +
     `You are **required** to join the listed server below\n` +
     `prior to the end of the giveaway to remain\n` +
     `eligible for the prize.\n\n` + `Please note this giveaway is not funded by Echo's Customs.`
    )
    .addFields(
     { name: "🎁 Prize", value: prize, inline: false },
     { name: "🏆 Winners", value: `${winners}`, inline: true },
     { name: "👥 Entries", value: `${entries.size}`, inline: true },
     { name: ended ? "⏱️ Ended" : "⏱️ Ends", value: `<t:${endTime}:R>`, inline: true },
     { name: "🔗 Invite", value: invite, inline: false }
    );

   if (winnerText) {
    embed.addFields({
     name: "🎉 Winner(s)",
     value: winnerText,
     inline: false
    });
   }

   return embed;
  }

  const activeRow = new ActionRowBuilder().addComponents(
   new ButtonBuilder()
    .setLabel("Join Server")
    .setStyle(ButtonStyle.Link)
    .setURL(invite)
    .setEmoji("👋"),

   new ButtonBuilder()
    .setCustomId(buttonId)
    .setLabel("Enter Giveaway")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("🎉")
  );

  await interaction.reply({
   content: "✅ Giveaway started.",
   ephemeral: true
  });

  const giveawayMessage = await giveawayChannel.send({
   content: pingContent || null,
   embeds: [buildEmbed()],
   components: [activeRow],
   allowedMentions: {
    parse:
     pingChoice === "everyone"
      ? ["everyone"]
      : pingChoice === "here"
       ? ["everyone"]
       : [],
    roles: role ? [role.id] : []
   }
  });

  const collector = giveawayMessage.createMessageComponentCollector({
   time: durationMs
  });

  collector.on("collect", async button => {
   if (button.customId !== buttonId) return;

   if (entries.has(button.user.id)) {
    return button.reply({
     content: "❌ You are already entered.",
     ephemeral: true
    });
   }

   entries.add(button.user.id);

   await button.reply({
    content: "✅ You entered the giveaway.",
    ephemeral: true
   });

   await giveawayMessage.edit({
    embeds: [buildEmbed()],
    components: [activeRow]
   });
  });

  collector.on("end", async () => {
   const disabledRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
     .setLabel("Join Server")
     .setStyle(ButtonStyle.Link)
     .setURL(invite)
     .setEmoji("👋"),

    new ButtonBuilder()
     .setCustomId("giveaway_ended")
     .setLabel("Giveaway Ended")
     .setStyle(ButtonStyle.Secondary)
     .setEmoji("🎉")
     .setDisabled(true)
   );

   const entryArray = [...entries];

   if (entryArray.length === 0) {
    await giveawayMessage.edit({
     embeds: [buildEmbed(true, "No winners. No one entered.")],
     components: [disabledRow]
    });

    await giveawayMessage.reply("🎉 Giveaway ended with no entries.");
    return;
   }

   const shuffled = entryArray.sort(() => Math.random() - 0.5);
   const winnerIds = shuffled.slice(0, winners);
   const winnerText = winnerIds.map(id => `<@${id}>`).join(", ");

   await giveawayMessage.edit({
    embeds: [buildEmbed(true, winnerText)],
    components: [disabledRow]
   });

   await giveawayMessage.reply({
    content: `🎉 Congratulations ${winnerText}! You won **${prize}**!`,
    allowedMentions: {
     users: winnerIds
    }
   });
  });
 }
};