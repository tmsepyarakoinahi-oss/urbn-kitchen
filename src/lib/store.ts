import { create } from 'zustand'

export type AppView = 
  | 'home' 
  | 'products' 
  | 'product-detail' 
  | 'cart' 
  | 'checkout' 
  | 'order-success' 
  | 'about' 
  | 'contact'
  | 'amc'
  | 'login'
  | 'register'
  | 'admin'
  | 'customer-portal'
  | 'employee-portal'

export type AdminTab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'leads'
  | 'quotations'
  | 'customers'
  | 'employees'
  | 'attendance'
  | 'leaves'
  | 'amc'
  | 'service'
  | 'inquiries'
  | 'settings'
  | 'activity'

export type CustomerTab =
  | 'orders'
  | 'profile'
  | 'amc'
  | 'service'
  | 'wishlist'

export type EmployeeTab =
  | 'dashboard'
  | 'attendance'
  | 'tasks'
  | 'salary'
  | 'leaves'

interface AppState {
  // Navigation
  currentView: AppView
  selectedProductId: string | null
  adminTab: AdminTab
  customerTab: CustomerTab
  employeeTab: EmployeeTab
  
  // Auth
  user: any | null
  isAuthenticated: boolean
  
  // Cart
  cartItems: CartItem[]
  cartCount: number
  
  // UI
  searchQuery: string
  selectedCategory: string | null
  showMobileMenu: boolean
  showQuickView: boolean
  quickViewProductId: string | null
  lastOrder: any | null
  
  // Actions
  setView: (view: AppView) => void
  setAdminTab: (tab: AdminTab) => void
  setCustomerTab: (tab: CustomerTab) => void
  setEmployeeTab: (tab: EmployeeTab) => void
  setUser: (user: any | null) => void
  setCartItems: (items: CartItem[]) => void
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string, variantId?: string | null) => void
  updateCartQty: (productId: string, qty: number, variantId?: string | null) => void
  clearCart: () => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string | null) => void
  toggleMobileMenu: () => void
  setShowQuickView: (show: boolean, productId?: string | null) => void
  setProductDetail: (productId: string) => void
  setLastOrder: (order: any | null) => void
}

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  qty: number
  image: string | null
  stock: number
  variantId?: string | null      // variant ID if a specific size is selected
  variantName?: string | null    // e.g. "Large", "Medium" for display
  variantSku?: string | null     // variant SKU
}

// ─── localStorage persistence helpers ─────────────────────────────
const STORAGE_KEY = 'urban-kitchen-auth'
const CART_KEY = 'urban-kitchen-cart'

function loadPersistedAuth(): { user: any | null; isAuthenticated: boolean; currentView: AppView } {
  if (typeof window === 'undefined') {
    return { user: null, isAuthenticated: false, currentView: 'home' }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      if (data && data.user) {
        return {
          user: data.user,
          isAuthenticated: true,
          currentView: data.currentView || 'home',
        }
      }
    }
  } catch {
    // Ignore parse errors
  }
  return { user: null, isAuthenticated: false, currentView: 'home' }
}

function persistAuth(user: any | null, currentView: AppView) {
  if (typeof window === 'undefined') return
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, currentView }))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Ignore storage errors
  }
}

function loadPersistedCart(): { cartItems: CartItem[]; cartCount: number } {
  if (typeof window === 'undefined') return { cartItems: [], cartCount: 0 }
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (raw) {
      const items: CartItem[] = JSON.parse(raw)
      return { cartItems: items, cartCount: items.reduce((sum, i) => sum + i.qty, 0) }
    }
  } catch {
    // Ignore
  }
  return { cartItems: [], cartCount: 0 }
}

function persistCart(items: CartItem[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  } catch {
    // Ignore
  }
}

// Load persisted state
const persistedAuth = loadPersistedAuth()
const persistedCart = loadPersistedCart()

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation
  currentView: persistedAuth.currentView,
  selectedProductId: null,
  adminTab: 'dashboard',
  customerTab: 'orders',
  employeeTab: 'dashboard',
  
  // Auth (persisted)
  user: persistedAuth.user,
  isAuthenticated: persistedAuth.isAuthenticated,
  
  // Cart (persisted)
  cartItems: persistedCart.cartItems,
  cartCount: persistedCart.cartCount,
  
  // UI
  searchQuery: '',
  selectedCategory: null,
  showMobileMenu: false,
  showQuickView: false,
  quickViewProductId: null,
  lastOrder: null,
  
  // Actions
  setView: (view) => {
    set({ currentView: view, showMobileMenu: false })
    persistAuth(get().user, view)
  },
  setAdminTab: (tab) => set({ adminTab: tab }),
  setCustomerTab: (tab) => set({ customerTab: tab }),
  setEmployeeTab: (tab) => set({ employeeTab: tab }),
  setUser: (user) => {
    const state = get()
    const newView = user ? state.currentView : 'home'
    set({ user, isAuthenticated: !!user, currentView: newView })
    persistAuth(user, newView)
  },
  
  setCartItems: (items) => {
    set({ cartItems: items, cartCount: items.reduce((sum, i) => sum + i.qty, 0) })
    persistCart(items)
  },
  
  addToCart: (item) => {
    const { cartItems } = get()
    // Match by both productId AND variantId so that different variants
    // of the same product are treated as separate cart items
    const variantId = item.variantId ?? null
    const existing = cartItems.find(
      i => i.productId === item.productId && (i.variantId ?? null) === variantId
    )
    let newItems: CartItem[]
    if (existing) {
      newItems = cartItems.map(i =>
        i.productId === item.productId && (i.variantId ?? null) === variantId
          ? { ...i, qty: i.qty + item.qty }
          : i
      )
    } else {
      newItems = [...cartItems, item]
    }
    set({ cartItems: newItems, cartCount: newItems.reduce((sum, i) => sum + i.qty, 0) })
    persistCart(newItems)
  },
  
  removeFromCart: (productId, variantId) => {
    const { cartItems } = get()
    const vId = variantId ?? null
    let newItems: CartItem[]
    if (vId) {
      // Remove the specific variant
      newItems = cartItems.filter(
        i => !(i.productId === productId && (i.variantId ?? null) === vId)
      )
    } else {
      // No variant specified — remove all items for this productId (backward compatible)
      newItems = cartItems.filter(i => i.productId !== productId)
    }
    set({ cartItems: newItems, cartCount: newItems.reduce((sum, i) => sum + i.qty, 0) })
    persistCart(newItems)
  },
  
  updateCartQty: (productId, qty, variantId) => {
    const { cartItems } = get()
    const vId = variantId ?? null
    const isMatch = (i: CartItem) =>
      i.productId === productId && (i.variantId ?? null) === vId

    if (qty <= 0) {
      const newItems = cartItems.filter(i => !isMatch(i))
      set({ cartItems: newItems, cartCount: newItems.reduce((sum, i) => sum + i.qty, 0) })
      persistCart(newItems)
    } else {
      const newItems = cartItems.map(i => isMatch(i) ? { ...i, qty } : i)
      set({ cartItems: newItems, cartCount: newItems.reduce((sum, i) => sum + i.qty, 0) })
      persistCart(newItems)
    }
  },
  
  clearCart: () => {
    set({ cartItems: [], cartCount: 0 })
    persistCart([])
  },
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  toggleMobileMenu: () => set((s) => ({ showMobileMenu: !s.showMobileMenu })),
  setShowQuickView: (show, productId) => set({ showQuickView: show, quickViewProductId: productId || null }),
  setProductDetail: (productId) => set({ selectedProductId: productId, currentView: 'product-detail' }),
  setLastOrder: (order) => set({ lastOrder: order }),
}))
