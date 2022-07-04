const complimenter = require("complimenter")
const logger = require('./logging.js')

function capitalise(string) {
  lower = string.toLowerCase()
  upper = string.charAt(0).toUpperCase()
  return upper + lower.slice(1)
}

async function getCompliment() {
  return capitalise(complimenter()) + '!'
  }

function guildInfoFormat(guild) {
  return `[_GUILD_ name: ${guild.name} id: ${guild.id}]`
}
function userInfoFormat(user) {
  if (user.username) {
    return `[_USER_ name: ${user.username} id:${user.id}]`
  } else {
    return `[_MEMBER_ name: ${user.user.username} member_id:${user.id} user_id:${user.user.id}]`
  }
}

function roleInfoFormat(role) {
  return `[_ROLE_ name: ${role.name} id:${role.id}]`
}

module.exports = {
  getCompliment: getCompliment,
  guildInfoFormat: guildInfoFormat,
  userInfoFormat: userInfoFormat,
  roleInfoFormat: roleInfoFormat
}
