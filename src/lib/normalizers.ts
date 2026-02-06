// FlyOn — Flight Data Normalizers v1.9.0 | 2026-02-06

import { parseDurationToMinutes } from './formatters';
import type {
  AmadeusFlightResponse,
  Flight,
  Layover,
  ReturnInfo,
} from './types';

export function normalizeFlightOffers(response: AmadeusFlightResponse): {
  flights: Flight[];
  carriers: Record<string, string>;
  aircraft: Record<string, string>;
} {
  const carriers = response.dictionaries?.carriers || {};
  const aircraftDict = response.dictionaries?.aircraft || {};

  const flights: Flight[] = (response.data || []).map((offer) => {
    const outbound = offer.itineraries[0];
    const returnItinerary = offer.itineraries[1] || null;
    const segments = outbound.segments;
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];

    // Calculate layovers between connecting segments
    const layovers: Layover[] = [];
    for (let i = 0; i < segments.length - 1; i++) {
      const arrivalTime = new Date(segments[i].arrival.at).getTime();
      const nextDepartureTime = new Date(segments[i + 1].departure.at).getTime();
      layovers.push({
        airport: segments[i].arrival.iataCode,
        duration: Math.round((nextDepartureTime - arrivalTime) / 60000),
      });
    }

    // Get fare details from first traveler, first segment
    const fareDetails = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0];
    const amenities = (fareDetails?.amenities || [])
      .filter((a) => !a.isChargeable)
      .map((a) => a.description);

    // Aircraft names for all segments (unique)
    const aircraftNames = segments
      .map((s) => aircraftDict[s.aircraft?.code] || s.aircraft?.code)
      .filter((v, i, a) => a.indexOf(v) === i);

    // Bag fee from additionalServices
    const bagFee = offer.price.additionalServices?.find(
      (s) => s.type === 'CHECKED_BAGS'
    )?.amount;

    const mainCarrier = offer.validatingAirlineCodes[0] || firstSegment.carrierCode;

    // Build return flight info
    let returnFlight: ReturnInfo | undefined;
    if (returnItinerary) {
      const retSegments = returnItinerary.segments;
      returnFlight = {
        stops: retSegments.length - 1,
        duration: parseDurationToMinutes(returnItinerary.duration),
        departureTime: retSegments[0].departure.at,
        arrivalTime: retSegments[retSegments.length - 1].arrival.at,
        segments: retSegments,
      };
    }

    return {
      id: offer.id,
      price: parseFloat(offer.price.grandTotal),
      currency: offer.price.currency,
      basePrice: parseFloat(offer.price.base),
      airlineCode: mainCarrier,
      airlineName: carriers[mainCarrier] || mainCarrier,
      aircraftNames,
      stops: segments.length - 1,
      duration: parseDurationToMinutes(outbound.duration),
      departureTime: firstSegment.departure.at,
      arrivalTime: lastSegment.arrival.at,
      origin: firstSegment.departure.iataCode,
      destination: lastSegment.arrival.iataCode,
      departureTerminal: firstSegment.departure.terminal,
      arrivalTerminal: lastSegment.arrival.terminal,
      cabin: fareDetails?.cabin || 'ECONOMY',
      brandedFare: fareDetails?.brandedFareLabel,
      checkedBags: fareDetails?.includedCheckedBags?.quantity ?? 0,
      cabinBags: fareDetails?.includedCabinBags?.quantity ?? 0,
      bagFee: bagFee ? parseFloat(bagFee) : null,
      amenities,
      layovers,
      returnFlight,
      itineraries: offer.itineraries,
      raw: offer,
    };
  });

  return { flights, carriers, aircraft: aircraftDict };
}
