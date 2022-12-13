import SQL from "sqlite3";
import "dotenv/config"
const config = await import("./config.js");

// ! database should already exists and have an empty table "messages"
const Asuka = new SQL.Database("./asuka.db", SQL.OPEN_READWRITE, (e) => { console.log(e) })

// ! specify
const channel_id = "";
const endpoint = `${config.HTTP_REQUEST_URL}/channels/${channel_id}/messages`
// ! write last message id
let message_id = "";
const checks = /(рей)|(rei)|(рэй)/i;
let response = [1];

const request_batch = async () => {

    console.log(message_id);

    response = await fetch(endpoint + "?limit=100&before=" + message_id, {
        method: "GET",
        headers: config.AUTHENTICATION_HEADER
    }).then(x => x.json());

    if (response == []) { console.log("Done"); return null }

    if (response.constructor !== Array) {
        console.log(response);
        setTimeout(() => {
            request_batch();
        }, response.retry_after * 1000);
        return null;
    }

    response.forEach(element => {
        let { id, content, author } = element;

        // filters
        const rei_command = content.slice(0, 3);
        if (checks.test(rei_command)) { content = content.slice(4) };
        if (content.slice(0, 4) == "вебм") { content = content.slice(5) };
        if (content.slice(0, 5) == "вебем") { content = content.slice(6) };
        if (!content.length || content.slice(0, 3) == "мем") { return null };
        content = content.replace(/"/g, "'")

        const sql = `INSERT INTO messages VALUES(${id},"${content}","${author.username}",${author.id})`;
        Asuka.run(sql, [], (error, r) => { if (error) { console.log(error); console.log(element) } })
    });

    message_id = response.slice(-1)[0].id;
    request_batch();
}

request_batch();