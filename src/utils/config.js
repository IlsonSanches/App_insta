// Configurações do projeto
export const CONFIG = {
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || 'your-api-key-here',
  RESTAURANT: {
    name: 'Jet Chicken',
    location: 'Londrina/PR',
    type: 'Restaurante de Frango',
    instagram: '@jetchicken'
  },
  CONTENT_GENERATION: {
    defaultIdeasCount: 5,
    scheduleDay: 1, // Segunda-feira
    scheduleHour: 9, // 9h da manhã
    maxHistoryEntries: 50
  }
};
