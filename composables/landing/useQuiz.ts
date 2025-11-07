export const useQuiz = () => {
  const currentStep = ref(0)
  const answers = ref<string[]>([])
  const { t } = useI18n()

  const questions = computed(() => [
    {
      id: 1,
      question: t('quiz.questions.q1.question'),
      options: [
        { value: 'wine', label: t('quiz.questions.q1.options.wine'), icon: 'lucide:wine' },
        { value: 'food', label: t('quiz.questions.q1.options.food'), icon: 'lucide:utensils' },
        { value: 'both', label: t('quiz.questions.q1.options.both'), icon: 'lucide:sparkles' },
        { value: 'gifts', label: t('quiz.questions.q1.options.gifts'), icon: 'lucide:gift' }
      ]
    },
    {
      id: 2,
      question: t('quiz.questions.q2.question'),
      options: [
        { value: 'beginner', label: t('quiz.questions.q2.options.beginner'), icon: 'lucide:sprout' },
        { value: 'casual', label: t('quiz.questions.q2.options.casual'), icon: 'lucide:glass-water' },
        { value: 'enthusiast', label: t('quiz.questions.q2.options.enthusiast'), icon: 'lucide:award' },
        { value: 'connoisseur', label: t('quiz.questions.q2.options.connoisseur'), icon: 'lucide:crown' }
      ]
    },
    {
      id: 3,
      question: t('quiz.questions.q3.question'),
      options: [
        { value: 'under25', label: t('quiz.questions.q3.options.under25'), icon: 'lucide:circle-dollar-sign' },
        { value: '25-50', label: t('quiz.questions.q3.options.mid'), icon: 'lucide:dollar-sign' },
        { value: '50-100', label: t('quiz.questions.q3.options.high'), icon: 'lucide:badge-dollar-sign' },
        { value: 'over100', label: t('quiz.questions.q3.options.premium'), icon: 'lucide:gem' }
      ]
    },
    {
      id: 4,
      question: t('quiz.questions.q4.question'),
      options: [
        { value: 'personal', label: t('quiz.questions.q4.options.personal'), icon: 'lucide:home' },
        { value: 'gift', label: t('quiz.questions.q4.options.gift'), icon: 'lucide:gift' },
        { value: 'party', label: t('quiz.questions.q4.options.party'), icon: 'lucide:party-popper' },
        { value: 'collection', label: t('quiz.questions.q4.options.collection'), icon: 'lucide:archive' }
      ]
    }
  ])

  const totalSteps = computed(() => questions.value.length + 1) // +1 for welcome screen

  const nextStep = () => {
    if (currentStep.value < totalSteps.value) {
      currentStep.value++
    }
  }

  const prevStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--
    }
  }

  const restart = () => {
    currentStep.value = 0
    answers.value = []
  }

  return {
    questions,
    currentStep,
    totalSteps,
    answers,
    nextStep,
    prevStep,
    restart
  }
}
