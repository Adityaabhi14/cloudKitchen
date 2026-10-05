# Vindu Cloud Kitchen — Database Design & Schema

## Entity Relationship Overview

```
 [ CATEGORIES ]
       │ 1
       │
       │ N
 [ FOOD ITEMS ] ───< [ INVENTORY / STOCK ]
       │ 1
       │
       ├─────────────────────────────────┐
       │ N                               │ N
 [ MENU ITEMS ]                     [ ORDER ITEMS ] (Immutable Snapshot)
       │ N                               │ N
       │ 1                               │ 1
   [ MENUS ]                         [ ORDERS ]
 (Date-Driven)                           │ N
                                         │ 1
                                  [ CUSTOMERS ]
                                         │ 1
                                         │ N
                                  [ ADDRESSES ]
```

---

## Key Constraints & Business Rules

1. **Date-Based Menu Constraint**:
   `menus.menu_date` has a `UNIQUE` constraint in `YYYY-MM-DD` format. Only one active menu header exists per date, and it houses related `menu_items`.

2. **Immutable Pricing on Orders**:
   `order_items` stores:
   - `price_at_purchase`
   - `unit_at_purchase`
   - `food_name`
   - `quantity`
   - `item_total`
   
   This ensures that any future price increases, unit alterations, or recipe edits by the kitchen never retroactively mutate past customer receipts or accounting totals.

3. **Stock & Status Progression**:
   - `remaining_stock > 5` ➔ Status = `AVAILABLE`
   - `0 < remaining_stock <= 5` ➔ Status = `LOW_STOCK`
   - `remaining_stock <= 0` ➔ Status = `SOLD_OUT`

4. **Order Status Audit Trail**:
   Every status mutation (`PENDING` ➔ `CONFIRMED` ➔ `PREPARING` ➔ `READY` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`) generates an entry in `order_status_history` with timestamp, updated_by user, and optional internal notes.
