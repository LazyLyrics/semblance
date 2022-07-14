function msgXP(length) {
  return 1
}

function xpForLevel(level) {
  return level * 5
}

function getLevel(xp) {
  return Math.floor(xp / 5)
}

function getXPInfo(xp) {
  console.log("xp " + xp)

  const thisLevel = getLevel(xp)
  console.log("this level " + thisLevel)

  const xpForThisLevel = xpForLevel(thisLevel)
  console.log("xpForThisLevel " + xpForThisLevel)

  const xpForNext = xpForLevel(thisLevel + 1)
  console.log("xp for next " + xpForNext)

  const xpUntilNext = xpForNext - xp
  console.log("xpUntilNext " + xpUntilNext)

  const xpBetweenLevels = xpForLevel(thisLevel + 1) - xpForLevel(thisLevel)
  console.log("xp between levels " + xpBetweenLevels)

  const xpPastLastLevel = xp - xpForLevel(thisLevel)
  console.log("xp past last level " + xpPastLastLevel)

  let percentageUntilNext
  if (xpPastLastLevel != 0) {
    percentageUntilNext = xpPastLastLevel / xpBetweenLevels
  } else {
    percentageUntilNext = 0
  }
  console.log("percentageUntilNext " + percentageUntilNext)
  return {thisLevel, xpForNext, xpUntilNext, xpBetweenLevels, percentageUntilNext}
}

module.exports = {
  msgXP: msgXP,
  xpForLevel: xpForLevel,
  getLevel: getLevel,
  getXPInfo: getXPInfo
}
