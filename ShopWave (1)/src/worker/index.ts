import { Hono } from "hono";
import { cors } from "hono/cors";
import { getCookie, setCookie } from "hono/cookie";
import { AddToCartSchema, UpdateCartItemSchema, CreateReviewSchema } from "@/shared/types";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";

interface WorkerEnv extends Env {
  MOCHA_USERS_SERVICE_API_URL: string;
  MOCHA_USERS_SERVICE_API_KEY: string;
}

const app = new Hono<{ Bindings: WorkerEnv }>();

app.use("/*", cors());

// Authentication routes
app.get('/api/oauth/google/redirect_url', async (c) => {
  const redirectUrl = await getOAuthRedirectUrl('google', {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

app.get('/api/logout', async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Get all products
app.get("/api/products", async (c) => {
  const db = c.env.DB;
  const category = c.req.query("category");
  const search = c.req.query("search");
  const sort = c.req.query("sort") || "newest";
  
  let query = `
    SELECT p.*, 
           COALESCE(AVG(r.rating), 0) as average_rating,
           COUNT(DISTINCT r.id) as review_count
    FROM products p
    LEFT JOIN reviews r ON p.id = r.product_id
    WHERE p.stock > 0
  `;
  const params: string[] = [];
  
  if (category) {
    query += " AND p.category = ?";
    params.push(category);
  }
  
  if (search) {
    query += " AND (p.name LIKE ? OR p.description LIKE ?)";
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }
  
  query += " GROUP BY p.id";
  
  // Add sorting
  switch (sort) {
    case "price_asc":
      query += " ORDER BY p.price ASC";
      break;
    case "price_desc":
      query += " ORDER BY p.price DESC";
      break;
    case "rating":
      query += " ORDER BY average_rating DESC, review_count DESC";
      break;
    case "newest":
    default:
      query += " ORDER BY p.created_at DESC";
      break;
  }
  
  const result = await db.prepare(query).bind(...params).all();
  return c.json(result.results);
});

// Get single product
app.get("/api/products/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  
  const result = await db
    .prepare(`
      SELECT p.*, 
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(DISTINCT r.id) as review_count
      FROM products p
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.id = ?
      GROUP BY p.id
    `)
    .bind(id)
    .first();
    
  if (!result) {
    return c.json({ error: "Product not found" }, 404);
  }
  
  return c.json(result);
});

// Get categories
app.get("/api/categories", async (c) => {
  const db = c.env.DB;
  const result = await db
    .prepare("SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category")
    .all();
  
  return c.json(result.results.map((r: any) => r.category));
});

// Get cart items (requires authentication)
app.get("/api/cart", authMiddleware, async (c) => {
  const db = c.env.DB;
  const user = c.get("user");
  
  const result = await db
    .prepare(`
      SELECT ci.*, p.name, p.description, p.price, p.image_url, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC
    `)
    .bind(user!.id)
    .all();
  
  const cartItems = result.results.map((row: any) => ({
    id: row.id,
    session_id: row.session_id,
    product_id: row.product_id,
    quantity: row.quantity,
    created_at: row.created_at,
    updated_at: row.updated_at,
    product: {
      id: row.product_id,
      name: row.name,
      description: row.description,
      price: row.price,
      image_url: row.image_url,
      category: null,
      stock: row.stock,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
  }));
  
  return c.json(cartItems);
});

// Add to cart (requires authentication)
app.post("/api/cart", authMiddleware, async (c) => {
  const db = c.env.DB;
  const user = c.get("user");
  
  const body = await c.req.json();
  const parsed = AddToCartSchema.safeParse(body);
  
  if (!parsed.success) {
    return c.json({ error: "Invalid request", details: parsed.error }, 400);
  }
  
  const { product_id, quantity } = parsed.data;
  
  // Check if product exists and has stock
  const product = await db
    .prepare("SELECT * FROM products WHERE id = ?")
    .bind(product_id)
    .first();
    
  if (!product) {
    return c.json({ error: "Product not found" }, 404);
  }
  
  // Check if item already in cart
  const existing = await db
    .prepare("SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?")
    .bind(user!.id, product_id)
    .first();
  
  if (existing) {
    // Update quantity
    const newQuantity = (existing.quantity as number) + quantity;
    await db
      .prepare("UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(newQuantity, existing.id)
      .run();
    
    return c.json({ success: true, action: "updated" });
  } else {
    // Insert new item
    await db
      .prepare("INSERT INTO cart_items (session_id, user_id, product_id, quantity) VALUES (?, ?, ?, ?)")
      .bind(user!.id, user!.id, product_id, quantity)
      .run();
    
    return c.json({ success: true, action: "added" });
  }
});

// Update cart item (requires authentication)
app.put("/api/cart/:id", authMiddleware, async (c) => {
  const db = c.env.DB;
  const user = c.get("user");
  const id = c.req.param("id");
  
  const body = await c.req.json();
  const parsed = UpdateCartItemSchema.safeParse(body);
  
  if (!parsed.success) {
    return c.json({ error: "Invalid request", details: parsed.error }, 400);
  }
  
  const { quantity } = parsed.data;
  
  if (quantity === 0) {
    // Delete item
    await db
      .prepare("DELETE FROM cart_items WHERE id = ? AND user_id = ?")
      .bind(id, user!.id)
      .run();
    
    return c.json({ success: true, action: "deleted" });
  } else {
    // Update quantity
    await db
      .prepare("UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?")
      .bind(quantity, id, user!.id)
      .run();
    
    return c.json({ success: true, action: "updated" });
  }
});

// Delete cart item (requires authentication)
app.delete("/api/cart/:id", authMiddleware, async (c) => {
  const db = c.env.DB;
  const user = c.get("user");
  const id = c.req.param("id");
  
  await db
    .prepare("DELETE FROM cart_items WHERE id = ? AND user_id = ?")
    .bind(id, user!.id)
    .run();
  
  return c.json({ success: true });
});

// Clear cart (requires authentication)
app.delete("/api/cart", authMiddleware, async (c) => {
  const db = c.env.DB;
  const user = c.get("user");
  
  await db
    .prepare("DELETE FROM cart_items WHERE user_id = ?")
    .bind(user!.id)
    .run();
  
  return c.json({ success: true });
});

// Get product reviews
app.get("/api/products/:id/reviews", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  
  const result = await db
    .prepare("SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC")
    .bind(id)
    .all();
  
  return c.json(result.results);
});

// Create review (requires authentication)
app.post("/api/reviews", authMiddleware, async (c) => {
  const db = c.env.DB;
  const user = c.get("user");
  
  const body = await c.req.json();
  const parsed = CreateReviewSchema.safeParse(body);
  
  if (!parsed.success) {
    return c.json({ error: "Invalid request", details: parsed.error }, 400);
  }
  
  const { product_id, rating, title, comment } = parsed.data;
  
  // Check if user already reviewed this product
  const existing = await db
    .prepare("SELECT * FROM reviews WHERE user_id = ? AND product_id = ?")
    .bind(user!.id, product_id)
    .first();
  
  if (existing) {
    // Update existing review
    await db
      .prepare("UPDATE reviews SET rating = ?, title = ?, comment = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(rating, title || null, comment || null, existing.id)
      .run();
    
    return c.json({ success: true, action: "updated" });
  } else {
    // Create new review
    await db
      .prepare("INSERT INTO reviews (product_id, user_id, rating, title, comment) VALUES (?, ?, ?, ?, ?)")
      .bind(product_id, user!.id, rating, title || null, comment || null)
      .run();
    
    return c.json({ success: true, action: "created" });
  }
});

// Get wishlist (requires authentication)
app.get("/api/wishlist", authMiddleware, async (c) => {
  const db = c.env.DB;
  const user = c.get("user");
  
  const result = await db
    .prepare(`
      SELECT p.*, w.id as wishlist_id, w.created_at as added_at,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(DISTINCT r.id) as review_count
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE w.user_id = ?
      GROUP BY p.id
      ORDER BY w.created_at DESC
    `)
    .bind(user!.id)
    .all();
  
  return c.json(result.results);
});

// Add to wishlist (requires authentication)
app.post("/api/wishlist", authMiddleware, async (c) => {
  const db = c.env.DB;
  const user = c.get("user");
  
  const body = await c.req.json();
  const product_id = body.product_id;
  
  if (!product_id) {
    return c.json({ error: "Product ID required" }, 400);
  }
  
  try {
    await db
      .prepare("INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)")
      .bind(user!.id, product_id)
      .run();
    
    return c.json({ success: true });
  } catch (error) {
    // Item already in wishlist
    return c.json({ error: "Item already in wishlist" }, 409);
  }
});

// Remove from wishlist (requires authentication)
app.delete("/api/wishlist/:productId", authMiddleware, async (c) => {
  const db = c.env.DB;
  const user = c.get("user");
  const productId = c.req.param("productId");
  
  await db
    .prepare("DELETE FROM wishlists WHERE user_id = ? AND product_id = ?")
    .bind(user!.id, productId)
    .run();
  
  return c.json({ success: true });
});

// Check if product is in wishlist (requires authentication)
app.get("/api/wishlist/check/:productId", authMiddleware, async (c) => {
  const db = c.env.DB;
  const user = c.get("user");
  const productId = c.req.param("productId");
  
  const result = await db
    .prepare("SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?")
    .bind(user!.id, productId)
    .first();
  
  return c.json({ inWishlist: !!result });
});

export default app;
