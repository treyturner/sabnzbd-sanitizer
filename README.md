# sabnzbd-sanitizer

This tiny Node app polls your SABnzbd history via API and removes a category of NZBs.

It will poll often after finding something that requires cleaning, and slow down in periods of inactivity.

Additionally makes an attempt to remove warnings that contain the name of the supplied categories.

## Usage

I recommended you build a Docker image using the supplied `Dockerfile`:

```
docker build . -t sabnzbd-sanitizer
```

You can then start up a container:

```
docker run -it --rm \
  -e API_URL=http://your.ip.address.here:8080/api \
  -e API_KEY=your_sabnzbd_api_key \
  -e CATEGORIES=yyy \
  sabnzbd-sanitizer
```

Or add a service to your SABnzbd stack's `docker-compose.yml`:

```
sanitizer:
  image: sabnzbd-sanitizer
  container_name: sabnzbd_sanitizer
  environment:
    - API_URL=http://your.ip.address.here:8080/api
    - API_KEY=your_sabnzbd_api_key
    - CATEGORIES=yyy
  restart: unless-stopped
```
