const fs = require("node:fs")
const path = require("node:path")
const discord = require('discord.js')
require('dotenv').config()
const logger = require("./utils/logging")
const { updateMember, upsertUser, insertMember, upsertGuilds, upsertGuild, getMember, supabase } = require("./utils/db")
const { guildInfoFormat, userInfoFormat } = require("./utils/misc")

const ENV = process.env

const client = new discord.Client({intents: [discord.Intents.FLAGS.GUILDS, discord.Intents.FLAGS.GUILD_MESSAGES]})

client.once("ready", async function() {
  logger.info("Checking guild membership...")
  // Get list of guilds
  const guilds = Array.from((await client.guilds.fetch()).values())
  // Upsert each to supabase
  try {
    await upsertGuilds(guilds)
    logger.info("Completed guild membership check.")
  } catch (e) {
    logger.error(e.message)
  }
  logger.info(`Logged in as ${client.user.tag}.`)
  logger.info(`Ready!`)
})

// ----------------------------- EVENTS -----------------------//
client.on("guildCreate", async guild => {
  logger.info(`New guild joined ${guildInfoFormat(guild)}. Adding to database.`)
  try {
    await upsertGuild(guild)
  } catch (e) {
    logger.error(e)
  }
})


// Message handling //
client.on("messageCreate", async function(msg) {

  if (msg.author.id === client.user.id) return;

  // Start processing time count
  const start = performance.now()

  // Log message info
  logger.debug(`MESSAGE: ${userInfoFormat(msg.author)}: ${msg.content}`)

  // upsert user to db
  const user = msg.author
  const guild_id = msg.guildId
  try {
    await upsertUser(user)
  } catch (e) {
    logger.error(e.message)
  }

  // Look for member entry
  const { data, error } = await supabase.from('Members').select("*").match({user_id: user.id, guild_id: guild_id})
  if (error) {
    logger.error(`Supabase error in member search: ${error.message}`)
  } else if (data.length > 0) {
    // Update member
    logger.debug(`User ${userInfoFormat(user)} present in Member table, updating.`)
    try {
      await updateMember(msg, data[0].id, data[0])
    } catch (e) {
      logger.error(e.message)
    }
  } else if (data.length === 0) {
    logger.debug(`User ${userInfoFormat(user)} not present in Member table, inserting.`)
    try {
      await insertMember(msg, guild_id)
    } catch (e) {
      logger.error(e.message)
    }
  }

  // Log processing time
  const duration = performance.now() - start
  logger.debug(`Message processing completed in ${duration}ms (${duration / 1000}s)`)
})

// Commands

client.commands = new discord.Collection();
const commandsPath = path.join(__dirname, 'commands');
logger.debug(`Searching for command files in ${commandsPath}`)
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

  if(!command) {
    logger.warn(`Commmand ${interaction.commandName} not found in client.commands.`)
  };

  logger.debug(`${command.data.name} sent by ${userInfoFormat(interaction.user)} in guild ${guildInfoFormat(interaction.guild)}`)
  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(`Error executing command ${command.data.name} sent by ${userInfoFormat(interaction.user)} in guild ${guildInfoFormat(interaction.guild)} \n Error: ${error.message}`);
    await interaction.reply({ content: 'There was an error while executing this command. If this continues please contact the developers.', ephemeral: true })
  }
})

client.login(ENV.BOT_TOKEN)
