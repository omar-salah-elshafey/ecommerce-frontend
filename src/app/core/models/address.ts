export interface AddressDto {
  id: string;
  governorate: string;
  city: string;
  region: string;
}

export interface CityDto {
  id: string;
  name: string;
}

export interface GovernorateDto {
  id: string;
  name: string;
  cities: CityDto[];
}

export interface AddCityDto {
  governorateId: string;
  name: string;
}

export interface UpdateGovernorateDto {
  name: string;
}
