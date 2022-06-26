const supabasejs =  require('@supabase/supabase-js')
require('dotenv').config()
const logger = require("./logging")
const levelling = require('./levelling')
const { userInfoFormat, guildInfoFormat } = require('./misc')

const ENV = process.env

const supabase = supabasejs.createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SECRET)

async function upsertUser(user) {
  logger.debug(`Attempting to upsert user ${userInfoFormat(user)}`)
  const { data, error } = await supabase.from('Users').upsert({id: user.id, name: user.name, avatar_url: user.avatarURL()})
  if (error) {
    logger.error(`Couldn't upsert user ${userInfoFormat(user)} \n Supabase error: ${error.message}`)
  } else if (data.length > 0) {
    logger.debug(`${data[0].name} (id: ${data[0].id}) upserted to database.`)
  } else {
    logger.warn("No supabase error reported but no data returned.")
  }
}

async function insertMember(msg, guild_id) {
  logger.debug(`Attempting to create new member record for user ${userInfoFormat(msg.author)}`)
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
      monthly_xp: xp,
      monthly_messages: 1,
      monthly_characters: msg.content.length
    }
    )
  if (error) {
    logger.error(`create new member record for user ${userInfoFormat(msg.author)} \n Supabase Error: ${error.message}`)
  } else if (data.length > 0) {
    logger.debug(`id: ${data[0].user_id} inserted as member in guild ${data[0].guild_id}.`)
  } else {
    logger.warn("No supabase error reported but no data returned.")
  }
}

async function updateMember(msg, member_id, pdata) {
  logger.debug(`Attempting to update user ${userInfoFormat(msg.author)}`)
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
    logger.error(`Error updating member ${userInfoFormat(msg.author)} \n Supabase error: ${error.message}`)
  } else if (data.length > 0) {
    logger.debug(`user: ${data[0].user_id} membership in guild: ${data[0].guild_id} updated.`, JSON.stringify(data[0], null, 2))
  } else {
    logger.warn("No supabase error reported but no data returned.")
  }
}

async function upsertGuilds(guilds) {
  logger.debug(`Attempting to upsert guilds to database.`)
  for (let i = 0; i < guilds.length; i++) {
    const guild = guilds[i];
    logger.debug(`Upserting ${guildInfoFormat(guild)}`)
    const { data, error } = await supabase.from('Guilds').upsert({id: guild.id, name: guild.name});
    if (error) {
      logger.error(`Error upserting ${guildInfoFormat(guild)} to database. \n Supabase error: ${error.message}`)
    } else if (data.length > 0) {
      logger.debug(`${data[0].name} (id: ${data[0].id}) upserted to database.`)
    } else {
      logger.warn("No supabase error reported but no data returned.")
    }
  }
}

async function upsertGuild(guild) {
  logger.debug(`Upserting ${guildInfoFormat(guild)} to database.`)
  const { data, error } = await supabase.from('Guilds').upsert({id: guild.id, name: guild.name});
    if (error) {
      logger.error(`Error upserting ${guildInfoFormat(guild)} to database. \n Supabase error: ${error.message}`)
    } else if (data.length > 0) {
      logger.debug(`${data[0].name} (id: ${data[0].id}) upserted to database.`)
    } else {
      logger.warn("No supabase error reported but no data returned.")
    }
}

async function getMember(user_id, guild_id) {
  logger.debug(`Searching for user with id ${user_id} in guild ${guild_id} in database.`)
  const { data, error } = await supabase.from('Members').select("*").match({user_id: user_id, guild_id: guild_id}).maybeSingle()
  if (error) {
    logger.error(`Failed to find user with id ${user_id} in guild ${guild_id} in database. \n Supabase error: ${error.message}`)
  }
  logger.debug(`Retrieved member match from db, data: ${JSON.stringify(data, null, 2)}`)
  return data
}

async function reset(guild_id) {
  logger.info(`Resetting database for guild with id ${guild_id}.`)
  const {data, error} = await supabase.from('Members').update({xp: 0, messages: 0, characters: 0, level: 0, monthly_xp: 0, monthly_messages: 0, monthly_characters: 0}).match({guild_id: guild_id})
  if (error) {
    logger.error(`Failed to reset database for guild with id ${guild.id} \n Supabase error: ${error.message}`)
  } else {
    logger.info(`Successfully reset database.`)
  }
  return
}

async function reset_monthly(guild_id) {
  logger.info(`Resetting monthly database for guild`)
  const {data, error} = await supabase.from('Members').update({monthly_xp: 0, monthly_messages: 0, monthly_characters: 0}).match({guild_id: guild_id})
  if (error) {
    logger.error(`Failed to reset database for guild with id ${guild.id} \n Supabase error: ${error.message}`)
  }
  return
}

async function getLeaderboard(guild_id) {
  logger.debug(`Leaderboard requested for guild id: ${guild_id}`)
  const { data, error } = await supabase.from('Members').select("*").order('xp', {ascending: false}).match({guild_id: guild_id});
  if (error) {
    logger.error(`Failed to retrieve leaderboard data for guild id: ${guild_id} \n Supabase Error: ${error.message}`)
  } else if (data.length == 0) {
    logger.warn(`Supabase leaderboard query for guild id: ${guild_id} returned no data. (This may not be an error if there are no members registered with this guild yet.)`)
    return null
  } else {
    return data
  }
}

async function getMonthlyLeaderboard(guild_id) {
  logger.debug(`Leaderboard requested for guild id: ${guild_id}`)
  const { data, error } = await supabase.from('Members').select("*").order('monthly_xp', {ascending: false}).match({guild_id: guild_id});
  if (error) {
    logger.error(`Failed to retrieve leaderboard data for guild id: ${guild_id} \n Supabase Error: ${error.message}`)
  } else if (data.length == 0) {
    logger.warn(`Supabase leaderboard query for guild id: ${guild_id} returned no data. (This may not be an error if there are no members registered with this guild yet.)`)
    return null
  } else {
    return data
  }
}

module.exports = {
  updateMember: updateMember,
  upsertUser: upsertUser,
  insertMember: insertMember,
  upsertGuilds: upsertGuilds,
  upsertGuild: upsertGuild,
  getMember: getMember,
  reset: reset,
  reset_monthly: reset_monthly,
  getLeaderboard: getLeaderboard,
  getMonthlyLeaderboard: getMonthlyLeaderboard,
  supabase: supabase,
}
