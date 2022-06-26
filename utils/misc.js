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

async function guildInfoFormat(guild) {
  return `[name: ${guild.name} id: ${guild.id}]`
}
async function userInfoFormat(user) {
  return `[name: ${user.name} id:${user.id}]`
}

module.exports = {
  getCompliment: getCompliment,
  guildInfoFormat: guildInfoFormat,
  userInfoFormat: userInfoFormat,
}
