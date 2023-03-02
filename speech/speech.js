import { DataTypes, Sequelize } from "sequelize";
import SQL3 from "sqlite3";
import { SQLRequestAsync } from "../database/utils.js";
import { randomChoiceArray, randomWeightedChoiceObject } from "../extensions/utils.js";

export const databaseToSpeechObject = async database => {
  const SQL = new Sequelize(`sqlite:${database}.db`, { logging: false });
  const Asuka = new SQL3.Database(`./${database}.db`, SQL3.OPEN_READONLY, e => console.error(e));

  const SQLCOde = "SELECT name FROM sqlite_schema WHERE type ='table'";
  const tables = (await SQLRequestAsync("all", SQLCOde, Asuka))
    .map(x => x.name)
    .filter(x => /^MODEL - /.test(x));
  const modelAttributes = {
    "FIRST WORD": {
      type: DataTypes.TEXT,
      defaultValue: "<!ANY!>",
    },
    "SECOND WORD": {
      type: DataTypes.TEXT,
      defaultValue: "<!END!>",
    },
    "NEXT WORD": {
      type: DataTypes.TEXT,
      defaultValue: "<!END!>",
    },
    PROBABILITY: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  };

  const result = await Promise.all(
    tables.map(async table => {
      const model = SQL.define(table, modelAttributes, { tableName: table, timestamps: false });
      model.removeAttribute("id");
      model.sync({ alter: { alter: true, drop: false } });
      const name = table.slice(8);
      const entry = await model.findAll({});
      return new Promise(async (resolve, reject) => {
        if (!entry) reject("Empty response");
        const model = {};
        entry.forEach(x => {
          x = x.dataValues;
          if (typeof model[x["FIRST WORD"]] != "object") {
            model[x["FIRST WORD"]] = {};
          }
          if (typeof model[x["FIRST WORD"]][x["SECOND WORD"]] != "object") {
            model[x["FIRST WORD"]][x["SECOND WORD"]] = {};
          }

          model[x["FIRST WORD"]][x["SECOND WORD"]][x["NEXT WORD"]] = x["PROBABILITY"];
        });
        const singleModel = {};
        singleModel[name] = model;
        resolve(singleModel);
      });
    })
  );

  const model = {};
  result.forEach(x => Object.assign(model, x));

  return model;
};

export const generateSentence = (bot, user, keywords, maxLength, randomWordChance) => {
  const model = bot.speechModel[user];
  const sentence = ["<!START!>"];

  if (keywords.length) {
    keywords.forEach(x => sentence.push(x));
  } else {
    sentence.push(randomChoiceArray(Object.keys(model["<!START!>"])));
  }

  let sentenceLength = 0;
  while (sentenceLength <= maxLength) {
    const [FIRST, SECOND] = sentence.slice(-2);
    if (SECOND.length > 1) {
      if (SECOND.length < 3) {
        sentenceLength += 0.3;
      } else {
        sentenceLength++;
      }
    }
    if (SECOND == "<!END!>") {
      sentence.pop();
      if (sentence.length < maxLength / 2) {
        sentence.push(".");
        sentence.push(generateNextWord(model, "."));
        continue;
      }
      break;
    }
    const CHOICES = model?.[FIRST]?.[SECOND];
    if (Math.random() < randomWordChance) {
      sentence.push(generateNextWord(model, ""));
      continue;
    }
    if (!CHOICES) {
      sentence.push(generateNextWord(model, SECOND));
      continue;
    }
    let NEXT = randomWeightedChoiceObject(CHOICES);
    sentence.push(NEXT);
  }

  return sentence
    .filter(x => !/(<!START!>)|(<!END!>)|(<!ANY!>)/.test(x))
    .join(" ")
    .replace(/ ([^\wа-яё])/gi, "$1");
};

const generateNextWord = (model, word) => {
  if (typeof model[word] == "object") return randomChoiceArray(Object.keys(model[word]));
  return randomChoiceArray(Object.keys(model));
};
