export interface DummyColor {
  id: string;
  hex: string;
  label: string;
}

export interface DummyProduct {
  id: string;
  brand: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  category: string;
  badge?: string;
  colors?: DummyColor[];
  sizes?: string[];
}

export interface DummyCategory {
  id: string;
  label: string;
  imageUrl: string;
}

export interface DummyCartItem {
  id: string;
  productId: string;
  brand: string;
  name: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  quantity: number;
  attributeLabel: 'Shade' | 'Size';
  attributeValue: string;
  swatchColor?: string;
}

export const dummyUser = {
  name: 'Hasini',
  location: 'Sholinganallur - Chennai, TamilNadu 600 119',
};

export const dummyGenderTabs = ['All', 'Mens', 'Womens', 'Kids'] as const;

export const dummyCategories: DummyCategory[] = [
  {
    id: 'fashion',
    label: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
  },
  {
    id: 'beauty',
    label: 'Beauty',
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
  },
  {
    id: 'ethnic',
    label: 'Ethnic Wear',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
  },
  {
    id: 'accessories',
    label: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
  },
];

export const dummyProducts: DummyProduct[] = [
  {
    id: 'p1',
    brand: 'Louis Viueton',
    name: 'Branded Casual Shirts for Men',
    description: 'Crafted from premium cotton with a slim fit for everyday comfort.',
    price: 2399,
    originalPrice: 4899,
    discountPercent: 50,
    rating: 4.3,
    reviewCount: 121,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
    category: 'Mens',
    colors: [
      { id: 'c1', hex: '#B76E79', label: 'Rose' },
      { id: 'c2', hex: '#9B6B8A', label: 'Mauve' },
      { id: 'c3', hex: '#4A0E2E', label: 'Wine' },
      { id: 'c4', hex: '#C62828', label: 'Red' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'p2',
    brand: 'Guns & Sons',
    name: 'Premium Shirts for Men',
    description: 'Soft breathable fabric with modern tailoring.',
    price: 2399,
    originalPrice: 4899,
    discountPercent: 50,
    rating: 4.3,
    reviewCount: 121,
    imageUrl: 'https://images.unsplash.com/photo-1625917295354-933ff525824f?w=600',
    category: 'Mens',
  },
  {
    id: 'p3',
    brand: 'Raymond',
    name: 'Men slim fit solid Casual',
    description:
      'Crafted from the finest premium cotton, this shirt offers exceptional comfort and breathability. Perfect for both casual outings and semi-formal occasions.',
    price: 1299,
    originalPrice: 1899,
    discountPercent: 40,
    rating: 4.5,
    reviewCount: 846,
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600',
    category: 'Mens',
    badge: 'Best Seller',
    colors: [
      { id: 'c1', hex: '#F8BBD0', label: 'Pink' },
      { id: 'c2', hex: '#FFFFFF', label: 'White' },
      { id: 'c3', hex: '#90A4AE', label: 'Grey' },
    ],
    sizes: ['M', 'L', 'XL'],
  },
  {
    id: 'p4',
    brand: 'Thara Boutique',
    name: 'Ethnic Lehenga Set',
    description: 'Elegant festive wear with intricate embroidery.',
    price: 4999,
    originalPrice: 8999,
    discountPercent: 44,
    rating: 4.8,
    reviewCount: 56,
    imageUrl: 'https://images.unsplash.com/photo-1583391739487-2a27ebf3f8e2?w=600',
    category: 'Womens',
  },
  {
    id: 'p5',
    brand: 'Thara Boutique',
    name: 'Orange Ethnic Dress',
    description: 'Traditional wear for celebrations and weddings.',
    price: 3499,
    originalPrice: 5999,
    discountPercent: 42,
    rating: 4.6,
    reviewCount: 89,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600',
    category: 'Womens',
  },
];

export const dummyCartItems: DummyCartItem[] = [
  {
    id: 'ci1',
    productId: 'c1',
    brand: 'Velvet Matte Lipstick',
    name: 'Velvet Matte Lipstick',
    price: 380,
    originalPrice: 660,
    discountPercent: 40,
    rating: 4.3,
    reviewCount: 346,
    imageUrl: 'https://images.unsplash.com/photo-1586495777744-441de7c365e9?w=400',
    quantity: 1,
    attributeLabel: 'Shade',
    attributeValue: 'Maroon',
    swatchColor: '#8B1E3F',
  },
  {
    id: 'ci2',
    productId: 'c2',
    brand: 'Nourishing Lip Balm',
    name: 'Nourishing Lip Balm',
    price: 249,
    originalPrice: 399,
    discountPercent: 38,
    rating: 4.5,
    reviewCount: 210,
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    quantity: 1,
    attributeLabel: 'Size',
    attributeValue: '100ml',
  },
  {
    id: 'ci3',
    productId: 'c3',
    brand: 'Exfoliating Face Scrub',
    name: 'Exfoliating Face Scrub',
    price: 500,
    originalPrice: 899,
    discountPercent: 44,
    rating: 5,
    reviewCount: 98,
    imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
    quantity: 1,
    attributeLabel: 'Size',
    attributeValue: '250ml',
  },
];

export const dummyServices = [
  { id: 's1', name: 'Bridal Makeup', duration: '2 hrs', price: 4999 },
  { id: 's2', name: 'Hair Styling', duration: '1 hr', price: 1499 },
  { id: 's3', name: 'Mehendi Artist', duration: '3 hrs', price: 2999 },
  { id: 's4', name: 'Facial & Cleanup', duration: '45 min', price: 999 },
];

export function getDummyProduct(id: string): DummyProduct | undefined {
  return dummyProducts.find((product) => product.id === id);
}

export function getCartTotal(items: DummyCartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
