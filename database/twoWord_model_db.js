import { DataTypes, Sequelize } from "sequelize";
import SQL3 from "sqlite3";
import { SQLRequestAsync } from "./utils.js";

const databaseName = "asuka";
const SQL = new Sequelize(`sqlite:${databaseName}.db`, { logging: false });
const Asuka = new SQL3.Database(`./${databaseName}.db`, SQL3.OPEN_READONLY, (e) => { console.log(e) });

const SQLCOde = "SELECT name FROM sqlite_schema WHERE type ='table' ";
const response = (await SQLRequestAsync("all", SQLCOde, Asuka)).map(x => x.name).filter(x => /^COUNT - /.test(x));

const modelAttributes = {
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
    "PROBABILITY": {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
};
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

response.forEach(async table => {

    const count = SQL.define(table, tableAttributes,
        {
            tableName: table,
            timestamps: false,
        });
    count.removeAttribute('id');
    await count.sync({ alter: { alter: true, drop: false } });
    const totalRows = await count.count();

    const name = table.replace(/^COUNT/, "MODEL");
    const model = SQL.define(name, modelAttributes,
        {
            tableName: name,
            timestamps: false,
        });
    model.removeAttribute('id');
    await model.sync({ alter: { alter: true, drop: false } });

    let i = 0, entry = 1, lastProgress = -1;
    while (entry) {

        const progress = i / totalRows;
        if (progress - lastProgress > 0.001) {
            console.log("Table:", name.slice(8));
            console.log("Current index:", i);
            console.log(Math.round(progress * 100 * 10) / 10, "%");
            lastProgress = i / totalRows;
        }

        entry = await count.findOne({ where: {}, offset: i });
        if (!entry) { console.log("Empty response"); i++; continue; };
        const { dataValues } = entry;
        const resultValue = {
            "FIRST WORD": dataValues["FIRST WORD"],
            "SECOND WORD": dataValues["SECOND WORD"],
            "NEXT WORD": dataValues["NEXT WORD"],
        };
        if (resultValue["NEXT WORD"] == "<!TOTAL COUNT!>") { i++; continue; };

        const totalSearch = {
            ...resultValue
            , "NEXT WORD": "<!TOTAL COUNT!>"
        };

        const total = await count.findOne({ where: totalSearch });
        const probability = entry.dataValues.COUNT / total.dataValues.COUNT;

        await model.create({ ...resultValue, "PROBABILITY": probability });

        i++;
    }

    console.log(`${table.slice(8)} is done`);
});