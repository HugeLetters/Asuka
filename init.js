const guild = process.env.GUILD_ID;
const app = process.env.APP_ID;
const token = process.env.DISCORD_TOKEN
const headers = { "Authorization": `Bot ${token}` }
const protocol = { http: "https", websocket: "wss" }
let url = { http: `${protocol.http}://discord.com/api/v10` }