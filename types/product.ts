export interface ProductItem {
  id: string;
  name: string;
  price: number;
  description: string;
  images: Array<{ url: string }>;
  is_active?: boolean;
  is_home?: boolean;
  created_at?: string;
} 