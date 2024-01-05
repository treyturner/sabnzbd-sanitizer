import * as api from './api';
import axios from 'axios';
import { pad, pluralize } from './util';

if (!process.env.CATEGORIES || !process.env.API_URL || !process.env.API_KEY) {
  console.error(
    'API_URL, API_KEY, and CATEGORIES environment variables must be defined.'
  );
  process.exit(1);
}

const maxPollSecsRaw = parseInt(process.env.MAX_POLL_SECS || '');
export const config = {
  categories: process.env.CATEGORIES.split(',').map((c) =>
    c.trim().toLowerCase()
  ),
  apiUrl: process.env.API_URL,
  apiKey: process.env.API_KEY,
  maxPollSecs: Number.isInteger(maxPollSecsRaw) ? maxPollSecsRaw : 120,
  clearWarnings: process.env.CLEAR_WARNINGS === 'false' ? false : true,
};
let pollSecs = 1;
let lastHistoryUpdate: number;

export type Item = {
  category: string;
  nzo_id: string;
  name: string;
  status: string;
};

export type GetHistoryParamsObj = {
  start?: number;
  limit?: number;
  cat?: string;
  search?: string;
  nzoIds?: string[];
  lastHistoryUpdate?: number;
};

const fmtTime = () => {
  const d = new Date();
  return (
    `${d.getFullYear()}-` +
    `${pad(d.getMonth() + 1)}-` +
    `${pad(d.getDate())} ` +
    `${pad(d.getHours())}:` +
    `${pad(d.getMinutes())}:` +
    `${pad(d.getSeconds())}`
  );
};

async function sanitize() {
  let actionTaken = false;
  if (config.clearWarnings) {
    actionTaken = await sanitizeWarnings();
  }
  actionTaken = (await sanitizeHistory()) || actionTaken;
  adjustPollSecs(actionTaken);
  // console.log(`${fmtTime()} Sleeping ${pollRate} second${pluralize(pollRate)}...`)
  setTimeout(sanitize, pollSecs * 1000);
}

async function sanitizeWarnings() {
  const warnings: { text: string }[] = await api.getWarnings();
  let clearedWarnings = false;
  if (typeof warnings === 'object' && warnings.length) {
    if (
      config.categories.some((category) =>
        warnings.some(
          (warning) =>
            warning.text.toLowerCase().includes(category) ||
            warning.text.includes('Your UNRAR version is')
        )
      )
    ) {
      clearedWarnings = true;
      await api.clearAllWarnings();
      console.log(
        `${fmtTime()} Cleared ${warnings.length} warning${pluralize(warnings)}.`
      );
    }
  }
  return clearedWarnings;
}

async function sanitizeHistory() {
  const history: { slots: Item[]; last_history_update: number } =
    await api.getHistory({ lastHistoryUpdate: lastHistoryUpdate });
  if (typeof history === 'object' && history !== null && history.slots.length) {
    lastHistoryUpdate = history.last_history_update;
    const filterFn = (i: Item) => {
      return (
        ['Completed', 'Failed'].includes(i.status) &&
        (config.categories.includes(i.category) ||
          config.categories.some((c) => i.name.toLowerCase().includes(c)))
      );
    };
    const items = history.slots.filter((i) => filterFn(i));
    if (items.length) {
      const result = await api.removeHistoryItems(items);
      if (result) {
        console.log(
          `${fmtTime()} Sanitized ${items.length} history item${pluralize(
            items
          )}:\n${JSON.stringify(items, null, 2)}`
        );
      } else {
        console.log(
          `${fmtTime()} Something went wrong trying to sanitize ${
            items.length
          } items.`
        );
      }
    }
    return items.length > 0;
  }
  return false;
}

function adjustPollSecs(actionTaken: boolean) {
  if (actionTaken) {
    pollSecs = 5;
  } else {
    // console.log(`${fmtTime()} No action necessary.`)
    if (pollSecs + 5 <= config.maxPollSecs) {
      pollSecs += 5;
    } else {
      pollSecs = config.maxPollSecs;
    }
  }
}

axios.defaults.params = {
  apikey: config.apiKey,
  output: 'json',
};

console.info(`${fmtTime()} sabnzbd-sanitizer initialized.`);
sanitize();
