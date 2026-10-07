import { Profile, Restaurant } from "@/types";
import { FloorLayout } from "./floor-layout";
export interface StaffProfile extends Profile {
  avatar_path?: string | null;
  active?: boolean;
  sector?: string;
}
export interface BrandRestaurant extends Restaurant {
  logo_path?: string | null;
  cover_path?: string | null;
}
export interface RestaurantSettings {
  restaurant_id: string;
  floor_plan: FloorLayout;
  updated_at?: string;
}
export const roleName = {
  OWNER: "Proprietário",
  MANAGER: "Gerente",
  WAITER: "Garçom",
};
