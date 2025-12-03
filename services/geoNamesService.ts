
import { useQuery } from '@tanstack/react-query';
export interface City{ name: string; country: string; }

async function fetchCityData(cityName: string, lang: string): Promise<City[]> {
  const response = await fetch(`/api/cities?city=${encodeURIComponent(cityName)}&lang=${lang}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch city data');
  }
  return response.json();
}

export function useFetchCityData(cityName: string, lang: string) {
  return useQuery<City[], Error>({
    queryKey: ['cityData', cityName, lang],
    queryFn: () => fetchCityData(cityName, lang), 
    enabled: !!cityName, 
  });
}