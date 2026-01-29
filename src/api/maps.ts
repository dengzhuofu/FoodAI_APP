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
