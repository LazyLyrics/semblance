const fs = require("node:fs")
const path = require("node:path")
const discord = require('discord.js')
const supabasejs =  require('@supabase/supabase-js')
require('dotenv').config()
const logger = require("./logging")
const { updateMember, upsertUser, insertMember, upsertGuilds } = require("./db")

const ENV = process.env

const supabase = supabasejs.createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SECRET)
const client = new discord.Client({intents: [discord.Intents.FLAGS.GUILDS, discord.Intents.FLAGS.GUILD_MESSAGES]})

client.once("ready", async function() {
  logger.debug("Checking guild membership...")

  // Get list of guilds
  const guilds = Array.from((await client.guilds.fetch()).values())
  // Upsert each to supabase
  await upsertGuilds(guilds)
  logger.debug("Completed guild membership check.")
  client.user.setActivity('Counting your messages.')
  logger.info(`Logged in as ${client.user.tag}.`)
  logger.info(`Ready!`)
})

// ----------------------------- EVENTS -----------------------//
client.on("guildCreate", guild => {
  logger.debug(`${guild}`)
})


// Message handling //
client.on("messageCreate", async function(msg) {

  if (msg.author.id === client.user.id) return;

  // Start processing time count
  const start = performance.now()

  // Log message info
  logger.debug(`MESSAGE: ${msg.author.username}: ${msg.content}`)

  // upsert user to db
  const user = msg.author
  const guild_id = msg.guildId
  await upsertUser(user.id, user.username)

  // Look for member entry
  const { data, error } = await supabase.from('Members').select("*").match({user_id: user.id, guild_id: guild_id})
  if (error) {
    logger.error(`Supabase error in member search: ${error.message}`)
  } else if (data.length > 0) {
    // Update member
    await updateMember(msg, data[0].id, data[0])
  } else if (data.length === 0) {
    await insertMember(msg, guild_id)
  }

  // Log processing time
  const duration = performance.now() - start
  logger.debug(`Message processing completed in ${duration}ms (${duration / 1000}s)`)
})

// Commands

client.commands = new discord.Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
  logger.debug(`Added ${command.data.name} command to client.commands`)
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if(!command) return;

  logger.debug(`${command.data.name} sent by ${interaction.user.username} (${interaction.user.id})`)
  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(error);
    await interaction.reply({ content: 'There was an error while executing this command', ephemeral: true })
  }
})

client.login(ENV.BOT_TOKEN)
