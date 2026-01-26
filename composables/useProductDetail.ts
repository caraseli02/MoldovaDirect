import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ProductWithRelations } from '~/types/database'
import type { Product } from '~/stores/cart/types'
import { useCart } from '~/composables/useCart'
import { useProductUtils } from '~/composables/useProductUtils'
import { useToast } from '~/composables/useToast'
import { getErrorMessage } from '~/utils/errorUtils'

/**
 * Composable for Product Detail Page logic
 * Encapsulates state and business logic from pages/products/[slug].vue
 *
 * @param product - Reactive product data from API
 *
 * @returns {Object} Product detail state and actions
 * @returns {Ref<number>} selectedImageIndex - Currently selected gallery image index
 * @returns {Ref<number>} selectedQuantity - Quantity to add to cart
 * @returns {Ref<string | null>} shareFeedback - User feedback message after sharing
 * @returns {Ref<boolean>} showZoomModal - Image zoom modal visibility
 * @returns {ComputedRef<string | undefined>} selectedImage - Currently selected image URL
 * @returns {ComputedRef<number>} stockQuantity - Available stock count
 * @returns {ComputedRef<boolean>} isProductInCart - Whether product is already in cart
 * @returns {ComputedRef<string | undefined>} categoryLabel - Localized category name
 * @returns {ComputedRef<ProductWithRelations[]>} relatedProducts - Related products from same category
 * @returns {ComputedRef<Array<{id, title, price}>>} bundleItems - Bundle product items
 * @returns {ComputedRef<string[]>} trustPromises - Trust/promises badges text
 * @returns {ComputedRef<Array<{id, question, answer, defaultOpen}>>} faqItems - FAQ items
 * @returns {Function} shareProduct - Share product via native API or clipboard
 * @returns {Function} openZoomModal - Open image zoom modal
 * @returns {Function} addToCart - Add product to cart with selected quantity
 */
export function useProductDetail(product: Ref<ProductWithRelations | null>) {
  const { t } = useI18n()
  const { addItem, isInCart } = useCart()
  const toast = useToast()
  const { getLocalizedText, getCategoryLabel } = useProductUtils()

  // UI State
  const selectedImageIndex = ref(0)
  const selectedQuantity = ref(1)
  const shareFeedback = ref<string | null>(null)
  const showZoomModal = ref(false)

  // Computed Properties
  const selectedImage = computed(() => {
    return product.value?.images?.[selectedImageIndex.value]
  })

  const stockQuantity = computed(() => product.value?.stockQuantity || 0)

  const isProductInCart = computed(() => {
    if (!product.value) return false
    return isInCart(String(product.value.id))
  })

  const categoryLabel = computed(() => getCategoryLabel(product.value?.category))

  const relatedProducts = computed(() => product.value?.relatedProducts || [])

  const bundleItems = computed(() => {
    if (!relatedProducts.value.length) return []
    return relatedProducts.value.slice(0, 3).map((item: ProductWithRelations) => ({
      id: item.id,
      title: getLocalizedText(item.name as Record<string, string>),
      price: item.price || Number(item.formattedPrice?.replace('€', '') || 0),
    }))
  })

  const trustPromises = computed(() => [
    t('products.trust.shipping'),
    t('products.trust.returns'),
    t('products.trust.authentic'),
    t('products.trust.payments'),
    t('products.trust.support'),
  ])

  // FAQ Items Logic
  const faqItems = computed(() => {
    const categorySlug = product.value?.category?.slug?.toLowerCase() || ''
    const categoryName = categoryLabel.value?.toLowerCase() || ''

    // Base FAQs shown for all products
    const baseFaqs = [
      {
        id: 'delivery',
        question: t('products.faq.items.delivery.question'),
        answer: t('products.faq.items.delivery.answer'),
        defaultOpen: true,
      },
      {
        id: 'returns',
        question: t('products.faq.items.returns.question'),
        answer: t('products.faq.items.returns.answer'),
      },
    ]

    // Category-specific FAQs
    const isWineOrBeverage = categorySlug.includes('wine') || categorySlug.includes('vino') || categorySlug.includes('vin') || categorySlug.includes('beverage')
    const isFoodOrCulinary = categorySlug.includes('food') || categorySlug.includes('comida') || categorySlug.includes('cuisine') || categoryName.includes('food')
    const isTextile = categorySlug.includes('textile') || categorySlug.includes('fabric') || categorySlug.includes('tejido') || categoryName.includes('textile')
    const isCraft = categorySlug.includes('craft') || categorySlug.includes('artisan') || categorySlug.includes('artesania') || categoryName.includes('craft')

    if (isWineOrBeverage) {
      baseFaqs.push({
        id: 'storage',
        question: t('products.faq.items.storage.question'),
        answer: t('products.faq.items.storage.answer'),
      })
      baseFaqs.push({
        id: 'allergens',
        question: t('products.faq.items.allergens.question'),
        answer: t('products.faq.items.allergens.answer'),
      })
    }
    else if (isFoodOrCulinary) {
      baseFaqs.push({
        id: 'allergens',
        question: t('products.faq.items.allergens.question'),
        answer: t('products.faq.items.allergens.answer'),
      })
      baseFaqs.push({
        id: 'storage',
        question: t('products.faq.items.storage.question'),
        answer: t('products.faq.items.storage.answer'),
      })
    }
    else if (isTextile) {
      baseFaqs.push({
        id: 'care',
        question: t('products.faq.items.care.question'),
        answer: t('products.faq.items.care.answer'),
      })
      baseFaqs.push({
        id: 'materials',
        question: t('products.faq.items.materials.question'),
        answer: t('products.faq.items.materials.answer'),
      })
    }
    else if (isCraft) {
      baseFaqs.push({
        id: 'materials',
        question: t('products.faq.items.materials.question'),
        answer: t('products.faq.items.materials.answer'),
      })
      baseFaqs.push({
        id: 'origin',
        question: t('products.faq.items.origin.question'),
        answer: t('products.faq.items.origin.answer'),
      })
    }

    return baseFaqs
  })

  // Actions
  const shareProduct = async () => {
    try {
      const shareData = {
        title: getLocalizedText(product.value?.name as Record<string, string> | null | undefined),
        text: getLocalizedText(product.value?.shortDescription as Record<string, string> | null | undefined) || t('products.actions.shareText'),
        url: window.location.href,
      }
      if (navigator.share) {
        await navigator.share(shareData)
        shareFeedback.value = t('products.actions.sharedSuccess')
      }
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href)
        shareFeedback.value = t('products.actions.linkCopied')
      }
      else {
        shareFeedback.value = t('products.actions.copyFallback')
      }
      setTimeout(() => {
        shareFeedback.value = null
      }, 4000)
    }
    catch (err: unknown) {
      // Don't log user cancellations (AbortError) as errors
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      console.warn('[useProductDetail] Share failed:', getErrorMessage(err))
      shareFeedback.value = t('products.actions.shareError')
    }
  }

  const openZoomModal = () => {
    showZoomModal.value = true
  }

  const addToCart = async () => {
    if (!product.value) {
      console.warn('[useProductDetail] addToCart called without product data')
      return
    }

    // Guard: Skip cart operations during SSR
    if (import.meta.server || typeof window === 'undefined') {
      console.warn('[useProductDetail] addToCart called during SSR - cart operations are client-only')
      return
    }

    try {
      if (typeof addItem !== 'function') {
        const error = `addItem is not a function (type: ${typeof addItem})`
        console.warn('[useProductDetail]', error)
        throw new Error(error)
      }

      const cartProduct: Product = {
        id: product.value.id.toString(),
        slug: product.value.slug,
        name: getLocalizedText(product.value.name as Record<string, string>),
        price: Number(product.value.price),
        images: product.value.images?.map(img => img.url) || [],
        stock: product.value.stockQuantity,
      }

      await addItem(cartProduct, selectedQuantity.value)

      const productName = getLocalizedText(product.value.name as Record<string, string>)
      toast.success(
        t('cart.success.added'),
        { description: t('cart.success.productAdded', { product: productName }) },
      )
    }
    catch (err: unknown) {
      const errorMsg = err instanceof Error ? getErrorMessage(err) : String(err)
      console.warn('[useProductDetail] Add to cart failed:', errorMsg, err)

      toast.error(
        t('cart.error.addFailed'),
        { description: t('cart.error.addFailedDetails') },
      )
    }
  }

  // Watchers
  watch(product, (newProduct) => {
    if (newProduct) {
      selectedImageIndex.value = 0
      if ((newProduct.stockQuantity || 0) < selectedQuantity.value) {
        selectedQuantity.value = Math.max(1, newProduct.stockQuantity || 1)
      }
    }
  }, { immediate: true })

  return {
    // State
    selectedImageIndex,
    selectedQuantity,
    shareFeedback,
    showZoomModal,

    // Computed
    selectedImage,
    stockQuantity,
    isProductInCart,
    categoryLabel,
    relatedProducts,
    bundleItems,
    trustPromises,
    faqItems,

    // Actions
    shareProduct,
    openZoomModal,
    addToCart,
  }
}
