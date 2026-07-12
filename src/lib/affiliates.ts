/* ===== AFFILIATE BOOKING LINKS ===== */

export interface AffiliateLink {
  name: string
  url: string
}

/**
 * Returns affiliate booking links for a given destination and type.
 * - 'stay': Booking.com + Airbnb
 * - 'transport': MakeMyTrip flights from DEL
 */
export function getAffiliateLinks(destination: string, type: string): AffiliateLink[] {
  const encoded = encodeURIComponent(destination)

  if (type === 'stay') {
    return [
      {
        name: 'Booking.com',
        url: `https://www.booking.com/searchresults.html?ss=${encoded}`,
      },
      {
        name: 'Airbnb',
        url: `https://www.airbnb.com/s/${encoded}/homes`,
      },
    ]
  }

  if (type === 'transport') {
    return [
      {
        name: 'MakeMyTrip Flights',
        url: `https://www.makemytrip.com/flights?from=DEL&to=${encoded}`,
      },
    ]
  }

  return []
}
