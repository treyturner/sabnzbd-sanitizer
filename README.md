# sabnzbd-sanitizer

This tiny Node app polls your SABnzbd history via API and removes one or more categories of NZBs.

It will poll often after finding something that requires cleaning, and slow down in periods of inactivity.

Additionally, by default, the script will clear **ALL** warnings/errors if **ANY** are found to include the name of the specified categories, as this might leak information about those categories. For this feature to work as expected, it is recommended to download the specified categories into file paths that include the category name. This behavior can be disabled by setting `CLEAR_WARNINGS` to `false`.

## Configuration

Requires setting environment variables for which a default is not supplied.

| Environment Variable | Description                                                | Example                            | Default    |
| -------------------- | ---------------------------------------------------------- | ---------------------------------- | ---------- |
| `API_URL`            | The full URL to your SABnzbd **API**                       | `http://192.168.1.100:8080/api`    | No default |
| `API_KEY`            | Your API key                                               | `3c64cc70468348138aa2964d257a7108` | No default |
| `CATEGORIES`         | A comma-separated list of categories to purge from history | `movies,music`                     | No default |
| `MAX_POLL_SECS`      | Max number of seconds between checks                       | `60`                               | `300`      |
| `CLEAR_WARNINGS`     | Clear all warnings if any contain the name of a category   | `false`                            | `true`     |

## Usage

I recommend you add the service to your SABnzbd stack's `docker-compose.yml`:

```
sanitizer:
  image: treyturner/sabnzbd-sanitizer
  container_name: sabnzbd_sanitizer
  environment:
    - API_URL=http://your.ip.address.here:8080/api
    - API_KEY=your_sabnzbd_api_key
    - CATEGORIES=yyy
  restart: unless-stopped
```

If you aren't using docker-compose, you can start a container without it:

```
docker run -d --rm \
  -e API_URL=http://your.ip.address.here:8080/api \
  -e API_KEY=your_sabnzbd_api_key \
  -e CATEGORIES=yyy \
  treyturner/sabnzbd-sanitizer
```
