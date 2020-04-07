# Qvery (Currently Work In Progress)
## Client-Side Load Balancing for Everyone

Load Balancing has always added a ton of extra work, cost and complexity to systems. This library aims to solve that by introducing client-side Load Balancing. Today, large websites like Netflix and YouTube already use this technique for their CDNs but there is next to no information available on how to accomplish something similar.

Qvery makes it possible to easily - with no or next to **no configuration on your servers** - add inteligent loadbalancing to of your **API**, **Imag** and **Video CDNs**!

```js
import createQvery from "@qvery/core"

const qvery = createQvery({
  servers: [
    { base: 'de-12312333.example.io', region: 'eu-central' },
    { base: 'fr-23452345.example.io', region: 'eu-central' },
  ],
})

console.log(qvery.currentServer) // qvery inteligently selects the best server

```

## Features
* No added latency or cost from a dedicated loadbalancer 
* Server-independent location-based routing for faster response times
* Optional GeoIP based routing
* Optional Service-Discovery through DNS or your own API
* Includes multiple companion packages like a **ky**-based http API 

## Caveats
* This WONT load balance your html website - We recommend hosting these behind a CDN like cloudflare or netlify
* Qvery doesn't support sticky sessions (yet)