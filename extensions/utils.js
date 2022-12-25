import { readdirSync, readFileSync } from 'fs';

export const randomInteger = (min = 0, max = min + 100) => (Math.floor(Math.random() * (max - min + 1) + min));

export const randomChoiceArray = (arr) => (arr[randomInteger(0, arr.length - 1)]);

// Object containing pairs of choices and weights. Weights must sum up to 1
export const randomWeightedChoiceObject = (object) => {
  const values = Object.keys(object);
  const weights = values.map(x => object[x]);
  let selector = Math.random();
  let choice = values.length - 1;
  // Using some instead of forEach to have an option to exit loop preempitvely
  weights.some((e, i) => {
    selector -= e;
    if (selector <= 0) { choice = i; return true; };
  })
  return values[choice];
}

export const randomFile = (folder) => {
  const files = readdirSync(folder);
  const filename = randomChoiceArray(files);
  const filepath = folder + "/" + filename;
  let fileBuffer = new Blob([readFileSync(filepath)]);
  return { data: fileBuffer, filename };
}

