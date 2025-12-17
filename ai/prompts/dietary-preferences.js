// ============================================================================
// DIETARY PREFERENCES - Prompt modifiers for filtering dish selection
// ============================================================================

import { dedent } from '../../lib/utils.js';

// Dietary preference configurations with prompt modifiers
export const DIETARY_PREFERENCES = {
  'regular': {
    id: 'regular',
    name: 'Regular',
    displayName: 'Regular (Default)',
    emoji: '🍽️',
    description: 'All menu items available - no dietary restrictions',
    modifier: '', // No additional constraints
  },
  'vegetarian': {
    id: 'vegetarian',
    name: 'Vegetarian',
    emoji: '🥗',
    description: 'Plant-based dishes with eggs and dairy - no meat, poultry, or fish',
    modifier: '\n\n' + dedent`
      ## DIETARY PREFERENCE: VEGETARIAN
      - Select ONLY vegetarian dishes from the menu (no meat, poultry, or fish)
      - Include plant-based proteins, vegetables, grains, pasta, legumes, eggs, and dairy
      - If the menu has limited vegetarian options, prioritize salads, pasta dishes, grain bowls, and vegetable-based items
    `,
  },
  'vegan': {
    id: 'vegan',
    name: 'Vegan',
    emoji: '🌱',
    description: 'Strictly plant-based - no animal products including dairy and eggs',
    modifier: '\n\n' + dedent`
      ## DIETARY PREFERENCE: VEGAN
      - Select ONLY vegan dishes from the menu (no animal products: no meat, poultry, fish, dairy, eggs, or honey)
      - Include plant-based proteins, vegetables, grains, legumes, nuts, and seeds
      - If the menu has limited vegan options, prioritize salads (without cheese/dressing), vegetable dishes, grain bowls, and fruit-based items
    `,
  },
  'gluten-free': {
    id: 'gluten-free',
    name: 'Gluten Free',
    emoji: '🌾',
    description: 'No wheat, barley, rye, or gluten-containing ingredients',
    modifier: '\n\n' + dedent`
      ## DIETARY PREFERENCE: GLUTEN FREE
      - Select ONLY gluten-free dishes from the menu (no wheat, barley, rye, or derivatives)
      - Include naturally gluten-free items: grilled proteins, rice dishes, salads, vegetables, fruits
      - Avoid pasta, bread, breaded items, and dishes with flour-based sauces unless explicitly marked gluten-free
    `,
  },
  'dairy-free': {
    id: 'dairy-free',
    name: 'Dairy Free',
    emoji: '🥛',
    description: 'No milk, cheese, butter, cream, or dairy products',
    modifier: '\n\n' + dedent`
      ## DIETARY PREFERENCE: DAIRY FREE
      - Select ONLY dairy-free dishes from the menu (no milk, cheese, butter, cream, or yogurt)
      - Include dishes with meat, poultry, fish, vegetables, grains, and non-dairy alternatives
      - Avoid creamy sauces, cheese-topped dishes, and items with visible dairy products
    `,
  },
  'healthy': {
    id: 'healthy',
    name: 'Healthy',
    emoji: '💪',
    description: 'Nutrient-dense, balanced meals with lean proteins and vegetables',
    modifier: '\n\n' + dedent`
      ## DIETARY PREFERENCE: HEALTHY
      - Prioritize nutrient-dense, balanced dishes with lean proteins, whole grains, and vegetables
      - Select grilled, baked, or steamed items over fried options
      - Include colorful vegetable-forward dishes, salads with lean proteins, grain bowls, and fish
      - Avoid heavily fried, cream-based, or processed items
    `,
  },
  'high-protein': {
    id: 'high-protein',
    name: 'High Protein',
    emoji: '🥩',
    description: 'Protein-forward dishes with substantial meat, fish, eggs, or legumes',
    modifier: '\n\n' + dedent`
      ## DIETARY PREFERENCE: HIGH PROTEIN
      - Prioritize dishes with substantial protein content (meat, poultry, fish, seafood, eggs, legumes)
      - Select items like steaks, grilled chicken, fish fillets, seafood platters, egg dishes, and protein bowls
      - Ensure each dish features protein as the primary component
      - Include sides that complement protein (vegetables, legumes) rather than just carbohydrates
    `,
  },
  'keto': {
    id: 'keto',
    name: 'Keto',
    emoji: '🥑',
    description: 'High-fat, low-carb with no bread, pasta, rice, or sugar',
    modifier: '\n\n' + dedent`
      ## DIETARY PREFERENCE: KETO
      - Select ONLY low-carb, high-fat dishes from the menu (no bread, pasta, rice, potatoes, or sugary items)
      - Prioritize fatty cuts of meat, fish with healthy fats, eggs, cheese, non-starchy vegetables, and nuts
      - Include dishes like steak, salmon, chicken with skin, salads with high-fat dressings, and cheese-based items
      - Avoid all grains, legumes, starchy vegetables, and fruit-based dishes
    `,
  },
};


