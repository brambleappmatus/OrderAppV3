export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  kcal: number;
  protein: number;
  fats: number;
  carbs: number;
}

export interface CartItem extends Product {
  quantity: number;
}