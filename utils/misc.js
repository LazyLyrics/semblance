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

module.exports = {
  getCompliment: getCompliment
}
