/**
 * Plantillas de retroalimentación para diferentes niveles de puntuación espiritual
 */
export const feedbackTemplates = [
  {
    minScore: 4,
    maxScore: 5,
    message: 'Your spiritual life is blossoming deeply and richly! You are experiencing regular moments of divine connection, gratitude, and compassion. Sustaining this beautiful balance is key to nurturing others or being on deeper forms of spiritual discipline.',
    recommendations: [
      'Consider mentoring others in their spiritual journey',
      'Deepen your practice through retreats or advanced studies',
      'Share your insights with your community'
    ]
  },
  {
    minScore: 3,
    maxScore: 3.99,
    message: 'Your spiritual life shows meaningful growth and balance. You regularly connect with the divine and experience moments of peace. Continue nurturing these practices for even deeper spiritual fulfillment.',
    recommendations: [
      'Establish a more consistent spiritual routine',
      'Explore new spiritual disciplines that interest you',
      'Connect with a spiritual community for support'
    ]
  },
  {
    minScore: 2,
    maxScore: 2.99,
    message: 'Your spiritual journey is taking root. You have moments of connection, but may benefit from more regular spiritual practices to deepen your experience.',
    recommendations: [
      'Set aside dedicated time each day for spiritual practice',
      'Start with simple meditation or prayer exercises',
      'Read inspirational spiritual texts that resonate with you'
    ]
  },
  {
    minScore: 0,
    maxScore: 1.99,
    message: 'You are at the beginning of your spiritual journey. This is a perfect time to explore practices that can help you develop a deeper connection with yourself and the divine.',
    recommendations: [
      'Begin with 5 minutes of quiet reflection each day',
      'Explore different spiritual traditions to find what resonates with you',
      'Consider joining a beginners group for guidance'
    ]
  }
];

/**
 * Valores constantes para las métricas del dashboard
 */
export const dashboardConstants = {
  // Estos valores son constantes para la UI y no están relacionados con respuestas reales
  compassionBaseValue: 70,
  closenessBaseValue: 100,
  // Multiplicador para convertir puntuaciones (1-5) a porcentajes (0-100%)
  percentageMultiplier: 20
}; 