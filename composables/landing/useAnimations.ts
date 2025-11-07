export const useAnimations = () => {
  const fadeIn = {
    initial: { opacity: 0 },
    enter: {
      opacity: 1,
      transition: {
        duration: 600,
        ease: 'easeOut'
      }
    }
  }

  const slideUp = {
    initial: { y: 50, opacity: 0 },
    enter: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 600,
        ease: 'easeOut'
      }
    }
  }

  const stagger = (index: number, total: number = 3) => ({
    initial: { opacity: 0, y: 20 },
    enter: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 100,
        duration: 400,
        ease: 'easeOut'
      }
    }
  })

  const scaleIn = {
    initial: { scale: 0.8, opacity: 0 },
    enter: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 500,
        ease: [0.34, 1.56, 0.64, 1] // Elastic ease
      }
    }
  }

  return {
    fadeIn,
    slideUp,
    stagger,
    scaleIn
  }
}
