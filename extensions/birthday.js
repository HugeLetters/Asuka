import { DataTypes, Sequelize } from "sequelize";
import moment from "moment";
import { tagUser } from "../message_handlers/utils.js";

export const alias = {
  birthday: ["др", "днюха", "деньрождения", "bday", "birthday"],
};

export const birthday = async (data, bot, command, [subcommand, ...keywords]) => {
  ((
    {
      добавь: add,
      напомни: add,
      удали: del,
      забудь: del,
      список: list,
      перечисли: list,
    }[subcommand] ?? unrecognised
  )(data, bot, keywords));
};

const add = async ({ channel_id, id: message_id, author: { id: author_id } }, bot, keywords) => {
  if (keywords.length < 2)
    return bot.sendMessage(channel_id, "Укажи имя и дату, д-д-дурак!", { message_id });

  const WHO = keywords.slice(0, -1).join(" ");

  let date = moment(keywords[keywords.length - 1], "DMY");

  if (!date.isValid())
    return bot.sendMessage(channel_id, "Укажи нормальную дату, идиот...", { message_id });

  date = moment(date).year(moment().year());
  if (date.isBefore(moment())) date = moment(date).year(moment().year() + 1);

  await table.create({ DATE: date.toDate(), WHO, BY: author_id, CHANNEL: channel_id });

  bot.sendMessage(channel_id, `Напомню тебе в эту дату: ${date.format("DD.MM.Y")}`, { message_id });
  return checkBirthdays(bot);
};

const del = async ({ channel_id, id: message_id, author: { id: author_id } }, bot, keywords) => {
  if (keywords.length < 1)
    return bot.sendMessage(channel_id, "Кого удалять-то?! 😠", { message_id });

  const deleted = await table.destroy({
    where: { WHO: keywords.join(" "), BY: author_id, CHANNEL: channel_id },
  });
  return bot.sendMessage(channel_id, `Удалила напоминаний: ${deleted}`, { message_id });
};

const list = async ({ channel_id, id: message_id }, bot) => {
  const result = (await table.findAll({ where: { CHANNEL: channel_id } })).map(
    ({ dataValues: { DATE, WHO, BY } }) =>
      `${WHO} - ${moment(DATE).format("DD.MM.Y")}. Добавил ${tagUser(BY)}`
  );

  return bot.sendMessage(channel_id, `Вот они сверху вниз:\n${result.join("\n")}`, { message_id });
};

const unrecognised = async ({ channel_id, id: message_id }, bot) => {
  return bot.sendMessage(channel_id, `Не знаю такую команду 😥`, { message_id });
};

const databaseName = "database/asuka";
const SQL = new Sequelize(`sqlite:${databaseName}.db`, { logging: false });
const table = SQL.define(
  "BIRTHDAYS",
  {
    DATE: { type: DataTypes.DATEONLY },
    WHO: { type: DataTypes.TEXT, defaultValue: "хуй знает кого" },
    BY: { type: DataTypes.STRING },
    CHANNEL: { type: DataTypes.STRING },
  },
  { tableName: "BIRTHDAYS", timestamps: false }
);
table.removeAttribute("id");
await table.sync({ alter: { alter: true, drop: false } });

export default function (bot) {
  checkBirthdays(bot);
  setInterval(() => {
    checkBirthdays(bot);
  }, 1000 * 60 * 60 * 6);
}

function checkBirthdays(bot) {
  table.findAll().then(results =>
    results.forEach(async ({ WHO, BY, DATE, CHANNEL }) => {
      if (moment(DATE).isBefore(moment())) {
        bot.sendMessage(
          CHANNEL,
          `${tagUser(BY)}, сегодня праздник у ${WHO}. ${WHO}, с днем рождения!!!!`
        );
        await table.update(
          { DATE: moment(DATE).year(moment().year() + 1) },
          { where: { WHO, DATE, BY, CHANNEL } }
        );
      }
    })
  );
}
