export interface Owner {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  applicationType?: string;
  currentRestaurant?: string;
  phone?: string;
  website?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface ContentSection {
  _id?: string;
  heading: string;
  body?: string;
  images?: string[];
  order?: number;
}

export interface Restaurant {
  _id: string;
  name: string;
  description?: string;
  cuisine?: string;
  phone?: string;
  website?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  geocodePrecision?: "exact" | "city" | "region" | "none";
  images?: string[];
  contentSections?: ContentSection[];
  status: "draft" | "published" | "archived";
  createdAt?: string;
  updatedAt?: string;
}

export type RestaurantFormData = Omit<Restaurant, "_id" | "createdAt" | "updatedAt">;
