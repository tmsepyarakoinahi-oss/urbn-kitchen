import { create } from 'zustand'

export type AppView = 
  | 'home' 
  | 'products' 
  | 'product-detail' 
  | 'cart' 
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
  | 'orders'
  | 'leads'
  | 'employees'
  | 'amc'
  | 'settings'

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
  
  // Actions
  setView: (view: AppView) => void
  setAdminTab: (tab: AdminTab) => void
  setCustomerTab: (tab: CustomerTab) => void
  setEmployeeTab: (tab: EmployeeTab) => void
  setUser: (user: any | null) => void
  setCartItems: (items: CartItem[]) => void
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  updateCartQty: (productId: string, qty: number) => void
  clearCart: () => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string | null) => void
  toggleMobileMenu: () => void
  setShowQuickView: (show: boolean, productId?: string | null) => void
  setProductDetail: (productId: string) => void
}

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  qty: number
  image: string | null
  stock: number
}

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation
  currentView: 'home',
  selectedProductId: null,
  adminTab: 'dashboard',
  customerTab: 'orders',
  employeeTab: 'dashboard',
  
  // Auth
  user: null,
  isAuthenticated: false,
  
  // Cart
  cartItems: [],
  cartCount: 0,
  
  // UI
  searchQuery: '',
  selectedCategory: null,
  showMobileMenu: false,
  showQuickView: false,
  quickViewProductId: null,
  
  // Actions
  setView: (view) => set({ currentView: view, showMobileMenu: false }),
  setAdminTab: (tab) => set({ adminTab: tab }),
  setCustomerTab: (tab) => set({ customerTab: tab }),
  setEmployeeTab: (tab) => set({ employeeTab: tab }),
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setCartItems: (items) => set({ cartItems: items, cartCount: items.reduce((sum, i) => sum + i.qty, 0) }),
  
  addToCart: (item) => {
    const { cartItems } = get()
    const existing = cartItems.find(i => i.productId === item.productId)
    let newItems: CartItem[]
    if (existing) {
      newItems = cartItems.map(i => 
        i.productId === item.productId ? { ...i, qty: i.qty + item.qty } : i
      )
    } else {
      newItems = [...cartItems, item]
    }
    set({ cartItems: newItems, cartCount: newItems.reduce((sum, i) => sum + i.qty, 0) })
  },
  
  removeFromCart: (productId) => {
    const { cartItems } = get()
    const newItems = cartItems.filter(i => i.productId !== productId)
    set({ cartItems: newItems, cartCount: newItems.reduce((sum, i) => sum + i.qty, 0) })
  },
  
  updateCartQty: (productId, qty) => {
    const { cartItems } = get()
    if (qty <= 0) {
      const newItems = cartItems.filter(i => i.productId !== productId)
      set({ cartItems: newItems, cartCount: newItems.reduce((sum, i) => sum + i.qty, 0) })
    } else {
      const newItems = cartItems.map(i => 
        i.productId === productId ? { ...i, qty } : i
      )
      set({ cartItems: newItems, cartCount: newItems.reduce((sum, i) => sum + i.qty, 0) })
    }
  },
  
  clearCart: () => set({ cartItems: [], cartCount: 0 }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  toggleMobileMenu: () => set((s) => ({ showMobileMenu: !s.showMobileMenu })),
  setShowQuickView: (show, productId) => set({ showQuickView: show, quickViewProductId: productId || null }),
  setProductDetail: (productId) => set({ selectedProductId: productId, currentView: 'product-detail' }),
}))
