import client from './client';

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
  try {
    const response = await client.get('/maps/route', {
      params: { type, origin, destination }
    });
    if (response.data.status === '1') {
      return response.data.result;
    }
    return null;
  } catch (error) {
    console.error('Route search error:', error);
    return null;
  }
};

export const searchLocation = async (keywords: string, city?: string): Promise<LocationPOI[]> => {
  try {
    const response = await client.get('/maps/search', {
      params: { keywords, city }
    });
    if (response.data.status === '1') {
      return response.data.pois;
    }
    return [];
  } catch (error) {
    console.error('Search location error:', error);
    return [];
  }
};

export const regeocodeLocation = async (location: string): Promise<RegeocodeResponse | null> => {
  try {
    const response = await client.get('/maps/regeocode', {
      params: { location }
    });
    if (response.data.status === '1') {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Regeocode error:', error);
    return null;
  }
};
