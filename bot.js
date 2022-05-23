import { createClient } from "@supabase/supabase-js";
import { Client, Intents } from "discord.js"
import "dotenv/config"

const ENV = process.env

const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SECRET)
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]})

async function upsertUser(user_id, user_name) {
  const { data, error } = await supabase.from('Users').upsert({id: user_id, name: user_name})
  if (error) {
    console.log("Supabase error: " + error)
  } else if (data.length > 0) {
    console.log(`${data[0].name} (id: ${data[0].id}) upserted to database.`)
  } else {
    console.log("No supabase error reported but no data returned.")
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
    console.log("Supabase error : " + error)
  } else if (data.length > 0) {
    console.log(`id: ${data[0].user_id} inserted as member in guild ${data[0].guild_id}.`)
  } else {
    console.log("No supabase error reported but no data returned.")
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
    console.log("Supabase error : " + error)
  } else if (data.length > 0) {
    console.log(`id: ${data[0].user_id} updated: `)
    console.log(data[0])
  } else {
    console.log("No supabase error reported but no data returned.")
  }
}

client.once("ready", async function() {
  console.log("Checking guild membership...")

  // Get list of guilds
  const guilds = Array.from((await client.guilds.fetch()).values())
  // Upsert each to supabase
  for (let i = 0; i < guilds.length; i++) {
    const guild = guilds[i];
    const { data, error } = await supabase.from('Guilds').upsert({id: guild.id, name: guild.name});
    if (error) {
      console.log("Supabase error: " + error)
    } else if (data.length > 0) {
      console.log(`${data[0].name} (id: ${data[0].id}) upserted to database.`)
    } else {
      console.log("No supabase error reported but no data returned.")
    }
  }
  console.log(`Logged in as ${client.user.tag}.`)
  console.log(`Ready!`)
})

// Events
client.on("guildCreate", guild => {
  console.log(guild)
})


// ------------------- MESSAGE HANDLING ------------------------ //
client.on("messageCreate", async function(msg) {
  console.log("------ MESSAGE -------------")
  // Start processing time count
  const start = performance.now()

  // Log message info
  console.log(msg.author.username + ": " + msg.content)

  // upsert user to db
  const user = msg.author
  const guild_id = msg.guildId
  await upsertUser(user.id, user.username)

  // Look for member entry
  const { data, error } = await supabase.from('Members').select("*").match({user_id: user.id, guild_id: guild_id})
  if (error) {
    console.log(`Supabase error: ${error}`)
  } else if (data.length > 0) {
    await updateMember(msg, data[0].id, data[0])
  } else if (data.length === 0) {
    await insertMember(msg, guild_id)
  }

  // Log processing time
  const duration = performance.now() - start
  console.log(`Message processing completed in ${duration}ms (${duration / 1000}s)`)
  console.log("--------------------------------")
})
// ----------------------------------------------------------- //

client.login(ENV.BOT_TOKEN)
