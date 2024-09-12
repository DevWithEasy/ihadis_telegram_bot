require('dotenv').config();
const {Telegraf} = require('telegraf');
const Command = require('./Command');

//create a new bot instance
const bot = new Telegraf(process.env.BOT_TOKEN)

const command = new Command(bot)
command.init()

//run the bot
bot.launch()
console.log('Bot started successfully');