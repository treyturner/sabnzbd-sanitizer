import axios from 'axios'
import { config, GetHistoryParamsObj, Item } from './sanitize'

export function getHistory({start, limit, cat, search, nzoIds, lastHistoryUpdate}: GetHistoryParamsObj={}) {
  return axios
    .get(config.apiUrl, {
      params: {
        mode: 'history',
        start: start,
        limit: limit || Number.MAX_SAFE_INTEGER,
        cat: cat,
        search: search,
        nzo_ids: nzoIds?.join() !== '' ? nzoIds?.join() : undefined,
        last_history_update: lastHistoryUpdate || 0,
      }
    })
    .then(res => {
      return res.data.history
    })
    .catch(err => {
      console.error('Error getting history:')
      console.error(err.toJSON())
    })
}

export function removeHistoryItems(items: Item[]) {
  return axios
    .get(config.apiUrl, {
      params: {
        mode: 'history',
        name: 'delete',
        value: items.map(i => i.nzo_id).join(),
        del_files: 1,
      }
    })
    .then(res => {
      return res.data.status
    })
    .catch(err => {
      console.error('Error deleting history items:')
      console.error(err.toJSON())
    })
}

export function getWarnings() {
  return axios
    .get(config.apiUrl, {
      params: {
        mode: 'warnings'
      }
    })
    .then(res => {
      return res.data.warnings
    })
    .catch(err => {
      console.error('Error getting warnings:')
      console.error(err.toJSON())
    })
}

export function clearAllWarnings() {
  return axios
    .get(config.apiUrl, {
      params: {
        mode: 'warnings',
        name: 'clear'
      }
    })
    .then(res => {
      return res.data
    })
    .catch(err => {
      console.error('Error clearing all warnings:')
      console.error(err.toJSON())
    })
}
