import { DataTypes, Sequelize } from "sequelize";
import SQL3 from "sqlite3";
import { filterWordsWithRepeats, SQLRequestAsync } from "./utils.js";

const databaseName="asuka";
const SQL = new Sequelize(`sqlite:${databaseName}.db`, { logging: false });
const Asuka = new SQL3.Database(`./${databaseName}.db`, SQL3.OPEN_READONLY, (e) => { console.log(e) });

const tables = {};
const tableAttributes = {
    "FIRST WORD": {
        type: DataTypes.TEXT,
        defaultValue: "<!ANY!>"
    },
    "SECOND WORD": {
        type: DataTypes.TEXT,
        defaultValue: "<!END!>"
    },
    "NEXT WORD": {
        type: DataTypes.TEXT,
        defaultValue: "<!END!>"
    },
    "COUNT": {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
};

// GLOBAL TABLE
const serverTable = "COUNT - EVERYONE"
tables[serverTable] = SQL.define(serverTable, tableAttributes, {
    tableName: serverTable,
    timestamps: false,
    indexes: [{
        name: `SERVER - WORDS`,
        fields: [
            { name: "FIRST WORD", order: 'ASC', },
            { name: "SECOND WORD", order: 'ASC', },
        ]
    }]
}
);
tables[serverTable].removeAttribute('id');
await tables[serverTable].sync({ alter: { alter: true, drop: false } });

let response = 1;
let SQLCode;
const regExpWords = /\s+|https?:\/\/\S+|magnet:\?\S+|<@!?\d+>|@here|@everyone|(<:\S+:\d+>)|([^\w\s\dа-яё<]{2,})|([,\.!\?%\$]+)|[^\w\s\dа-яё]+/i;

const startIndex = 0;
const endIndex = 253000;

let index = startIndex;

const timerStart = new Date().getTime();
let timerInterval = timerStart;
let lastProgress = -1;

while (response && index <= endIndex) {

    const progress = (index - startIndex) / (endIndex - startIndex);
    if (progress - lastProgress > 0.0001) {
        console.log("Time elapsed since last update:", ("" + (new Date().getTime() - timerInterval) / 60000).slice(0, 4), "mins");
        console.log("Current index:", index);
        console.log(Math.round(progress * 100 * 100) / 100, "%");
        timerInterval = new Date().getTime();
        lastProgress = (index - startIndex) / (endIndex - startIndex);
    };

    // READ THE MESSAGE, SPLIT INTO WORDS + GET AUTHOR + ADD <!START!>, <!END!>
    SQLCode = `SELECT "message","author id","author" FROM "messages" LIMIT 1 OFFSET ${index}`;
    response = await SQLRequestAsync("get", SQLCode, Asuka);

    if (!response) { console.log("Empty response"); index++; continue; }
    let { message, "author": username, "author id": author } = response;

    // FILTER OUT SPACES AND OTHER NON-WORDS AND "AAAAAAAAAA" TYPE OF WORDS
    message = message.toLowerCase().split(regExpWords).filter(x => x != "" & x != undefined);
    message = filterWordsWithRepeats(message, 4).filter(x => x.length < 100);

    if (!message.length) { index++; continue; }

    message.push("<!END!>");
    message.push("<!END!>");
    message.unshift("<!START!>");

    // CHECK IF TABLE "AUTHOR" EXISTS
    //      IF NOT CREATE ONE WITH COLUMNS "FIRST WORD", "NEXT WORD" & "COUNT"
    const authorTable = `COUNT - ${author}[!${username}!]`;

    if (!Object.keys(tables).includes(authorTable)) {
        console.log(authorTable, " table created");
        tables[authorTable] = SQL.define(authorTable, tableAttributes, {
            tableName: authorTable,
            timestamps: false,
            indexes: [{
                name: `${author} - WORDS`,
                fields: [
                    { name: "FIRST WORD", order: 'ASC', },
                    { name: "SECOND WORD", order: 'ASC', },
                ]
            }]
        }
        );
        tables[authorTable].removeAttribute('id');
        await tables[authorTable].sync({ alter: { alter: true, drop: false } });
    };

    // LOOP THROUGH PAIRS OF WORDS EXCLUDING FINAL(<!END!>)
    for (let i = 0; i < message.length - 2; i++) {
        // SET TWO WORDS & NEXTWORD
        const [FIRSTWORD, SECONDWORD, NEXTWORD] = message.slice(i, i + 3);

        // SKIP THREE SAME WORDS IN A ROW
        if (FIRSTWORD == SECONDWORD && SECONDWORD == NEXTWORD) { continue; };

        // INCREMENT NEXT WORD COUNT
        let [entry] = await tables[authorTable].findOrCreate({ where: { "FIRST WORD": FIRSTWORD, "SECOND WORD": SECONDWORD, "NEXT WORD": NEXTWORD } });
        await entry.increment("COUNT", { by: 1 });
        // INCREMENT "TOTAL COUNT"
        [entry] = await tables[authorTable].findOrCreate({ where: { "FIRST WORD": FIRSTWORD, "SECOND WORD": SECONDWORD, "NEXT WORD": "<!TOTAL COUNT!>" } });
        await entry.increment("COUNT", { by: 1 });

        // IGNORE BOT MESSAGES IN SERVER MODEL
        if (author != "493197891125641227") {
            // SAME FOR ALL USERS TABLE
            [entry] = await tables[serverTable].findOrCreate({ where: { "FIRST WORD": FIRSTWORD, "SECOND WORD": SECONDWORD, "NEXT WORD": NEXTWORD } });
            await entry.increment("COUNT", { by: 1 });
            [entry] = await tables[serverTable].findOrCreate({ where: { "FIRST WORD": FIRSTWORD, "SECOND WORD": SECONDWORD, "NEXT WORD": "<!TOTAL COUNT!>" } });
            await entry.increment("COUNT", { by: 1 });
        }
    };

    index++;
};

console.log(`Done in: ${("" + (new Date().getTime() - timerStart) / 60000).slice(0, 4)} mins`);