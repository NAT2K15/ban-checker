const { Client, MessageEmbed } = require('discord.js');
const client = new Client({
    intents: ['GUILDS', 'GUILD_MESSAGES', "GUILD_MESSAGE_REACTIONS", "DIRECT_MESSAGES", "GUILD_MEMBERS", "GUILD_BANS", "GUILD_INTEGRATIONS", "GUILD_WEBHOOKS", "GUILD_INVITES", "GUILD_VOICE_STATES", "GUILD_PRESENCES", "GUILD_MESSAGE_TYPING", "DIRECT_MESSAGE_REACTIONS", "DIRECT_MESSAGE_TYPING"],
    partials: ["CHANNEL", "MESSAGE", "REACTIONS"],
    allowedMentions: { parse: ['users', 'roles', 'everyone'], repliedUser: true }
});
const config = require('./config.json');
let guild = undefined;
client.once('ready', () => {
    let status = config.settings.status;
    if (!status) {
        if (config.settings.debug) {
            console.log(`^1[ERROR]^7 You did not input a value within the status config. Status has been set to ^3"Watching Made by NAT2K15"^7`)
        }
        status = "Made by NAT2K15"
    }
    let serverid = config.settings.server_id;
    if (!serverid && config.settings.debug) {
        console.log(`^1[ERROR]^7 I was not able to find the server ID. Ensure you have a vaild server ID within the config.`)
    } else {
        guild = client.guilds.cache.get(serverid)
        if (!guild) {
            console.log(`^1[ERROR]^7 I was not able to find the server "${config.settings.server_id}". Ensure the bot is in your server or you have put a vaild server ID within the config.`)
        }
    }
    if (config.settings.debug) {
        if (guild !== undefined) {
            console.log(`^3[SYSTEM]^7 ${client.user.tag} is now online! Watching ${guild.name} || ${guild.id} bans.`)
        } else {
            console.log(`^3[SYSTEM]^7 ${client.user.tag} is now online!`)
        }
    }
    client.user.setActivity(`${status}`, { type: "WATCHING" })
})

on('playerConnecting', (name, setKickReason, deferrals) => {
    deferrals.defer()
    const player = global.source;
    let discord = "";
    let ip = ""
    let fivem = ""
    let steam = ""
    deferrals.update(`Hello ${name}. Your discord is being check within our ban database.`)
    for (let i = 0; i < GetNumPlayerIdentifiers(player); i++) {
        const identifier = GetPlayerIdentifier(player, i);
        if (identifier.includes('discord:')) {
            discord = identifier;
            discord = discord.split('discord:').pop()
        }
        if (identifier.includes('ip:')) {
            ip = identifier;
            ip = ip.split('ip:').pop()
        }
        if (identifier.includes('steam:')) {
            steam = identifier;
            steam = steam.split('steam:').pop()
        }
        if (identifier.includes('fivem:')) {
            fivem = identifier;
            fivem = fivem.split('fivem:').pop()
        }
    }
    if (guild == undefined) return;
    let server = client.guilds.cache.get(config.settings.server_id)

    if (discord) {
        let banned = false;
        server.bans.fetch().then(bans => {
            bans.forEach(user => {
                if (user.id == discord) {
                    banned = true;
                    deferrals.done(config.settings.message)
                    if (config.logging.enable) {
                        let channel = client.channels.cache.get(config.logging.channel)
                        if (!channel && config.settings.debug) {
                            console.log(`^1[ERROR]^7 You do not have a vaild channel ID within config.`)
                        } else {
                            let e1 = new MessageEmbed();
                            e1.setColor(config.embed.color)
                            e1.setFooter({ text: config.embed.footer })
                            e1.setTimestamp()
                            e1.setTitle(`Action log | Connection rejected`)
                            e1.addField(`Discord`, `<@${discord}> \`${discord}\``)
                            e1.addField(`Steam name`, name)
                            e1.addField(`Steam Hex`, steam)
                            e1.addField(`FiveM`, fivem)
                            if (config.logging.display_ip) {
                                e1.addField(`Ip`, `||${ip}||`)
                            }
                            e1.addField(`Reason`, `Connection rejected since the user is banned from ${server.name}`)
                            channel.send({ embeds: [e1] })
                        }
                    }
                } else {
                    if (banned) {
                        banned = true;
                    } else {
                        banned = false;
                    }
                }
            })
        })
        if (!banned) {
            setTimeout(() => {
                deferrals.done()
            }, 2000);
        }
    }
})


client.login(config.settings.token).catch(e => {
    if (e && config.settings.debug) {
        console.log(`^1[ERROR]^7 You have an invalid token within config.`)
    }
})