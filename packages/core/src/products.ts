import { PREMIUM_PRODUCTS } from "@cosmoscope/api/products";
import type { ProductDefinition, ProductKey } from "@cosmoscope/api/contracts";

export type CatalogProduct = ProductDefinition;

export const PRODUCT_KEYS = Object.keys(PREMIUM_PRODUCTS) as ProductKey[];

export const CATALOG_PRODUCTS: Record<ProductKey, CatalogProduct> = PREMIUM_PRODUCTS;
