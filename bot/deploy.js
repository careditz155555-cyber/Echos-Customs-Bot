require("dotenv").config();

const { REST, Routes } = require("discord.js");
const fs = require("fs");

const commands = [];
const files = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of files) {
 const cmd = require(`./commands/${file}`);

 if (!cmd.data || typeof cmd.data.toJSON !== "function") {
  console.log(`Skipping ${file}: not a slash command`);
  continue;
 }

 commands.push(cmd.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
 try {
  console.log(`Deploying ${commands.length} commands...`);

  await rest.put(
   Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
   { body: commands }
  );

  console.log("Commands deployed.");
 } catch (err) {
  console.error("Deploy error:", err);
 }
})();