import { useCartStore } from "~/stores/cart";
import { useCartAnalytics } from "~/composables/useCartAnalytics";
import { getActivePinia } from "pinia";

export const useCart = () => {
  // access the store, fallback if not available
    const pinia = usePinia()
  
    const  cartStore = useCartStore(pinia);
    const  cartAnalytics = useCartAnalytics(pinia);
    const  cartPerformance = useCartPerformance();



  // If store is not available, return minimal interface
  if (!cartStore) {
    // Return minimal interface for SSR
    return {
      items: ref([]),
      itemCount: ref(0),
      subtotal: ref(0),
      isEmpty: ref(true),
      loading: ref(false),
      error: ref(null),
      sessionId: ref(null),
      isInCart: () => false,
      getItemByProductId: () => undefined,
      addItem: async () => {},
      updateQuantity: async () => {},
      removeItem: async () => {},
      clearCart: async () => {},
      validateCart: async () => {},
      directAddItem: async () => {},
      directUpdateQuantity: async () => {},
      directRemoveItem: async () => {},
      directClearCart: async () => {},
      directValidateCart: async () => {},
      recoverCart: async () => false,
      forceSync: () => false,
      storageType: ref("memory"),
      lastSyncAt: ref(null),
      validationInProgress: ref(false),
      backgroundValidationEnabled: ref(false),
      lastBackgroundValidation: ref(null),
      toggleBackgroundValidation: () => {},
      clearValidationCache: () => {},
      validateCartWithRetry: async () => false,
      selectedItems: ref(new Set()),
      selectedItemsCount: ref(0),
      selectedItemsSubtotal: ref(0),
      allItemsSelected: ref(false),
      hasSelectedItems: ref(false),
      bulkOperationInProgress: ref(false),
      isItemSelected: () => false,
      getSelectedItems: ref([]),
      toggleItemSelection: () => {},
      selectAllItems: () => {},
      clearSelection: () => {},
      bulkRemoveSelected: async () => {},
      bulkUpdateQuantity: async () => {},
      bulkSaveForLater: async () => {},
      savedForLater: ref([]),
      savedForLaterCount: ref(0),
      isProductSavedForLater: () => false,
      getSavedForLaterItem: () => undefined,
      saveItemForLater: async () => {},
      moveFromSavedToCart: async () => {},
      removeFromSavedForLater: async () => {},
      clearSavedForLater: async () => {},
      recommendations: ref([]),
      recommendationsLoading: ref(false),
      loadRecommendations: async () => {},
      addRecommendedProduct: async () => {},
      clearRecommendations: () => {},
      trackCartView: () => {},
      trackCheckoutStart: () => {},
      trackCheckoutComplete: () => {},
      formatPrice: (price: number) => `€${price.toFixed(2)}`,
      formattedSubtotal: ref("€0.00"),
      formattedSelectedSubtotal: ref("€0.00"),
    };
  }

  // cartStore is already defined from the try-catch above
  const toast = (() => {
    try {
      return useToast();
    } catch {
      return {
        success: () => {},
        error: () => {},
        warning: () => {},
        info: () => {},
      };
    }
  })();

  // Initialize cart on first use with error handling
  if (!cartStore.sessionId) {
    try {
      cartStore.initializeCart();

      // Setup cart analytics abandonment detection
      const cleanupAbandonmentDetection =
        cartAnalytics?.setupAbandonmentDetection?.(
          computed(() => cartStore.items)
        );

      // Cleanup on unmount (if in a component context)
      if (getCurrentInstance()) {
        onUnmounted(() => {
          if (cleanupAbandonmentDetection) {
            cleanupAbandonmentDetection();
          }
        });
      }
    } catch (error) {
      console.error("Failed to initialize cart:", error);
      toast.error("Error de inicialización", "No se pudo cargar el carrito");
    }
  }

  // Enhanced actions with error handling and performance monitoring
  const safeAddItem = async (product: any, quantity: number = 1) => {
    return await cartPerformance.measureOperation(
      'addItem',
      async () => {
        try {
          await cartStore.addItem(product, quantity);
        } catch (error) {
          // Error is already handled by the store, but we can add additional logic here
          console.error("Failed to add item:", error);
          throw error; // Re-throw to allow component-level handling
        }
      },
      { itemCount: cartStore.itemCount }
    );
  };

  const safeUpdateQuantity = async (itemId: string, quantity: number) => {
    return await cartPerformance.measureOperation(
      'updateQuantity',
      async () => {
        try {
          await cartStore.updateQuantity(itemId, quantity);
        } catch (error) {
          console.error("Failed to update quantity:", error);
          throw error;
        }
      },
      { itemCount: cartStore.itemCount }
    );
  };

  const safeRemoveItem = async (itemId: string) => {
    return await cartPerformance.measureOperation(
      'removeItem',
      async () => {
        try {
          await cartStore.removeItem(itemId);
        } catch (error) {
          console.error("Failed to remove item:", error);
          throw error;
        }
      },
      { itemCount: cartStore.itemCount }
    );
  };

  const safeClearCart = async () => {
    try {
      await cartStore.clearCart();
    } catch (error) {
      console.error("Failed to clear cart:", error);
      toast.error("Error al vaciar carrito", "No se pudo vaciar el carrito");
      throw error;
    }
  };

  const safeValidateCart = async () => {
    return await cartPerformance.measureOperation(
      'validateCart',
      async () => {
        try {
          await cartStore.validateCart();
        } catch (error) {
          console.error("Failed to validate cart:", error);
          throw error;
        }
      },
      { itemCount: cartStore.itemCount }
    );
  };

  return {
    // State
    items: computed(() => cartStore.items),
    itemCount: computed(() => cartStore.itemCount),
    subtotal: computed(() => cartStore.subtotal),
    isEmpty: computed(() => cartStore.isEmpty),
    loading: computed(() => cartStore.loading),
    error: computed(() => cartStore.error),
    sessionId: computed(() => cartStore.sessionId),

    // Getters
    isInCart: (productId: string) => cartStore.isInCart(productId),
    getItemByProductId: (productId: string) =>
      cartStore.getItemByProductId(productId),

    // Safe actions (with error handling)
    addItem: safeAddItem,
    updateQuantity: safeUpdateQuantity,
    removeItem: safeRemoveItem,
    clearCart: safeClearCart,
    validateCart: safeValidateCart,

    // Direct store actions (for cases where you want to handle errors yourself)
    directAddItem: cartStore.addItem,
    directUpdateQuantity: cartStore.updateQuantity,
    directRemoveItem: cartStore.removeItem,
    directClearCart: cartStore.clearCart,
    directValidateCart: cartStore.validateCart,

    // Storage management actions
    recoverCart: async () => {
      try {
        return await cartStore.recoverCartData();
      } catch (error) {
        console.error("Failed to recover cart:", error);
        toast.error("Error de recuperación", "No se pudo recuperar el carrito");
        return false;
      }
    },

    forceSync: () => {
      try {
        return cartStore.forceSyncToStorage();
      } catch (error) {
        console.error("Failed to force sync:", error);
        toast.error(
          "Error de sincronización",
          "No se pudo sincronizar el carrito"
        );
        return false;
      }
    },

    // Storage info
    storageType: computed(() => cartStore.storageType),
    lastSyncAt: computed(() => cartStore.lastSyncAt),

    // Validation info
    validationInProgress: computed(() => cartStore.validationInProgress),
    backgroundValidationEnabled: computed(
      () => cartStore.backgroundValidationEnabled
    ),
    lastBackgroundValidation: computed(
      () => cartStore.lastBackgroundValidation
    ),

    // Validation controls
    toggleBackgroundValidation: () => {
      cartStore.backgroundValidationEnabled =
        !cartStore.backgroundValidationEnabled;
      if (cartStore.backgroundValidationEnabled) {
        cartStore.startBackgroundValidation();
      } else {
        cartStore.stopBackgroundValidation();
      }
    },

    clearValidationCache: (productId?: string) => {
      cartStore.clearValidationCache(productId);
    },

    validateCartWithRetry: async (maxRetries?: number) => {
      try {
        return await cartStore.validateCartWithRetry(maxRetries);
      } catch (error) {
        console.error("Failed to validate cart with retry:", error);
        return false;
      }
    },

    // Advanced features - Bulk operations
    selectedItems: computed(() => cartStore.selectedItems),
    selectedItemsCount: computed(() => cartStore.selectedItemsCount),
    selectedItemsSubtotal: computed(() => cartStore.selectedItemsSubtotal),
    allItemsSelected: computed(() => cartStore.allItemsSelected),
    hasSelectedItems: computed(() => cartStore.hasSelectedItems),
    bulkOperationInProgress: computed(() => cartStore.bulkOperationInProgress),
    isItemSelected: (itemId: string) => cartStore.isItemSelected(itemId),
    getSelectedItems: computed(() => cartStore.getSelectedItems),

    // Bulk operations actions
    toggleItemSelection: (itemId: string) =>
      cartStore.toggleItemSelection(itemId),
    selectAllItems: () => cartStore.selectAllItems(),
    clearSelection: () => cartStore.clearSelection(),
    bulkRemoveSelected: async () => {
      try {
        await cartStore.bulkRemoveSelected();
      } catch (error) {
        console.error("Failed to bulk remove:", error);
        toast.error(
          "Error al eliminar",
          "No se pudieron eliminar los productos seleccionados"
        );
      }
    },
    bulkUpdateQuantity: async (quantity: number) => {
      try {
        await cartStore.bulkUpdateQuantity(quantity);
      } catch (error) {
        console.error("Failed to bulk update quantity:", error);
        toast.error(
          "Error al actualizar",
          "No se pudieron actualizar las cantidades"
        );
      }
    },
    bulkSaveForLater: async () => {
      try {
        await cartStore.bulkSaveForLater();
      } catch (error) {
        console.error("Failed to bulk save for later:", error);
        toast.error("Error al guardar", "No se pudieron guardar los productos");
      }
    },

    // Save for later functionality
    savedForLater: computed(() => cartStore.savedForLater),
    savedForLaterCount: computed(() => cartStore.savedForLaterCount),
    isProductSavedForLater: (productId: string) =>
      cartStore.isProductSavedForLater(productId),
    getSavedForLaterItem: (itemId: string) =>
      cartStore.getSavedForLaterItem(itemId),

    // Save for later actions
    saveItemForLater: async (itemId: string) => {
      try {
        await cartStore.saveItemForLater(itemId);
      } catch (error) {
        console.error("Failed to save for later:", error);
        toast.error("Error al guardar", "No se pudo guardar el producto");
      }
    },
    moveFromSavedToCart: async (savedItemId: string) => {
      try {
        await cartStore.moveFromSavedToCart(savedItemId);
      } catch (error) {
        console.error("Failed to move from saved to cart:", error);
        toast.error(
          "Error al mover",
          "No se pudo mover el producto al carrito"
        );
      }
    },
    removeFromSavedForLater: async (savedItemId: string) => {
      try {
        await cartStore.removeFromSavedForLater(savedItemId);
      } catch (error) {
        console.error("Failed to remove from saved for later:", error);
        toast.error(
          "Error al eliminar",
          "No se pudo eliminar el producto guardado"
        );
      }
    },
    clearSavedForLater: async () => {
      try {
        await cartStore.clearSavedForLater();
      } catch (error) {
        console.error("Failed to clear saved for later:", error);
        toast.error(
          "Error al limpiar",
          "No se pudieron eliminar los productos guardados"
        );
      }
    },

    // Recommendations functionality
    recommendations: computed(() => cartStore.recommendations),
    recommendationsLoading: computed(() => cartStore.recommendationsLoading),

    // Recommendations actions
    loadRecommendations: async () => {
      try {
        await cartStore.loadRecommendations();
      } catch (error) {
        console.error("Failed to load recommendations:", error);
        toast.error(
          "Error al cargar recomendaciones",
          "No se pudieron cargar las recomendaciones"
        );
      }
    },
    addRecommendedProduct: async (product: any, quantity: number = 1) => {
      try {
        await cartStore.addRecommendedProduct(product, quantity);
      } catch (error) {
        console.error("Failed to add recommended product:", error);
        throw error; // Re-throw to allow component-level handling
      }
    },
    clearRecommendations: () => cartStore.clearRecommendations(),

    // Analytics methods
    trackCartView: () => {
      if (process.client) {
        cartAnalytics.trackCartView(cartStore.subtotal, cartStore.itemCount);
      }
    },

    trackCheckoutStart: () => {
      if (process.client) {
        cartAnalytics.trackCheckoutStart(
          cartStore.subtotal,
          cartStore.itemCount,
          cartStore.items
        );
      }
    },

    trackCheckoutComplete: (orderId: number) => {
      if (process.client) {
        cartAnalytics.trackCheckoutComplete(
          orderId,
          cartStore.subtotal,
          cartStore.itemCount,
          cartStore.items
        );
      }
    },

    // Utility methods
    formatPrice: (price: number) => {
      try {
        return new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "EUR",
        }).format(price);
      } catch (error) {
        console.error("Failed to format price:", error);
        return `€${price.toFixed(2)}`;
      }
    },

    // Get formatted subtotal
    formattedSubtotal: computed(() => {
      try {
        return new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "EUR",
        }).format(cartStore.subtotal);
      } catch (error) {
        console.error("Failed to format subtotal:", error);
        return `€${cartStore.subtotal.toFixed(2)}`;
      }
    }),

    // Get formatted selected items subtotal
    formattedSelectedSubtotal: computed(() => {
      try {
        return new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "EUR",
        }).format(cartStore.selectedItemsSubtotal);
      } catch (error) {
        console.error("Failed to format selected subtotal:", error);
        return `€${cartStore.selectedItemsSubtotal.toFixed(2)}`;
      }
    }),

    // Performance monitoring
    startPerformanceMonitoring: cartPerformance.startMonitoring,
    stopPerformanceMonitoring: cartPerformance.stopMonitoring,
    getPerformanceStats: cartPerformance.getPerformanceStats,
    getPerformanceRecommendations: cartPerformance.getPerformanceRecommendations,
    exportPerformanceMetrics: cartPerformance.exportMetrics,
  };
};
