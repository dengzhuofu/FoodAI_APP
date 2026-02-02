import client from './client';

export type LatLng = {
  latitude: number;
  longitude: number;
};

export type LocationPOI = {
  id?: string;
  name: string;
  address: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  distance?: string | number;
  tel?: string;
};

export type RouteType = 'walking' | 'riding' | 'driving' | 'transit';

export type RouteStep = {
  instruction: string;
  road: string;
  action: string;
  orientation: string;
  distance_meters: number;
  duration_seconds: number;
};

export type RouteResult = {
  type: RouteType;
  distance_meters: number;
  duration_seconds: number;
  duration_in_traffic_seconds?: number | null;
  distance: string;
  duration: string;
  path: LatLng[];
  steps: RouteStep[];
};

export async function searchPOI(params: {
  keywords: string;
  city?: string;
  page?: number;
  page_size?: number;
}): Promise<LocationPOI[]> {
  const response = await client.get('/maps/search', { params });
  const data = response.data as { status: string; pois: LocationPOI[] };
  if (data?.status !== '1') return [];
  return data.pois || [];
}

export async function aroundSearch(params: {
  location: string;
  keywords?: string;
  types?: string;
  radius?: number;
  page?: number;
  page_size?: number;
}): Promise<LocationPOI[]> {
  const response = await client.get('/maps/around', { params });
  const data = response.data as { status: string; pois: LocationPOI[] };
  if (data?.status !== '1') return [];
  return data.pois || [];
}

export async function routePlan(params: {
  type: RouteType;
  origin: string;
  destination: string;
  city?: string;
  cityd?: string;
  strategy?: number;
}): Promise<RouteResult | null> {
  const response = await client.get('/maps/route', { params });
  const data = response.data as { status: string; result: RouteResult | null };
  if (data?.status !== '1') return null;
  return data.result;
}

export async function reverseGeocode(params: { location: string }): Promise<string | null> {
  const response = await client.get('/maps/regeocode', { params });
  const data = response.data as any;
  const formatted = data?.regeocode?.formatted_address;
  if (typeof formatted === 'string' && formatted.trim()) return formatted;
  return null;
}
