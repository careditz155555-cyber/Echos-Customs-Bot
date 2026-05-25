require("dotenv").config();

const fs = require("fs");

const {
 Client,
 Collection,
 GatewayIntentBits,
 Partials,
 Events
} = require("discord.js");

const client = new Client({
 intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildMessageReactions
 ],
 partials: [
  Partials.Message,
  Partials.Channel,
  Partials.Reaction
 ]
});

client.commands = new Collection();

const files = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of files) {
 const command = require(`./commands/${file}`);

 if (command.name && command.execute && !command.data) {
  client.on(command.name, (...args) => command.execute(...args));
  console.log(`Loaded event: ${file}`);
  continue;
 }

 if (command.data && command.execute) {
  client.commands.set(command.data.name, command);
  console.log(`Loaded command: ${file}`);
  continue;
 }

 console.log(`Skipped ${file}: invalid file`);
}

client.once(Events.ClientReady, () => {
 console.log(`Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
 if (!interaction.isChatInputCommand()) return;

 const command = client.commands.get(interaction.commandName);
 if (!command) return;

 try {
  await command.execute(interaction);
 } catch (err) {
  console.error(err);

  if (interaction.replied || interaction.deferred) {
   await interaction.followUp({
    content: "❌ Something went wrong.",
    ephemeral: true
   });
  } else {
   await interaction.reply({
    content: "❌ Something went wrong.",
    ephemeral: true
   });
  }
 }
});

client.login(process.env.TOKEN);