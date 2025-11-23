// ============================================================================
// UTILITIES - Helper functions and utilities
// ============================================================================

/**
 * Validate that a setting value exists
 * @throws {Error} if value is undefined, null, or empty string
 */
export function assertSetting(value, message) {
  if (value === undefined || value === null || value === '') throw new Error(message);
}

/**
 * Throw an AbortError if the signal has been aborted
 * @throws {DOMException} AbortError if signal is aborted
 */
export function throwIfAborted(signal) {
  if (signal && signal.aborted) throw new DOMException('Aborted', 'AbortError');
}

/**
 * Get a random food fact for display during processing
 * @returns {string} Random food fact
 */
export function getRandomFoodFact() {
  return FOOD_FACTS[Math.floor(Math.random() * FOOD_FACTS.length)];
}

// Fun facts about food to display during processing
const FOOD_FACTS = [
  'Did you know? The average person eats about 35 tons of food in their lifetime! 🍴',
  'Food fact: Honey never spoils. Archaeologists found 3,000 year old honey in Egyptian tombs! 🍯',
  'Chef\'s tip: Let meat rest after cooking for juicier results 🥩',
  'Fun fact: Apples float because they\'re 25% air! 🍎',
  'Did you know? Carrots were originally purple before the 17th century! 🥕',
  'Food science: Tomatoes have more genes than humans! 🍅',
  'Pro tip: Store herbs like flowers in water to keep them fresh 🌿',
  'Amazing fact: Chocolate was once used as currency by the Aztecs! 🍫',
  'Did you know? Pineapples take about 2 years to grow! 🍍',
  'Kitchen hack: Freeze leftover herbs in ice cube trays with olive oil 🧊',
  'Food fact: Avocados are actually berries! 🥑',
  'Did you know? Bananas are berries, but strawberries aren\'t! 🍓',
  'Chef wisdom: Season your food in layers while cooking, not just at the end 🧂',
  'Fun fact: A strawberry isn\'t technically a berry, it\'s an aggregate fruit! 🍓',
  'Food history: Ketchup was sold as medicine in the 1830s! 🍅',
  'Amazing: Potatoes were the first food grown in space! 🥔',
  'Did you know? Cashews grow on the bottom of cashew apples! 🥜',
  'Food fact: Vanilla is the second most expensive spice after saffron! 🍦',
  'Chef secret: Add a pinch of salt to sweet dishes to enhance flavor 🧂',
  'Fun fact: Peanuts aren\'t nuts - they\'re legumes like beans! 🥜',
  'Did you know? Almonds are seeds, not nuts! 🌰',
  'Food science: Raspberries are members of the rose family! 🌹',
  'Amazing: Cucumbers are 96% water - the most of any solid food! 🥒',
  'Kitchen tip: Store tomatoes at room temperature for better flavor 🍅',
  'Fun fact: White chocolate isn\'t technically chocolate (no cocoa solids)! 🍫',
  'Did you know? Mushrooms are more closely related to humans than plants! 🍄',
  'Food history: Ice cream cones were invented by accident at the 1904 World\'s Fair! 🍦',
  'Amazing: Cranberries bounce when they\'re ripe - that\'s how they\'re sorted! 🫐',
  'Chef tip: Room temperature eggs whip up fluffier than cold ones 🥚',
  'Fun fact: Garlic can draw out splinters when applied to the skin! 🧄',
  'Did you know? Peppers have more vitamin C than oranges! 🫑',
  'Food science: Eating spicy food can trigger endorphin release! 🌶️',
  'Kitchen hack: Freeze cookie dough balls for fresh-baked cookies anytime 🍪',
  'Amazing: Pistachios can spontaneously combust when stored in large quantities! 🥜',
  'Fun fact: The fear of cooking is called "mageirocophobia"! 👨‍🍳',
  'Did you know? Worcestershire sauce is basically fermented anchovy juice! 🐟',
  'Chef wisdom: Taste as you cook - it\'s the key to great food! 👅',
  'Food fact: Nutmeg is a hallucinogen in large doses (don\'t try it!)! 🥜',
  'Amazing: A cluster of bananas is called a "hand", single bananas are "fingers"! 🍌',
  'Kitchen tip: Add acid (lemon/vinegar) to brighten and balance flavors 🍋',
  'Fun fact: Octopuses have been observed farming their food! 🐙',
  'Did you know? Coffee beans are actually seeds from a fruit called a cherry! ☕',
  'Food history: Fortune cookies were invented in California, not China! 🥠',
  'Chef secret: Cold butter makes flakier pastry than soft butter! 🧈',
  'Amazing: Honey is the only food that never goes bad naturally! 🍯',
];
