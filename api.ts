import axios from 'axios';
import { config, GetHistoryParamsObj, Item } from './sanitize';
import { logError } from './util';

export async function getHistory({
  start,
  limit,
  cat,
  search,
  nzoIds,
  lastHistoryUpdate,
}: GetHistoryParamsObj = {}) {
  try {
    const res = await axios.get(config.apiUrl, {
      params: {
        mode: 'history',
        start: start,
        limit: limit || Number.MAX_SAFE_INTEGER,
        cat: cat,
        search: search,
        nzo_ids: nzoIds?.join() !== '' ? nzoIds?.join() : undefined,
        last_history_update: lastHistoryUpdate || 0,
      },
    });
    return res.data.history;
  } catch (err) {
    await logError('Error getting history', err);
  }
}

export async function removeHistoryItems(items: Item[]) {
  try {
    const res = await axios.get(config.apiUrl, {
      params: {
        mode: 'history',
        name: 'delete',
        value: items.map((i) => i.nzo_id).join(),
        del_files: 1,
      },
    });
    return res.data.status;
  } catch (err) {
    await logError('Error deleting history items', err);
  }
}

export async function getWarnings() {
  try {
    const res = await axios.get(config.apiUrl, {
      params: {
        mode: 'warnings',
      },
    });
    return res.data.warnings;
  } catch (err) {
    await logError('Error getting warnings', err);
  }
}

export async function clearAllWarnings() {
  try {
    const res = await axios.get(config.apiUrl, {
      params: {
        mode: 'warnings',
        name: 'clear',
      },
    });
    return res.data;
  } catch (err) {
    await logError('Error clearing all warnings', err);
  }
}
