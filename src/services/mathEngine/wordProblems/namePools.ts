/**
 * Culturally diverse name pools for word problem generation.
 * Gender-neutral selection — no stereotypical associations.
 */
export const NAMES = [
  'Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan',
  'Riley', 'Casey', 'Avery', 'Quinn', 'Dakota',
  'Ari', 'Kai', 'Noor', 'Ravi', 'Mei',
  'Sasha', 'Yuki', 'Amara', 'Luca', 'Zara',
  'Nico', 'Priya', 'Leo', 'Mila', 'Omar',
  'Ella', 'Mateo', 'Ines', 'Kofi', 'Hana',
] as const;

export const OBJECTS = {
  countable: [
    'apples', 'oranges', 'books', 'stickers', 'marbles',
    'crayons', 'cookies', 'pencils', 'blocks', 'stars',
    'flowers', 'buttons', 'shells', 'stones', 'beads',
  ],
  containers: [
    'bags', 'boxes', 'baskets', 'trays', 'jars',
    'plates', 'bowls', 'buckets', 'shelves', 'rows',
  ],
} as const;

export const PLACES = [
  'the park', 'the store', 'the library', 'school',
  'the garden', 'home', 'the playground', 'the bakery',
] as const;

export const ACTIVITIES = [
  'collected', 'found', 'picked', 'bought', 'received',
  'made', 'counted', 'shared', 'arranged', 'packed',
] as const;

export const GIVE_AWAY_VERBS = [
  'gave away', 'shared', 'lost', 'used', 'ate',
  'put back', 'returned', 'donated', 'traded', 'dropped',
] as const;
