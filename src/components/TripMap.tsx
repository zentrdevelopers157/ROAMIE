import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

/* ===== MARKER STYLES ===== */
let mapboxCssLoaded = false

const markerStyleId = 'roamie-marker-style'

function injectMarkerStyles() {
  if (document.getElementById(markerStyleId)) return
  const style = document.createElement('style')
  style.id = markerStyleId
  style.textContent = `
    .roamie-marker {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #00D4C4;
      border: 3px solid rgba(0, 212, 196, 0.4);
      box-shadow: 0 0 15px rgba(0, 212, 196, 0.6);
      cursor: pointer;
      transition: transform 0.2s ease;
      position: relative;
    }
    .roamie-marker::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: rgba(0, 212, 196, 0.2);
      transform: translate(-50%, -50%) scale(1);
      animation: roamiePulse 2s ease-in-out infinite;
      pointer-events: none;
    }
    .roamie-marker:hover {
      transform: scale(1.4);
    }
    @keyframes roamiePulse {
      0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
      50% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
      100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
    }
    .roamie-marker-inner {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #ffffff;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 4px rgba(255, 255, 255, 0.5);
    }
    .mapboxgl-popup-content {
      background: #14141F !important;
      color: #F0F0F5 !important;
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      padding: 10px 14px !important;
      border-radius: 8px !important;
      border: 1px solid rgba(0, 212, 196, 0.15);
      box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
    }
    .mapboxgl-popup-tip {
      border-top-color: #14141F !important;
    }
  `
  document.head.appendChild(style)
}

/* ===== TYPES ===== */
export interface MapActivity {
  name: string
  coordinates: [number, number]
}

/* ===== TRIP MAP COMPONENT ===== */
export default function TripMap({ activities }: { activities: MapActivity[] }) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const initialized = useRef(false)

  useEffect(() => {
    // Dynamically load Mapbox CSS only when this component renders
    if (!mapboxCssLoaded) {
      mapboxCssLoaded = true
      import('mapbox-gl/dist/mapbox-gl.css').catch(() => {
        console.warn('Failed to load Mapbox CSS')
      })
    }

    injectMarkerStyles()

    if (!mapContainer.current || initialized.current) return

    const token = import.meta.env.VITE_MAPBOX_TOKEN
    if (!token || token === 'pk.your-key') {
      console.warn('TripMap: Mapbox token not configured. Set VITE_MAPBOX_TOKEN in .env')
      return
    }

    mapboxgl.accessToken = token
    initialized.current = true

    // Compute bounds from activities or use a default
    const coords = activities.length > 0
      ? activities.map((a) => a.coordinates)
      : [[77.1891, 32.2430] as [number, number]]

    // Center on the first activity
    const center = coords[0]

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center,
      zoom: 12,
      attributionControl: false,
    })

    mapRef.current = map

    map.on('load', () => {
      if (!map) return

      // Add markers with pulsing cyan dots
      activities.forEach((activity) => {
        const el = document.createElement('div')
        el.className = 'roamie-marker'

        // Inner white dot
        const inner = document.createElement('div')
        inner.className = 'roamie-marker-inner'
        el.appendChild(inner)

        new mapboxgl.Marker({ element: el })
          .setLngLat(activity.coordinates)
          .setPopup(
            new mapboxgl.Popup({ offset: 22, closeButton: false }).setText(activity.name),
          )
          .addTo(map)
      })

      // Add connecting line if 2+ activities
      if (activities.length >= 2) {
        const coordinates = activities.map((a) => a.coordinates)

        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates,
            },
          },
        })

        map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-width': 3,
            'line-gradient': [
              'interpolate',
              ['linear'],
              ['line-progress'],
              0,
              '#00D4C4',
              1,
              '#8A2BE2',
            ],
          },
        })
      }

      // Fit bounds to show all markers
      if (coords.length > 1) {
        const bounds = coords.reduce(
          (b, c) => b.extend(c),
          new mapboxgl.LngLatBounds(coords[0], coords[0]),
        )
        map.fitBounds(bounds, { padding: 60, maxZoom: 14 })
      }
    })

    return () => {
      map.remove()
      mapRef.current = null
      initialized.current = false
    }
  }, [activities])

  return (
    <div
      ref={mapContainer}
      className="w-full rounded-2xl overflow-hidden"
      style={{ height: '300px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
    />
  )
}
