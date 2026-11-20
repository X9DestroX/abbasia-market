# ABBASIA.SHOP v0.4 — Cart & Checkout

## Included
- Client-side cart persistence using localStorage (`abbasia-cart`)
- Cart page `/cart`: quantities, removal, subtotal
- Checkout page `/checkout`: delivery information and Cash on Delivery
- API `POST /api/orders`: authenticated order creation
- Multi-seller order splitting into SellerOrder records
- Stock checks and atomic stock decrement within transaction
- InventoryMovement audit entries and Order audit log
- Demo products remain browseable/addable to cart but cannot be submitted as real orders

## Setup
No new dependency or database migration is required. Existing schema already includes Cart, CartItem, Order, SellerOrder, OrderItem, Payment and InventoryMovement.

After replacing the project files, run:
```powershell
npx tsc --noEmit
npm run dev
```

Test:
1. Add a product from the storefront.
2. Open `/cart` and change quantity/remove.
3. Proceed to `/checkout`.
4. Real database products require login and are checked for active status, approved seller and available stock.
5. Demo products cannot be submitted to checkout.
6. Order creation returns a unique order number; payment method is Cash on Delivery.
