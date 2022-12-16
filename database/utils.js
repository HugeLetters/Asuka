// Use await when calling this to get a sync result which isn't supported natively by sqlite3
// kudos to https://stackoverflow.com/a/74588004/7359892
// Look through sqlite3 documentation to see which methods you can invoke - usually you'll need run, all & get
export const SQLRequestAsync = (request, SQLCode, database) => (new Promise((resolve, reject) => (
    database[request](SQLCode, [], (error, result) => {
        if (error) { console.log(error); return reject("SQL Request error") };
        return resolve(result);
    })
)));

export const filterWordsWithRepeats = (message, threshold) => (message.filter(element => {
    let chain = 0;
    element.split('').forEach((character, i, array) => {
        if (chain > threshold) { return null };
        if (!chain) { chain = 1; return null };
        if (character == array[i - 1] && !/\d/.test(character)) { chain++ } else { chain = 1 };
    });
    if (chain > threshold) { return false } else { return true };
}
));