// Orden de las letras del libro (la W al final: faltaba en la lista recibida).
const LETTER_ORDER = [
  'A', 'E', 'I', 'O', 'U',
  'L', 'S', 'M', 'P', 'T', 'N', 'D', 'B', 'V', 'J', 'H', 'F', 'R',
  'Z', 'C', 'Y', 'Q', 'G', 'Ñ', 'X', 'K',
  'W'
];

// Vocales del español (la Y no se cuenta como vocal aquí).
const VOWELS = ['A', 'E', 'I', 'O', 'U'];

// Nombre del animal-letra asociado a cada letra.
const LETTER_ANIMALS = {
  A: 'Abeja', B: 'Ballena', C: 'Conejo', D: 'Delfín', E: 'Elefante',
  F: 'Flamenco', G: 'Gato', H: 'Hipopótamo', I: 'Iguana', J: 'Jirafa',
  K: 'Koala', L: 'León', M: 'Mariposa', N: 'Nutria', Ñ: 'Ñandú',
  O: 'Oso', P: 'Pingüino', Q: 'Quetzal', R: 'Rana', S: 'Serpiente',
  T: 'Tortuga', U: 'Urraca', V: 'Vaca', W: 'Wombat', X: 'Xoloitzcuintle',
  Y: 'Yak', Z: 'Zorro'
};

// Banco de palabras sencillas (sin tildes) con un emoji, para el juego "ordena las letras".
// Una palabra solo se propone si TODAS sus letras ya han sido validadas.
const WORD_BANK = [
  { word: 'A', emoji: '🅰️' },
  { word: 'OJO', emoji: '👁️' },
  { word: 'UNO', emoji: '1️⃣' },
  { word: 'SOL', emoji: '☀️' },
  { word: 'PAN', emoji: '🥖' },
  { word: 'PEZ', emoji: '🐟' },
  { word: 'LUNA', emoji: '🌙' },
  { word: 'BEBE', emoji: '👶' },
  { word: 'GATO', emoji: '🐱' },
  { word: 'PATO', emoji: '🦆' },
  { word: 'DADO', emoji: '🎲' },
  { word: 'FOCA', emoji: '🦭' },
  { word: 'LEON', emoji: '🦁' },
  { word: 'MAMA', emoji: '👩' },
  { word: 'PAPA', emoji: '👨' },
  { word: 'NIÑO', emoji: '🧒' },
  { word: 'FLOR', emoji: '🌸' },
  { word: 'RANA', emoji: '🐸' },
  { word: 'VACA', emoji: '🐄' },
  { word: 'ROPA', emoji: '👕' },
  { word: 'CASA', emoji: '🏠' },
  { word: 'BOTA', emoji: '👢' },
  { word: 'TREN', emoji: '🚂' },
  { word: 'ZORRO', emoji: '🦊' },
  { word: 'TIGRE', emoji: '🐯' },
  { word: 'DINO', emoji: '🦖' },
  { word: 'BARCO', emoji: '⛵' },
  { word: 'BESO', emoji: '💋' },
  { word: 'REY', emoji: '🤴' },
  { word: 'OSO', emoji: '🐻' },
  { word: 'KOALA', emoji: '🐨' },
];
