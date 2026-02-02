import * as Location from 'expo-location';

export interface LocationPOI {
  id: string;
  name: string;
  type: string;
  address: string;
  location: string; // "lng,lat"
  pname: string;
  cityname: string;
  adname: string;
}

export interface RegeocodeResponse {
  status: string;
  info: string;
  regeocode: {
    formatted_address: string;
    addressComponent: {
      province: string;
      city: string;
      district: string;
      township: string;
      streetNumber: {
        street: string;
        number: string;
      }
    };
    pois?: LocationPOI[];
  };
}

export interface RouteResult {
  distance: string;
  duration: string;
  path: { latitude: number; longitude: number }[];
}

export const searchRoute = async (
  type: 'driving' | 'walking' | 'transit' | 'riding',
  origin: string, // "lng,lat"
  destination: string // "lng,lat"
): Promise<RouteResult | null> => {
  // Since we removed the backend service, we can't calculate the route path.
  // We return a simple straight line or null.
  // The UI will handle "Start Navigation" to external maps.
  
  const [orgLng, orgLat] = origin.split(',').map(Number);
  const [dstLng, dstLat] = destination.split(',').map(Number);

  return {
    distance: '',
    duration: '',
    path: [
      { latitude: orgLat, longitude: orgLng },
      { latitude: dstLat, longitude: dstLng }
    ]
  };
};

export const searchLocation = async (keywords: string, city?: string): Promise<LocationPOI[]> => {
  try {
    // Use Expo Location for geocoding
    const results = await Location.geocodeAsync(keywords);
    
    if (results.length > 0) {
      // Map results to LocationPOI
      return await Promise.all(results.map(async (item, index) => {
        // Reverse geocode to get address details
        const addressList = await Location.reverseGeocodeAsync({
           latitude: item.latitude,
           longitude: item.longitude
        });
        const addr = addressList[0];
        const formattedAddress = addr ? `${addr.region || ''}${addr.city || ''}${addr.district || ''}${addr.street || ''}${addr.streetNumber || ''}` : keywords;

        return {
          id: `loc_${index}_${Date.now()}`,
          name: addr?.name || keywords, // Use address name or keyword
          type: 'point',
          address: formattedAddress,
          location: `${item.longitude},${item.latitude}`,
          pname: addr?.region || '',
          cityname: addr?.city || '',
          adname: addr?.district || ''
        };
      }));
    }
    return [];
  } catch (error) {
    console.error('Search location error:', error);
    return [];
  }
};

export const regeocodeLocation = async (location: string): Promise<RegeocodeResponse | null> => {
  try {
    const [lng, lat] = location.split(',').map(Number);
    const addressList = await Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: lng
    });

    if (addressList && addressList.length > 0) {
      const addr = addressList[0];
      const formattedAddress = `${addr.region || ''}${addr.city || ''}${addr.district || ''}${addr.street || ''}${addr.streetNumber || ''}${addr.name || ''}`;
      
      return {
        status: '1',
        info: 'OK',
        regeocode: {
          formatted_address: formattedAddress,
          addressComponent: {
            province: addr.region || '',
            city: addr.city || '',
            district: addr.district || '',
            township: '',
            streetNumber: {
              street: addr.street || '',
              number: addr.streetNumber || ''
            }
          },
          pois: [] // expo-location doesn't return POIs
        }
      };
    }
    return null;
  } catch (error) {
    console.error('Regeocode error:', error);
    return null;
  }
};
