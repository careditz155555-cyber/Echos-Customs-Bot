const {
 SlashCommandBuilder,
 ChannelType
} = require("discord.js");

const config = require("../config.json");

const PORTFOLIO_BANNER =
 "https://cdn.discordapp.com/attachments/1508147840592122048/1508439954408345760/SOUTHGATE_INT..png?ex=6a158bae&is=6a143a2e&hm=bcc9cf77cf9c22a1b82c79ee78a50654fd746fa81d0f60353af20267954f626b";

module.exports = {
 data: new SlashCommandBuilder()
  .setName("portfolio")
  .setDescription("Portfolio system")
  .addSubcommand(sub =>
   sub
    .setName("create")
    .setDescription("Create a designer portfolio")
    .addUserOption(option =>
     option
      .setName("designer")
      .setDescription("Designer getting the portfolio")
      .setRequired(true)
    )
    .addBooleanOption(option =>
     option.setName("liveries").setDescription("Add Liveries tag"))
    .addBooleanOption(option =>
     option.setName("discord").setDescription("Add Discord tag"))
    .addBooleanOption(option =>
     option.setName("graphics").setDescription("Add Graphics tag"))
    .addBooleanOption(option =>
     option.setName("clothing").setDescription("Add Clothing tag"))
    .addBooleanOption(option =>
     option.setName("els").setDescription("Add ELS tag"))
    .addBooleanOption(option =>
     option.setName("photography").setDescription("Add Photography tag"))
  ),

 async execute(interaction) {
  if (!interaction.member.roles.cache.has(config.hrRoleId)) {
   return interaction.reply({
    content: "❌ HRs only can create portfolios.",
    ephemeral: true
   });
  }

  const designer = interaction.options.getUser("designer");

  const forum = interaction.guild.channels.cache.get(
   config.portfolioForumChannelId
  );

  if (!forum || forum.type !== ChannelType.GuildForum) {
   return interaction.reply({
    content: "❌ Portfolio forum not found.",
    ephemeral: true
   });
  }

  const appliedTags = [];

  if (interaction.options.getBoolean("liveries")) {
   appliedTags.push(config.portfolioTags.liveries);
  }

  if (interaction.options.getBoolean("discord")) {
   appliedTags.push(config.portfolioTags.discord);
  }

  if (interaction.options.getBoolean("graphics")) {
   appliedTags.push(config.portfolioTags.graphics);
  }

  if (interaction.options.getBoolean("clothing")) {
   appliedTags.push(config.portfolioTags.clothing);
  }

  if (interaction.options.getBoolean("els")) {
   appliedTags.push(config.portfolioTags.els);
  }

  if (interaction.options.getBoolean("photography")) {
   appliedTags.push(config.portfolioTags.photography);
  }

  const thread = await forum.threads.create({
   name: `${designer.username}'s Portfolio`,
   appliedTags,
   message: {
    files: [PORTFOLIO_BANNER]
   }
  });

  await thread.members.add(designer.id).catch(() => {});

  await thread.send({
   content: `${designer}`,
   allowedMentions: {
    users: [designer.id]
   }
  });

  await interaction.reply({
   content: `✅ Created portfolio for ${designer}: ${thread}`,
   ephemeral: true
  });
 }
};