function msgXP(length) {
  return 5 + Math.floor(Math.sqrt(2 * length))
}

function xpForLevel(level) {
  return Math.floor(Math.pow(level, 3))
}

function getLevel(xp) {
  return Math.floor(Math.cbrt(xp))
}

module.exports = {
  msgXP: msgXP,
  xpForLevel: xpForLevel,
  getLevel: getLevel
}
