import * as api from './api'
import axios from 'axios'
import { pluralize } from './util'

if (!process.env.CATEGORIES || !process.env.API_URL || !process.env.API_KEY) {
  console.error("API_URL, API_KEY, and CATEGORIES environment variables must be defined.")
  process.exit(1)
}

const maxPollRateRaw = parseInt(process.env.POLL_RATE_SECS || '')
export const config = {
  categories: process.env.CATEGORIES.split(',').map(c => c.trim().toLowerCase()),
  apiUrl: process.env.API_URL,
  apiKey: process.env.API_KEY,
  maxPollRate: Number.isInteger(maxPollRateRaw) ? maxPollRateRaw : 300,
}
let pollRate = 1
let lastHistoryUpdate: number

export type Item = {
  category: string;
  nzo_id: string;
  loaded: boolean;
}

export type GetHistoryParamsObj = {
  start?: number;
  limit?: number;
  cat?: string;
  search?: string;
  nzoIds?: string[];
  lastHistoryUpdate?: number;
}

async function sanitize() {
  let actionTaken = await sanitizeWarnings()
  actionTaken = await sanitizeHistory() || actionTaken
  adjustPollTime(actionTaken)
  // console.log(`Sleeping ${pollRate} second${pluralize(pollRate)}...`)
  setTimeout(sanitize, pollRate * 1000)
}

async function sanitizeWarnings() {
  const warnings: {text: string}[] = await api.getWarnings()
  let clearedWarnings = false
  for (const warning of warnings) {
    for (const category of config.categories) {
      if (warning.text.toLowerCase().includes(category)) {
        clearedWarnings = true
        console.log(`Clearing warnings...`)
        await api.clearAllWarnings()
      }
    }
  }
  return clearedWarnings
}

async function sanitizeHistory() {
  const history: {slots: Item[], last_history_update: number} = await api.getHistory({lastHistoryUpdate: lastHistoryUpdate})
  if (typeof history === 'object' && history !== null && history.slots.length > 0) {
    lastHistoryUpdate = history.last_history_update
    const items = history.slots.filter(i => config.categories.includes(i.category) && !i.loaded)
    if (items.length > 0) {
      const result = await api.removeHistoryItems(items)
      if (result) {
        console.log(`Sanitized ${items.length} item${pluralize(items)}.`)
      } else {
        console.log(`Something went wrong trying to sanitize ${items.length} items.`)
      }
    }
    return items.length > 0
  }
  return false
}

function adjustPollTime(actionTaken: boolean) {
  if (actionTaken) {
    pollRate = 5    
  } else {
    // console.log(`No action necessary.`)
    if (pollRate * 2 <= config.maxPollRate) {
      pollRate *= 2
    } else {
      pollRate = config.maxPollRate      
    }
  }
}

axios.defaults.params = {
  apikey: config.apiKey,
  output: 'json',
}

console.info(`sabnzbd-sanitizer initialized.`)
sanitize()
