# Shop — requirements from the product team

Owner: PM (Nok). Status: agreed for sprint 12.

## Terms
- **Cart (ตะกร้า)**: the items a shopper chose; stock is not reserved
- **Subtotal**: the sum of quantity × current price

## Cart (F-01)

### US-01 Shopper keeps a cart of items to buy
- AC-01: adding more than the stock caps the line at the stock and `add`
  returns a notice that says how many are left (for example "Only 2 left")
- AC-02: totals always use the price at the time `totals()` is called, never
  the price when the item was added
- AC-03: `remove(sku)` takes the line out of the cart
- AC-04: adding the same item again adds to its line; the cap applies to the
  whole line

### Rules
- BR-01: shipping is free when the subtotal is 990 baht or more; otherwise it
  is 50 baht. An empty cart has no shipping.
- BR-02: no line may hold more than 10 units, whatever the stock; the notice
  then says "Limit 10 per item"
- ERR-01: when the stock service fails, `add` returns
  `{ ok: false, error: "STOCK_UNAVAILABLE" }` and the cart is unchanged

## Discount codes (F-02)

### US-02 Shopper enters a discount code
- AC-05: a valid code takes its amount off the subtotal
- BR-03: one code per order

## Open questions
| # | Question | Answer |
|---|---|---|
| Q1 | Should F-01 reserve stock when added? | No — reserved at checkout (decided 12 Nov) |
