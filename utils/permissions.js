function isAdmin(member) {
  return member.permissions.has("ADMINISTRATOR")
}

module.exports = {
  isAdmin: isAdmin
}
