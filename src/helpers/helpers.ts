import { Row } from "./types";

const csvColumns = ['text', 'priority', 'duration', 'startDelay'] as const;
const textIndex = 0;
const priorityIndex = 1;
const durationIndex = 2;
const startDelayIndex = 3;

/**
 * Parses csv
 * @param content
 * @returns csv content in array format
 */
export function parseCSV(content: string): Row[] {
  const rows = content.split('\n');
  const parsedArr = rows.map((row): Row => {
    const values = row.split(',');
    let mappedRow: Row = { text: '', priority: 0, duration: 0, startDelay: 0 };

    if (values.length === csvColumns.length) {
      const text = values[textIndex];
      const priority = parseInt(values[priorityIndex]);
      const duration = parseInt(values[durationIndex]);
      const startDelay = parseInt(values[startDelayIndex]);
      if (
        typeof text === 'string'
        && !isNaN(priority)
        && !isNaN(duration)
        && !isNaN(startDelay)
      ) {
        mappedRow = { text, priority, duration, startDelay } as Row;
      }
    }
    return mappedRow
  }).filter(row => !!row.text);

  return !!parsedArr.length ? parsedArr : failure
}

/**
 * Loads csv
 * @param file
 * @returns promise with the csv content
 */
export function loadCSV(file: File): Promise<Row[]> {
  return new Promise((resolve, reject) => {
    if (file?.type === "text/csv") {
      const reader = new FileReader();

      const readerLister = (event: ProgressEvent<FileReader>) => {
        resolve(parseCSV(event.target?.result as string || ''));
        reader.removeEventListener('load', readerLister);
        reader.removeEventListener('error', reject);
      }

      reader.addEventListener('load', readerLister);
      reader.addEventListener('error', () => {
        reject();
        reader.removeEventListener('load', readerLister);
        reader.removeEventListener('error', reject);
      });
      reader.readAsText(file);
    } else {
      resolve(failure);
    }
  })

}
// if you upload a bad file, you're just testing me. :P
const failure = [
  { text: `BIG`, priority: 1, duration: 1400, startDelay: 100 },
  { text: `BADA`, priority: 2, duration: 1000, startDelay: 500 },
  { text: `BOOM!!!`, priority: 3, duration: 500, startDelay: 1000 },
  { text: `You happy?`, priority: 1, duration: 800, startDelay: 1800 },
  { text: `It's broken now.`, priority: 1, duration: 800, startDelay: 2700 },
]