let i = 0;
async function fetch(url: string) {
  console.log(++i);
  if (i < 10) {
    throw new Error("Fetch failed, muhahah");
  }
  return "Your data :)";
}
// test 5
const fetchData = (url: string) => {
  return new Promise(resolve => {
    const getDelay = (function () {
      let delay = 500;
      return () => Math.min(2000, (delay += 500));
    })();
    function tryFetch() {
      fetch(url)
        .then(resolve)
        .catch((e: Error) => {
          const delay = getDelay();
          console.error(`${e.message}\nFetch failed. Retrying in ${delay} seconds.`);
          setTimeout(tryFetch, delay);
        });
    }
    tryFetch();
  });
};

const myData = fetchData("please give me data!!");
myData
  .then(console.log)
  .catch(console.error)
  .finally(() => console.log("Finished!"));
