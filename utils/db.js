const supabasejs =  require('@supabase/supabase-js')
require('dotenv').config()
const logger = require("./logging")
const levelling = require('./levelling')
const { userInfoFormat, guildInfoFormat } = require('./misc')

const ENV = process.env

// Exception Handlers

class SupabaseException {
  constructor(error) {
    this.error = error.message
    this.prefix = 'Supabase reported an error: '
    this.message = this.prefix + " " + this.error
  }
}

class SupabaseNullDataException {
  constructor() {
    this.message = 'No supabase error reported but no data returned. This may not be an error.'
  }
}

// SUPABASE CLIENT
const supabase = supabasejs.createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SECRET)

// USER MANAGEMENT
async function getUser(user_id) {
  const { data, error } = await supabase.from('Users').select("name, avatar_url").match({id: user_id}).single()
  if ( error ) throw new SupabaseException(error)
  return data
}

async function upsertUser(user) {
  logger.debug(`Attempting to upsert user ${userInfoFormat(user)}`)
  const { data, error } = await supabase.from('Users').upsert({id: user.id, name: user.username, avatar_url: user.avatarURL()})
  if (error) {
    throw new SupabaseException(error)
  } else if (data.length > 0) {
    return data[0]
  } else {
    throw new SupabaseNullDataException()
  }
}

// GUILD MANAGEMENT


async function upsertGuilds(guilds) {
  logger.debug(`Attempting to upsert guilds to database.`)
  for (let i = 0; i < guilds.length; i++) {
    const guild = guilds[i];
    logger.debug(`Upserting ${guildInfoFormat(guild)}`)
    const { data, error } = await supabase.from('Guilds').upsert({id: guild.id, name: guild.name});
    if (error) {
      throw new SupabaseException(error)
    } else if (data.length > 0) {
      return data[0]
    } else {
      throw new SupabaseNullDataException()
    }
  }
}

async function upsertGuild(guild) {
  logger.debug(`Upserting ${guildInfoFormat(guild)} to database.`)
  const { data, error } = await supabase.from('Guilds').upsert({id: guild.id, name: guild.name});
  if (error) {
    throw new SupabaseException(error)
  } else if (data.length > 0) {
    return data[0]
  } else {
    throw new SupabaseNullDataException()
  }
}

async function getRoleSpecs(guild_id) {
  const { data, error } = await supabase.from('Guilds').select('role_specs').match({id: guild_id}).maybeSingle()
  if (error) {
    throw new SupabaseException(error)
  } else {
    return data.role_specs
  }
}

async function updateRoleSpecs(guild_id, role_specs) {
  const { data: update_data, error: update_error } = await supabase
    .from('Guilds')
    .update({
      role_specs: role_specs
    })
    .match({id: guild_id})
  if (update_error) {
    throw new SupabaseException(error)
  }
  return update_data
}
// MEMBER MANAGEMENT

async function getMember(user_id, guild_id) {
  logger.debug(`Searching for user with id ${user_id} in guild ${guild_id} in database.`)
  const { data, error } = await supabase.from('Members').select("*").match({user_id: user_id, guild_id: guild_id}).maybeSingle()
  if (error) {
    throw new SupabaseException(error)
  } else {
    return data
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
    throw new SupabaseException(error)
  } else if (data.length > 0) {
    return data
  } else {
    throw new SupabaseNullDataException()
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
    throw new SupabaseException()
  } else if (data.length > 0) {
    return data
  } else {
    throw new SupabaseNullDataException()
  }
}

// LEADERBOARD MANAGEMENT

async function getLeaderboard(guild_id) {
  logger.debug(`Leaderboard requested for guild id: ${guild_id}`)
  const { data, error } = await supabase.from('Members').select("*").order('xp', {ascending: false}).match({guild_id: guild_id});
  if (error) {
    throw new SupabaseNullDataException(error)
  } else if (data.length > 0) {
    return data
  } else {
    return null
  }
}

async function getMonthlyLeaderboard(guild_id) {
  logger.debug(`Leaderboard requested for guild id: ${guild_id}`)
  const { data, error } = await supabase.from('Members').select("*").order('monthly_xp', {ascending: false}).match({guild_id: guild_id});
  if (error) {
    throw new SupabaseException(error)
  } else if (data.length > 0) {
    return data
  } else {
    throw new SupabaseNullDataException()
  }
}

async function reset(guild_id) {
  logger.info(`Resetting database for guild with id ${guild_id}.`)
  const {data, error} = await supabase.from('Members').update({xp: 0, messages: 0, characters: 0, level: 0, monthly_xp: 0, monthly_messages: 0, monthly_characters: 0}).match({guild_id: guild_id})
  if (error) {
    throw new SupabaseException(error)
  }
  return true
}

async function resetMonthly(guild_id) {
  logger.info(`Resetting monthly database for guild`)
  const {data, error} = await supabase.from('Members').update({monthly_xp: 0, monthly_messages: 0, monthly_characters: 0}).match({guild_id: guild_id})
  if (error) {
    throw new SupabaseException(error)
  }
  return true
}


module.exports = {
  // SUPABASE CLIENT
  supabase: supabase,
  // USERS
  getUser: getUser,
  upsertUser: upsertUser,
  // GUILDS
  upsertGuild: upsertGuild,
  upsertGuilds: upsertGuilds,
  getRoleSpecs: getRoleSpecs,
  updateRoleSpecs: updateRoleSpecs,
  // MEMBERS
  getMember: getMember,
  insertMember: insertMember,
  updateMember: updateMember,
  // LEADERBOARD
  getLeaderboard: getLeaderboard,
  getMonthlyLeaderboard: getMonthlyLeaderboard,
  reset: reset,
  resetMonthly: resetMonthly,
}
