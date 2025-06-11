export interface IFlat {
  ownerId: string;
  id: string;
  hasAC: boolean;
  city: string;
  streetName: string;
  streetNumber: number;
  areaSize: number;
  rentPrice: number;
  dateAvailable: Date | null;
  yearBuilt: number;
  description: string | null;
  userId: string;
  imageUrl: string;
}