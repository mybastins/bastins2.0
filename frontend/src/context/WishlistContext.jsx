import { createContext, useContext, useState, useEffect } from 'react'

const WishlistContext = createContext()

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bastins_wishlist')) || []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('bastins_wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  function isInWishlist(productId) {
    return wishlist.some(p => p.id === productId)
  }

  function addToWishlist(product) {
    setWishlist(prev => {
      if (prev.some(p => p.id === product.id)) return prev
      return [...prev, product]
    })
  }

  function removeFromWishlist(productId) {
    setWishlist(prev => prev.filter(p => p.id !== productId))
  }

  function toggleWishlist(product) {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      return false
    } else {
      addToWishlist(product)
      return true
    }
  }

  return (
    <WishlistContext.Provider value={{ wishlist, isInWishlist, addToWishlist, removeFromWishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  return useContext(WishlistContext)
}
