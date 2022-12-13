import { DataTypes, Sequelize } from "sequelize";
import SQL3 from "sqlite3";
import { SQLGetRequestAsync, SQLRunRequestAsync } from "./utils.js";

const SQL = new Sequelize('sqlite:asuka.db', { logging: false });
const Asuka = new SQL3.Database("./asuka.db", SQL.OPEN_READWRITE, (e) => { console.log(e) });
const queryIF = SQL.getQueryInterface();


// GLOBAL TABLE
const serverTableName = "COUNT - EVERYONE"
const serverTable = SQL.define(serverTableName, {
    "<!NEXT WORD!>": {
        type: DataTypes.TEXT,
        defaultValue: "<!END!>"
    },
    "<!END!>": {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: serverTableName,
    timestamps: false
}
);
serverTable.removeAttribute('id');
await serverTable.sync({ alter: { alter: true, drop: false } });
await serverTable.findOrCreate({ where: { "<!NEXT WORD!>": "<!TOTAL COUNT!>", "<!END!>": 1 } })
await serverTable.findOrCreate({ where: { "<!NEXT WORD!>": "<!END!>", "<!END!>": 1 } })

let response = 1;
let message_index = 0, SQLCode;
// const message_count_logging = 253204;
const message_count_logging = 1000;

// message_index = 890;
while (response && message_index < message_count_logging) {

    if ((message_index / message_count_logging * 100000) % 1 == 0) console.log(message_index / message_count_logging * 100, "%");

    // READ THE MESSAGE, SPLIT INTO WORDS + GET AUTHOR + ADD <!START!>, <!END!>
    SQLCode = `SELECT "message","author id","author" FROM "messages" LIMIT 1 OFFSET ${message_index}`;
    response = await SQLGetRequestAsync(SQLCode, Asuka);

    if (!response) { console.log("Empty response"); message_index++; continue; }
    let { message, "author": username, "author id": author } = response;
    message = message.toLowerCase().split(/ +/);
    if (message.slice(-1)[0] == "") { message = message.slice(0, -1) };
    if (message[0] == "") { message = message.slice(1) };
    message.push("<!END!>");
    message.unshift("<!START!>");

    // CHECK IF TABLE "AUTHOR" EXISTS
    //      IF NOT CREATE ONE WITH COLUMNS <!NEXT WORD!> & <!END!>(DEFAULT 0)
    const tableName = `COUNT - ${author}[!${username}!]`
    const authorTable = SQL.define(tableName, {
        "<!NEXT WORD!>": {
            type: DataTypes.TEXT,
            defaultValue: "<!END!>"
        },
        "<!END!>": {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        tableName: tableName,
        timestamps: false
    }
    );
    authorTable.removeAttribute('id');
    await authorTable.sync({ alter: { alter: true, drop: false } });

    //      ADD ROW <!NEXT WORD!>=<!TOTAL COUNT!>, <!END!>=1
    //      ADD ROW <!NEXT WORD!>=<!END!>,<!END!>=1
    await authorTable.findOrCreate({ where: { "<!NEXT WORD!>": "<!TOTAL COUNT!>", "<!END!>": 1 } });
    await authorTable.findOrCreate({ where: { "<!NEXT WORD!>": "<!END!>", "<!END!>": 1 } });

    // LOOP THROUGH WORDS EXCLUDING FINAL(<!END!>)
    for (let i = 0; i < message.length - 1; i++) {
        //      SET WORD & NEXTWORD
        const WORD = message[i];
        const NEXTWORD = message[i + 1];
        //      CHECK IF COLUMN "WORD" EXISTS
        if (!Object.keys(await queryIF.describeTable(tableName)).includes(WORD)) {
            //          IF NOT CREATE ONE(DEFAULT 0)
            try {
                await queryIF.addColumn(tableName, WORD, { type: DataTypes.INTEGER, defaultValue: 0 })

            } catch (e) {
                console.log(Object.keys(await queryIF.describeTable(tableName)).slice(-10, -1));
                console.log(WORD);
                throw e;
            }
        };
        //      CHECK IF COLUMN "<!NEXT WORD!>" HAS ROW "NEXTWORD"
        //          IF NOT CREATE ONE
        //      CHECK IF COLUMN "WORD" ROW "NEXTWORD" EQUALS 0
        //          IF YES SET IT TO 1
        //          IF NOT INCREMENT I
        let [entry] = await authorTable.findOrCreate({ where: { "<!NEXT WORD!>": NEXTWORD } });
        await entry.increment(WORD, { by: 1 });
        //      INCREMENT COLUMN "WORD" ROW "<!TOTAL COUNT!>" BY 1
        [entry] = await authorTable.findOrCreate({ where: { "<!NEXT WORD!>": "<!TOTAL COUNT!>" } });
        await entry.increment(WORD, { by: 1 });

        // SAME FOR ALL USERS TABLE
        if (!Object.keys(await queryIF.describeTable(serverTableName)).includes(WORD)) {
            try {
                await queryIF.addColumn(serverTableName, WORD, { type: DataTypes.INTEGER, defaultValue: 0 })

            } catch (e) {
                console.log(Object.keys(await queryIF.describeTable(serverTableName)).slice(-10, -1));
                console.log(WORD);
                throw e;
            }
        };
        [entry] = await serverTable.findOrCreate({ where: { "<!NEXT WORD!>": NEXTWORD } });
        await entry.increment(WORD, { by: 1 });
        [entry] = await serverTable.findOrCreate({ where: { "<!NEXT WORD!>": "<!TOTAL COUNT!>" } });
        await entry.increment(WORD, { by: 1 });
    };

    message_index++;
}