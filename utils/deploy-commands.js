require("dotenv").config()
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const logger = require("./logging")
const fs = require("node:fs")
const path = require("node:path")

const ENV = process.env

const CLIENT_ID = ENV.CLIENT_ID
const GUILD_ID = ENV.DEV_GUILD_ID
const BOT_TOKEN = ENV.BOT_TOKEN

const commands = []
const commandsPath = path.join(__dirname, "../commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"))

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath)
  commands.push(command.data.toJSON());
  logger.debug(`${command.data.name} command queued for registration.`)
}

const rest = new REST({ version: '9' }).setToken(BOT_TOKEN)

rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body : commands })
.then(() => logger.debug("Successfully registered application commands."))
.catch((error) => logger.error())
