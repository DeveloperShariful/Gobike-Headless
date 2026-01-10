//context/cartcontext.tsx

"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { gql } from '@apollo/client';
import client from '../lib/apolloClient';
import { gtmAddToCart, gtmRemoveFromCart } from '../lib/gtm';
import { klaviyoTrackAddedToCart } from '../lib/klaviyo';

// ====================================================================
// 1. GraphQL Queries & Mutations
// ====================================================================

const ADD_TO_CART_MUTATION = gql`
  mutation AddToCart($productId: Int!, $quantity: Int!, $variationId: Int) {
    addToCart(input: { productId: $productId, quantity: $quantity, variationId: $variationId }) {
      cartItem { 
        key 
        quantity 
        total 
        product { 
          node { 
            databaseId 
            id 
            name 
            slug 
            image { sourceUrl } 
            ...on ProductWithPricing { 
              price(format: FORMATTED) 
            } 
          } 
        } 
      }
    }
  }
`;

const UPDATE_CART_ITEM_QUANTITIES_MUTATION = gql`
  mutation UpdateCartItemQuantities($items: [CartItemQuantityInput]!) {
    updateItemQuantities(input: { items: $items }) {
      updated {
        key
        quantity
      }
    }
  }
`;

const REMOVE_ITEMS_FROM_CART_MUTATION = gql`
  mutation RemoveItemsFromCart($keys: [ID]!) {
    removeItemsFromCart(input: { keys: $keys, all: false }) {
      cartItems { key }
    }
  }
`;

const GET_CART = gql`
  query GetCart {
    cart {
      contents {
        nodes {
          key
          quantity
          total
          product {
            node {
              databaseId
              id
              name
              slug
              image { sourceUrl altText }
              ... on SimpleProduct { price(format: FORMATTED) }
              ... on VariableProduct { price(format: FORMATTED) }
            }
          }
          variation {
            node {
              id
              name
              price(format: FORMATTED)
              image { sourceUrl altText }
              attributes {
                nodes {
                  id
                  label
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

const CLEAR_CART_MUTATION = gql`
    mutation ClearCart {
        emptyCart(input: {}) {
            clientMutationId
        }
    }
`;

// ====================================================================
// 2. Interfaces & Types
// ====================================================================

interface CartItemAttribute {
    id: string;
    label: string;
    value: string;
    name: string;
}

interface CartItemProductNode {
  databaseId: number;
  id: string;
  name: string;
  slug: string;
  image: { sourceUrl: string; altText: string; } | null;
  price: string;
}

interface FetchedCartItem {
  key: string;
  quantity: number;
  total: string;
  product: { node: CartItemProductNode; };
  variation?: {
      node: {
          id: string;
          name: string;
          price: string;
          image: { sourceUrl: string; altText: string; } | null;
          attributes: {
              nodes: CartItemAttribute[];
          };
      };
  } | null;
}

interface GetCartQueryData {
  cart: { contents: { nodes: FetchedCartItem[]; } | null; } | null;
}

interface AddToCartMutationData {
  addToCart: { cartItem: { product: { node: CartItemProductNode; } } }
}

export interface CartItem {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  price: string;
  image?: string;
  quantity: number;
  key: string; 
  total?: string;
  attributes: CartItemAttribute[];
}

export interface ItemToAdd {
    id: string;
    databaseId: number; 
    variationId?: number; 
    name: string;
    price?: string | null;
    image?: string | null;
    slug: string;
}

interface KlaviyoItem {
    ProductID: number;
    ProductName: string;
    Quantity: number;
    ItemPrice: number;
    RowTotal: number;
    ProductURL: string;
    ImageURL: string;
}

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  addToCart: (item: ItemToAdd, quantity: number) => Promise<void>;
  updateQuantity: (key: string, newQuantity: number) => Promise<void>;
  removeFromCart: (key: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isMiniCartOpen: boolean;
  openMiniCart: () => void;
  closeMiniCart: () => void;
}

// ====================================================================
// 3. Context Provider
// ====================================================================

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);

  // --- Helper: Fetch Cart Data ---
  const fetchInitialCart = useCallback(async () => {
    setLoading(true);
    try {
        const { data } = await client.query<GetCartQueryData>({ 
            query: GET_CART, 
            fetchPolicy: 'network-only' 
        });
        
        if (data?.cart?.contents?.nodes) {
            const fetchedItems = data.cart.contents.nodes.map((item: FetchedCartItem): CartItem => {
            
                const variationNode = item.variation?.node;
                const productNode = item.product.node;
                const isVariable = !!variationNode;

                return {
                    id: productNode.id,
                    databaseId: productNode.databaseId,
                    name: productNode.name,
                    slug: productNode.slug,
                    price: isVariable ? variationNode!.price : productNode.price,
                    image: (isVariable && variationNode?.image?.sourceUrl) 
                           ? variationNode.image.sourceUrl 
                           : productNode.image?.sourceUrl,
                    
                    quantity: item.quantity,
                    key: item.key,
                    total: item.total,
                    attributes: variationNode?.attributes?.nodes || [],
                };
            });
            setCartItems(fetchedItems);
        } else {
            setCartItems([]);
        }
    } catch (error) { 
        console.error("Failed to fetch initial cart", error); 
    } finally { 
        setLoading(false); 
    }
  }, []);

  useEffect(() => {
    fetchInitialCart();
  }, [fetchInitialCart]);

  const openMiniCart = () => setIsMiniCartOpen(true);
  const closeMiniCart = () => setIsMiniCartOpen(false);

  // --- Action: Add to Cart ---
  const addToCart = async (itemToAdd: ItemToAdd, quantity: number) => {
    setLoading(true);
    toast.loading("Adding to cart...");

    try {
      const variables = { 
        productId: itemToAdd.databaseId, 
        variationId: itemToAdd.variationId || null, 
        quantity: quantity
      };

      const { data } = await client.mutate<AddToCartMutationData>({
        mutation: ADD_TO_CART_MUTATION,
        variables: variables
      });
      
      // Tracking Logic
      const priceString = itemToAdd.price || data?.addToCart?.cartItem?.product?.node?.price || '0';
      const priceNum = parseFloat(priceString.replace(/[^0-9.]/g, ''));
      const trackingId = itemToAdd.variationId || itemToAdd.databaseId;

      gtmAddToCart({
          item_name: itemToAdd.name,
          item_id: trackingId,
          price: priceNum,
          quantity: quantity
      });
      
      await fetchInitialCart();
      
      // Klaviyo Logic
      const { data: updatedCartState } = await client.query<GetCartQueryData>({ 
          query: GET_CART, 
          fetchPolicy: 'network-only' 
      });
      
      if (updatedCartState?.cart?.contents?.nodes) {
        const updatedCartItems = updatedCartState.cart.contents.nodes;
        const klaviyoItems: KlaviyoItem[] = updatedCartItems.map((item: FetchedCartItem) => {
            const itemPrice = parseFloat(item.product.node.price.replace(/[^0-9.]/g, ''));
            return {
              ProductID: item.product.node.databaseId,
              ProductName: item.product.node.name,
              Quantity: item.quantity,
              ItemPrice: itemPrice,
              RowTotal: itemPrice * item.quantity,
              ProductURL: `${window.location.origin}/product/${item.product.node.slug}`,
              ImageURL: item.product.node.image?.sourceUrl || ''
            };
        });

        const addedKlaviyoItem = klaviyoItems.find(item => item.ProductID === trackingId || item.ProductID === itemToAdd.databaseId);
        if (addedKlaviyoItem) {
            klaviyoTrackAddedToCart({
                total_price: klaviyoItems.reduce((acc, item) => acc + item.RowTotal, 0),
                item_count: klaviyoItems.reduce((acc, item) => acc + item.Quantity, 0),
                items: klaviyoItems,
                added_item: addedKlaviyoItem
            });
        }
      }

      toast.dismiss();
      toast.success(`"${itemToAdd.name}" added to cart`);
      openMiniCart();

    } catch (error: unknown) {
      toast.dismiss();
      const errorMessage = error instanceof Error ? error.message : "Could not add item to cart.";
      console.error("AddToCart Error:", error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (key: string, newQuantity: number) => {
    if (newQuantity < 1) { await removeFromCart(key); return; }
    setLoading(true);
    toast.loading("Updating cart...");
    try {
        await client.mutate({
            mutation: UPDATE_CART_ITEM_QUANTITIES_MUTATION,
            variables: { items: [{ key, quantity: newQuantity }] },
        });
        await fetchInitialCart();
        toast.dismiss();
        toast.success("Cart updated!");
    } catch (error: unknown) {
        toast.dismiss();
        const errorMessage = error instanceof Error ? error.message : "Could not update quantity.";
        toast.error(errorMessage);
    } finally { setLoading(false); }
  };

  const removeFromCart = async (key: string) => {
    const itemToRemove = cartItems.find(item => item.key === key);
    if (!itemToRemove) return;
    setLoading(true);
    try {
      await client.mutate({
        mutation: REMOVE_ITEMS_FROM_CART_MUTATION,
        variables: { keys: [key] }
      });
      const priceNum = parseFloat(itemToRemove.price?.replace(/[^0-9.]/g, '') || '0');
      gtmRemoveFromCart({
          item_name: itemToRemove.name,
          item_id: itemToRemove.databaseId,
          price: priceNum,
          quantity: itemToRemove.quantity
      });
      await fetchInitialCart();
      toast.error("Removed from cart.");
    } catch (error: unknown) { 
      const errorMessage = error instanceof Error ? error.message : "Could not remove item.";
      toast.error(errorMessage);
    } finally { setLoading(false); }
  };

  const clearCart = async () => { 
    if (cartItems.length === 0 && !localStorage.getItem('woo-session')) { return; }
    setLoading(true);
    try {
      await client.mutate({ mutation: CLEAR_CART_MUTATION });
      setCartItems([]);
      localStorage.removeItem('woo-session');
      toast.success("Cart cleared.");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Could not clear the cart.";
      toast.error(errorMessage);
    } finally { setLoading(false); }
  };

  const value = { cartItems, loading, addToCart, updateQuantity, removeFromCart, clearCart, isMiniCartOpen, openMiniCart, closeMiniCart };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) { throw new Error('useCart must be used within a CartProvider'); }
  return context;
}