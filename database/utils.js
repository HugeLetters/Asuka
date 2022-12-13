// Use await when calling this to get a sync result which isn't supported natively by sqlite3
// kudos to https://stackoverflow.com/a/74588004/7359892
export const SQLRunRequestAsync = (sql, database) => (new Promise((resolve, reject) => (
    database.run(sql, [], (error, result) => {
        if (error) { console.log(error); return reject("SQL Request error") };
        return resolve(result);
    })
)));
export const SQLGetRequestAsync = (sql, database) => (new Promise((resolve, reject) => (
    database.get(sql, [], (error, result) => {
        if (error) { console.log(error); return reject("SQL Request error") };
        return resolve(result);
    })
)));