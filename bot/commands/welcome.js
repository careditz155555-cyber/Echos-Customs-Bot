const {
 Events,
 ActionRowBuilder,
 ButtonBuilder,
 ButtonStyle
} = require("discord.js");

module.exports = {
 name: Events.GuildMemberAdd,
 once: false,

 async execute(member) {
  const channel = member.guild.channels.cache.get("1429461330577854548");
  if (!channel) return;

  const welcomeMessage =
   `<a:wave_animated2:1456882592816042139> **Welcome** ${member} (@${member.user.username}) ` +
   `to <:Logo:PUT_LOGO_ID_HERE> **Echo's Customs**. ` +
   `We hope you enjoy your stay here! Thanks for joining.`;

  const row = new ActionRowBuilder().addComponents(
   new ButtonBuilder()
    .setCustomId("member_count")
    .setLabel(`${member.guild.memberCount}`)
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(true),

   new ButtonBuilder()
    .setLabel("Dashboard")
    .setStyle(ButtonStyle.Link)
    .setURL("PUT_DASHBOARD_CHANNEL_LINK_HERE")
  );

  try {
   await channel.send({
    content: welcomeMessage,
    components: [row]
   });
  } catch (err) {
   console.error("Failed to send welcome message:", err);
  }

  const roleId = "1429526290595188877";
  const role = member.guild.roles.cache.get(roleId);

  if (role) {
   try {
    await member.roles.add(role);
   } catch (err) {
    console.error(`Failed to add role ${roleId} to ${member.user.tag}:`, err);
   }
  }
 }
};