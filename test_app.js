const fs = require('fs');
const code = fs.readFileSync('web/app.js', 'utf8');

// Mock DOM
global.document = {
  getElementById: (id) => ({
    addEventListener: () => {},
    classList: { add: () => {}, remove: () => {} },
    innerHTML: '',
    appendChild: () => {},
    style: {}
  }),
  querySelectorAll: () => [],
  createElement: () => ({ style: {}, classList: { add: () => {}, remove: () => {} }, addEventListener: () => {} })
};
global.window = { addEventListener: () => {}, innerWidth: 1000, innerHeight: 1000 };

eval(code);

const engine = new HitTazosEngine();
const cards = JSON.parse(fs.readFileSync('data/cards.json', 'utf8'));
engine.cards = cards;
engine.activeDeck = cards;
engine.currentIndex = 0;
engine.cardStage = { innerHTML: '', appendChild: () => {} };
engine.hudCardCounter = {};
engine.inputYear = {};
engine.guessResultPill = {};
engine.updateRevealButtonState = () => {};
engine.renderAttemptTracker = () => {};
engine.btnSubmitGuess = {};
engine.ambientAura = { style: {} };
engine.attachArtifactCycler = () => {};
engine.refreshIcons = () => {};

engine.cards.forEach((c, idx) => {
  c.globalIndex = idx + 1;
});

try {
  engine.renderActiveArenaCard();
  console.log("No error!");
} catch (e) {
  console.error(e);
}
