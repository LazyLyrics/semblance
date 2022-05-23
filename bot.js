const discord = require('discord.js')
const supabasejs =  require('@supabase/supabase-js')
require('dotenv').config()
const logger = require("./logging")

const ENV = process.env

const supabase = supabasejs.createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SECRET)
const client = new discord.Client({intents: [discord.Intents.FLAGS.GUILDS, discord.Intents.FLAGS.GUILD_MESSAGES]})

async function upsertUser(user_id, user_name) {
  const { data, error } = await supabase.from('Users').upsert({id: user_id, name: user_name})
  if (error) {
    logger.error("Supabase error: " + error)
  } else if (data.length > 0) {
    logger.debug(`${data[0].name} (id: ${data[0].id}) upserted to database.`)
  } else {
    logger.warn("No supabase error reported but no data returned.")
  }
}

async function insertMember(msg, guild_id) {
  const { data, error } = await supabase.from('Members').insert(
    {
      user_id: msg.author.id,
      guild_id: guild_id,
      level: 0,
      xp: 0,
      messages: 1,
      characters: msg.content.length,
      monthly_xp: 0,
      monthly_messages: 1,
      monthly_characters: msg.content.length
    }
    )
  if (error) {
    logger.error("Supabase error : " + error)
  } else if (data.length > 0) {
    logger.debug(`id: ${data[0].user_id} inserted as member in guild ${data[0].guild_id}.`)
  } else {
    logger.warn("No supabase error reported but no data returned.")
  }
}

async function updateMember(msg, member_id, pdata) {
  const { data, error } = await supabase.from('Members').update(
    {
      level: 0,
      xp: 0,
      messages: pdata.messages + 1,
      characters: pdata.characters + msg.content.length,
      monthly_xp: 0,
      monthly_messages: pdata.monthly_messages + 1,
      monthly_characters: pdata.monthly_characters + msg.content.length
    }
  )
  .match({id: member_id})

  if (error) {
    logger.error("Supabase error : " + error)
  } else if (data.length > 0) {
    logger.debug(`user: ${data[0].user_id} membership in guild: ${data[0].guild_id} updated. `, data[0])
  } else {
    logger.warn("No supabase error reported but no data returned.")
  }
}

client.once("ready", async function() {
  logger.debug("Checking guild membership...")

  // Get list of guilds
  const guilds = Array.from((await client.guilds.fetch()).values())
  // Upsert each to supabase
  for (let i = 0; i < guilds.length; i++) {
    const guild = guilds[i];
    const { data, error } = await supabase.from('Guilds').upsert({id: guild.id, name: guild.name});
    if (error) {
      logger.error("Supabase error: " + error)
    } else if (data.length > 0) {
      logger.debug(`${data[0].name} (id: ${data[0].id}) upserted to database.`)
    } else {
      logger.error("No supabase error reported but no data returned.")
    }
  }
  client.user.setActivity('Counting your messages.')
  logger.info(`Logged in as ${client.user.tag}.`)
  logger.info(`Ready!`)
})

// Events
client.on("guildCreate", guild => {
  logger.debug(`${guild}`)
})


// ------------------- MESSAGE HANDLING ------------------------ //
client.on("messageCreate", async function(msg) {
  // Start processing time count
  const start = performance.now()

  // Log message info
  console.log(msg.author.username + ": " + msg.content)
  logger.debug(`MESSAGE: ${msg.author.username}: ${msg.content}`)

  // upsert user to db
  const user = msg.author
  const guild_id = msg.guildId
  await upsertUser(user.id, user.username)

  // Look for member entry
  const { data, error } = await supabase.from('Members').select("*").match({user_id: user.id, guild_id: guild_id})
  if (error) {
   logger.error(`Supabase error: ${error}`)
  } else if (data.length > 0) {
    await updateMember(msg, data[0].id, data[0])
  } else if (data.length === 0) {
    await insertMember(msg, guild_id)
  }

  // Log processing time
  const duration = performance.now() - start
  logger.debug(`Message processing completed in ${duration}ms (${duration / 1000}s)`)
})
// ----------------------------------------------------------- //

client.login(ENV.BOT_TOKEN)
