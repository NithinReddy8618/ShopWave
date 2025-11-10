import z from "zod";

export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  image_url: z.string().nullable(),
  category: z.string().nullable(),
  stock: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Product = z.infer<typeof ProductSchema>;

export const CartItemSchema = z.object({
  id: z.number(),
  session_id: z.string(),
  product_id: z.number(),
  quantity: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CartItem = z.infer<typeof CartItemSchema>;

export const CartItemWithProductSchema = CartItemSchema.extend({
  product: ProductSchema,
});

export type CartItemWithProduct = z.infer<typeof CartItemWithProductSchema>;

export const AddToCartSchema = z.object({
  product_id: z.number(),
  quantity: z.number().min(1),
});

export const UpdateCartItemSchema = z.object({
  quantity: z.number().min(0),
});

export const ReviewSchema = z.object({
  id: z.number(),
  product_id: z.number(),
  user_id: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().nullable(),
  comment: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Review = z.infer<typeof ReviewSchema>;

export const ReviewWithUserSchema = ReviewSchema.extend({
  user_email: z.string(),
  user_name: z.string().nullable(),
});

export type ReviewWithUser = z.infer<typeof ReviewWithUserSchema>;

export const CreateReviewSchema = z.object({
  product_id: z.number(),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
});

export const WishlistItemSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  product_id: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type WishlistItem = z.infer<typeof WishlistItemSchema>;

export const ProductWithRatingSchema = ProductSchema.extend({
  average_rating: z.number().nullable(),
  review_count: z.number(),
});

export type ProductWithRating = z.infer<typeof ProductWithRatingSchema>;
