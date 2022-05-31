const supabasejs =  require('@supabase/supabase-js')
require('dotenv').config()
const logger = require("./logging")
const levelling = require('./levelling')

const ENV = process.env

const supabase = supabasejs.createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SECRET)

async function upsertUser(user_id, user_name) {
  const { data, error } = await supabase.from('Users').upsert({id: user_id, name: user_name})
  if (error) {
    logger.error("Supabase error whilst upserting user: " + error.message)
  } else if (data.length > 0) {
    logger.debug(`${data[0].name} (id: ${data[0].id}) upserted to database.`)
  } else {
    logger.warn("No supabase error reported but no data returned.")
  }
}

async function insertMember(msg, guild_id) {
  const xp = levelling.msgXP(msg.content.length)
  const level = levelling.getLevel(xp)
  const { data, error } = await supabase.from('Members').insert(
    {
      user_id: msg.author.id,
      guild_id: guild_id,
      level: level,
      xp: xp,
      messages: 1,
      characters: msg.content.length,
      monthly_xp: 0,
      monthly_messages: 1,
      monthly_characters: msg.content.length
    }
    )
  if (error) {
    logger.error("Supabase error : " + error.message)
  } else if (data.length > 0) {
    logger.debug(`id: ${data[0].user_id} inserted as member in guild ${data[0].guild_id}.`)
  } else {
    logger.warn("No supabase error reported but no data returned.")
  }
}

async function updateMember(msg, member_id, pdata) {
  const xp = levelling.msgXP(msg.content.length)
  const new_xp = pdata.xp + xp
  const level = levelling.getLevel(new_xp)
  const { data, error } = await supabase.from('Members').update(
    {
      level: level,
      xp: new_xp,
      messages: pdata.messages + 1,
      characters: pdata.characters + msg.content.length,
      monthly_xp: pdata.monthly_xp + xp,
      monthly_messages: pdata.monthly_messages + 1,
      monthly_characters: pdata.monthly_characters + msg.content.length
    }
  )
  .match({id: member_id})

  if (error) {
    logger.error("Supabase error while updating member: " + error.message)
  } else if (data.length > 0) {
    logger.debug(`user: ${data[0].user_id} membership in guild: ${data[0].guild_id} updated.`, data[0])
  } else {
    logger.warn("No supabase error reported but no data returned.")
  }
}

async function upsertGuilds(guilds) {
  for (let i = 0; i < guilds.length; i++) {
    const guild = guilds[i];
    const { data, error } = await supabase.from('Guilds').upsert({id: guild.id, name: guild.name});
    if (error) {
      logger.error("Supabase error: " + error.message)
    } else if (data.length > 0) {
      logger.debug(`${data[0].name} (id: ${data[0].id}) upserted to database.`)
    } else {
      logger.warn("No supabase error reported but no data returned.")
    }
  }
}

async function upsertGuild(guild) {
  const { data, error } = await supabase.from('Guilds').upsert({id: guild.id, name: guild.name});
    if (error) {
      logger.error("Supabase error: " + error.message)
    } else if (data.length > 0) {
      logger.debug(`${data[0].name} (id: ${data[0].id}) upserted to database.`)
    } else {
      logger.warn("No supabase error reported but no data returned.")
    }
}

async function getMember(user_id, guild_id) {
  const { data, error } = await supabase.from('Members').select("*").match({user_id: user_id, guild_id: guild_id}).maybeSingle()
  if (error) {
    logger.error(error.message)
  }
  logger.debug(`Retrieved member match from db, data: ${JSON.stringify(data)}`)
  return data
}

module.exports = {
  updateMember: updateMember,
  upsertUser: upsertUser,
  insertMember: insertMember,
  upsertGuilds: upsertGuilds,
  upsertGuild: upsertGuild,
  getMember: getMember,
  supabase: supabase,
}
