// ──────────────────────────────────────────────────────────────────────────
// THE SLEEPING KING — central mystery for the open world.
//
// Long ago a king named Ossian Varlo loved the moon and bargained with it.
// He would sleep beneath the world if the moon would never fully set.
// The moon agreed. He went under. The castles followed him through the soil.
// Now the moon waits, half-open. The kingdom forgot its own name. Travelers
// keep appearing at the edge of the meadow with no memory of how they
// arrived. Some of them are him. Some of them are looking for him. Some of
// them are the moon's, and don't know yet.
//
// Each character carries pieces of this story. The MYSTERY_STAGES below
// upgrade the rumor stream as the player collects more lore.
// ──────────────────────────────────────────────────────────────────────────

export const MYSTERY = {
  king: "Ossian Varlo",
  kingdom: "the kingdom whose name was eaten",
  bargain: "the moon would never fully set, if the king would never fully wake",
};

export const MYSTERY_STAGES = [
  {
    threshold: 0,
    rumor: "You woke on a meadow with no memory of the road. The world acts like it has been waiting.",
  },
  {
    threshold: 2,
    rumor: "Folk keep mentioning a king. Nobody agrees on the verb that follows him — slept, sank, chose, was taken.",
  },
  {
    threshold: 4,
    rumor: "A bargain with the moon: it would never fully set, if the king would never fully wake. The castles followed him under.",
  },
  {
    threshold: 7,
    rumor: "His name was Ossian Varlo. The grass still flinches when it is said aloud. Nine syllables were hidden before he went down.",
  },
  {
    threshold: 11,
    rumor: "The moon stays half-open because it is waiting — for him to rise, or for someone to carry his name back up the stairs.",
  },
  {
    threshold: 15,
    rumor: "Travelers do not arrive here on purpose. Nobody does. Doors, wells, and hollow trees are all the same mouth.",
  },
  {
    threshold: 20,
    rumor: "Speak Ossian Varlo on a Moon Stair when the torches are lit. The moon has been listening since the Long Bell Festival.",
  },
];

// ──────────────────────────────────────────────────────────────────────────
// CHARACTERS
//
// Each character has:
//   id, name, glyph, fg, bg, wander, tempo, role, sketch, bio
//   intros           — first-meeting lines (5)
//   repeatIntros     — returning lines (3)
//   lateIntros       — lines once the mystery has matured (2)
//   banter           — short flavor lines randomly appended (5–7)
//   lore             — progressive revelations about the king (3)
//   questions        — character-specific encounters (3–4 each)
// ──────────────────────────────────────────────────────────────────────────

export const CHARACTER_TYPES = [
  {
    id: "wizard",
    name: "Moss-Crowned Wizard",
    glyph: "W",
    fg: "#d7c4ff",
    bg: "#25144b",
    wander: 1.8,
    tempo: 0.9,
    role: "Witness",
    bio: "Keeper of wrong constellations, patient thunder, and prophecies folded into damp leaves.",
    sketch: [
      "   /\\   ",
      "  /##\\  ",
      " (o  o) ",
      " /|~~|\\ ",
      "  /__\\  ",
    ],
    intros: [
      "Your shadow is leaning north. Long ago, that meant the moon owed someone a favor.",
      "The grass around your boots is whispering in threes. I only trust whispers in fours.",
      "I know your trail: star-dust, river mist, and the old mistake of walking confidently.",
      "The blue mushrooms have stopped arguing to stare at you. That is either honor or indigestion.",
      "A comet once hid in my hat for seven winters. It sneezed your name this morning.",
    ],
    repeatIntros: [
      "You. Again. The mushrooms had a small wager. They lost gracefully.",
      "I see you brought your bootlace back. I had hoped it would defect.",
      "My hat recognized you before I did. My hat is rude about it.",
    ],
    lateIntros: [
      "You smell like an old name. Don't tell me which. I'm trying to forget it correctly.",
      "I was at the bargain. Don't quote me. I quoted myself once and the moon raised an eyebrow.",
    ],
    banter: [
      "Mind the thunder. It is patient but pettable.",
      "I lost a vowel here in 1402. Tell me if you find an O.",
      "Prophecies are mostly accurate after the fact. That is how prophecy works.",
      "The leaves are arguing politics again.",
      "I have a spell for boredom. It is, regrettably, also boring.",
      "Don't sign anything the goose offers you.",
    ],
    lore: [
      "The king was a tall, distractible man. He liked the moon more than he liked his throne.",
      "On the night it happened, the moon refused to set. The court called it a miracle. I called it a contract.",
      "He hid his name in nine places before he went under. I will not say where. I'm not invited to that kind of riddle anymore.",
    ],
    questions: [
      {
        prompt: "My wand has three opinions about you. Which one do you want repeated to the moon?",
        choices: [
          { label: "A. 'They owe a name.'", result: "The wand hums in agreement. The path forward lightens by one cloud.", score: 150, jump: 4 },
          { label: "B. 'They are not the king.'", result: "The wand looks unconvinced, but writes it down anyway.", score: 130 },
          { label: "C. 'The wand is also lying.'", result: "The wand laughs so hard it sheds two splinters. The road sighs and lets you through.", score: 170, jump: 5 },
        ],
      },
      {
        prompt: "A prophecy folded itself into your bootprint. Should I unfold it?",
        choices: [
          { label: "A. Read it now", result: "The prophecy is one sentence long. It says, 'maybe.' Disappointing. Useful.", score: 140 },
          { label: "B. Burn it first", result: "The ashes spell a doorway. We both pretend not to notice.", score: 160, jump: 6 },
          { label: "C. Refold it neatly", result: "The bootprint becomes slightly more sincere. You walk taller.", score: 135, jump: 3 },
        ],
      },
      {
        prompt: "I have a name on my tongue. It tastes like iron and old apologies. Should I spit it out?",
        choices: [
          { label: "A. Swallow it back", result: "I do. The crows look disappointed. They were betting.", score: 125 },
          { label: "B. Whisper it to the moss", result: "The moss faints politely. A passage appears beneath it.", score: 165, jump: 5 },
          { label: "C. Say it to me", result: "I refuse, but the offer is generous. The wand notes you down kindly.", score: 155 },
        ],
      },
    ],
  },
  {
    id: "fairy",
    name: "Bellflower Fairy",
    glyph: "F",
    fg: "#f6a6ff",
    bg: "#3b123d",
    wander: 2.4,
    tempo: 1.35,
    role: "Skeptic",
    bio: "A winged mischief-maker who thinks the king is overrated and the moon is a drama queen.",
    sketch: [
      " \\  |  /",
      "  .-.-. ",
      "<( o )>",
      "  `-'-` ",
      " /  |  \\",
    ],
    intros: [
      "You smell faintly of bramble jam and poor decisions. Delightful.",
      "These flowers bowed when you arrived. Either you are noble, or they are teasing you.",
      "A tale says the first traveler traded a sneeze for a kingdom. I still have the sneeze.",
      "Your left boot is trying to look innocent. I respect footwear with secrets.",
      "The dew has arranged itself into applause, which is rude because I had not begun.",
    ],
    repeatIntros: [
      "Oh, the boots again. Have they apologized to anything yet?",
      "I missed you for about ninety seconds. It was harrowing.",
      "Back so soon. The bellflowers practiced gossip in your absence.",
    ],
    lateIntros: [
      "Don't get teary about the king. He chose this. Choosing things is fashionable.",
      "If you find a syllable lying around with no shoes, it's mine. Or his. Honestly, who tracks these things.",
    ],
    banter: [
      "I'm not gossiping. I'm just performing the news loudly.",
      "Bramble jam is medicinal if you say it firmly.",
      "The bellflowers are unionizing.",
      "I once dated a comet. Bad commute.",
      "Don't apologize to the grass. It encourages them.",
      "The moon owes me three favors and a hat.",
    ],
    lore: [
      "The fairies threw a party the night the moon stayed up. We thought it was for us. It was for him.",
      "Ossian Varlo loved poetry that didn't rhyme. That should have warned someone.",
      "I helped hide a syllable in a bellflower once. I drank too much pollen. I forget which one. Sorry.",
    ],
    questions: [
      {
        prompt: "I owe a syllable to a bramble. Hum me a noise it might accept.",
        choices: [
          { label: "A. A long 'oh'", result: "The bramble sighs and lets the path through. Round vowels are gentle currency.", score: 145, jump: 4 },
          { label: "B. A short 'iss'", result: "The bramble stiffens. You guessed too close. The path opens anyway, suspicious.", score: 165, jump: 5 },
          { label: "C. A polite 'mm'", result: "Polite always works on bushes.", score: 130 },
        ],
      },
      {
        prompt: "Do you want a wish, or a warning? Quickly. I am also doing my nails.",
        choices: [
          { label: "A. A wish", result: "Granted, with caveats nobody reads. You feel inconvenienced and luckier.", score: 135 },
          { label: "B. A warning", result: "'Don't wear crowns you find in mud.' The mud is offended on principle.", score: 160, jump: 5 },
          { label: "C. Your nails look fine", result: "Flattery accepted. I shoo a thornpatch out of your way.", score: 155, jump: 4 },
        ],
      },
      {
        prompt: "A bellflower wants to confess. Should I let it?",
        choices: [
          { label: "A. Let it confess", result: "It admits it has been ringing the king's lullaby on slow afternoons. We all sit quietly for a moment.", score: 165 },
          { label: "B. Tell it to wait", result: "The bellflower huffs and points at a shortcut to spite me.", score: 150, jump: 5 },
          { label: "C. Pretend not to hear", result: "The bellflower respects your manners and drops a charm.", score: 145 },
        ],
      },
    ],
  },
  {
    id: "thief",
    name: "Velvet-Step Thief",
    glyph: "T",
    fg: "#ffd27a",
    bg: "#3c2813",
    wander: 2.1,
    tempo: 1.1,
    role: "Confessor",
    bio: "A charming collector of keys, rumors, and shadows that looked unattended. Knows what was stolen and from whom.",
    sketch: [
      "  .--.  ",
      " ( .. ) ",
      " /|==|\\ ",
      "  |  |  ",
      "  '  '  ",
    ],
    intros: [
      "Your pack jingles like a shrine in a windstorm. Very spiritual. Very portable.",
      "The trail behind you is missing three footprints. I admire tidy work.",
      "Old tale: the Moon-Road bandit stole a king's name and hid it in a plum.",
      "You have the careful walk of someone who has been warned about cursed puddles.",
      "Even your shadow checked its pockets when I arrived. Smart shadow.",
    ],
    repeatIntros: [
      "Don't pat your pockets, it's rude. Mostly correct, but rude.",
      "You again. I returned the spoon. I am not returning the other thing.",
      "I knew you'd be back. Returns are part of the trade.",
    ],
    lateIntros: [
      "I stole one syllable from him on the way down. Don't ask which. I'm saving it for retirement.",
      "Some travelers come back to take their name back. The lock changes when you ask politely.",
    ],
    banter: [
      "I returned one of those today. Don't ask which.",
      "The locks here have feelings. They prefer guessing.",
      "Honesty is a kind of stealing if you do it loudly enough.",
      "I traded a bell for a name once. I still hear it under bridges.",
      "Don't trust shopkeepers. Not even me, technically.",
    ],
    lore: [
      "On the night the moon stayed up, somebody robbed the king of his crown. It wasn't me. I was busy.",
      "I once held a syllable of his name. It tasted like cold iron. I let it go because it kept laughing.",
      "The crown is in three pieces. One is in a bramble. One is under a bell. One pretends to be a spoon.",
    ],
    questions: [
      {
        prompt: "I have three things in my pocket. Pick which I dropped near you, and we'll see if it sticks.",
        choices: [
          { label: "A. A key", result: "It is, of course, a key. Of course it fits a door you have not seen yet.", score: 155, jump: 5 },
          { label: "B. A spoon", result: "The spoon admits it is the crown's middle. We both pretend to be surprised.", score: 170, jump: 6 },
          { label: "C. A name", result: "Lucky guess. The name was almost yours. Almost. I keep it.", score: 140 },
        ],
      },
      {
        prompt: "I owe a debt to a bellflower. Should I pay it tonight, or never?",
        choices: [
          { label: "A. Tonight", result: "I sigh, and pay. Honesty unlocks something behind a hedge. We never speak of this.", score: 165, jump: 4 },
          { label: "B. Never", result: "Honest of you. The bellflower retaliates with a sweet little curse on me.", score: 145 },
          { label: "C. Split it", result: "Compromise! I love compromise. The road forks helpfully.", score: 150, jump: 4 },
        ],
      },
      {
        prompt: "A guard with no head is asking for his coat back. I have it. What do you say to him?",
        choices: [
          { label: "A. 'It looks better on him'", result: "The headless guard agrees. He gallops off pleased. We share the proceeds.", score: 160 },
          { label: "B. 'He should ask his head'", result: "He has not seen his head in a century. You have just given him a quest. He thanks you.", score: 145, jump: 4 },
          { label: "C. Hand it to him yourself", result: "Bold. The coat fits you, briefly. He lets you keep one pocket.", score: 155, jump: 5 },
        ],
      },
    ],
  },
  {
    id: "monster",
    name: "Moon-Hungry Monster",
    glyph: "M",
    fg: "#ff7777",
    bg: "#3b1111",
    wander: 1.3,
    tempo: 0.72,
    role: "Rival",
    bio: "Mostly teeth, partly loneliness. Wanted the bargain the king got. Did not get it. Still bitter.",
    sketch: [
      "  .--.  ",
      " /OOOO\\ ",
      "|  vv  |",
      " \\____/ ",
      "  /||\\  ",
    ],
    intros: [
      "The stones went quiet when you approached. They know my dinner songs.",
      "You walk like someone who has not been chased by a hill. I can arrange tradition.",
      "Long ago, my grandmother swallowed a comet and hiccupped out this valley.",
      "Your knees are making brave noises. I prefer them with a little percussion.",
      "The moon is hiding behind a cloud and pointing at you. Subtle, moon.",
    ],
    repeatIntros: [
      "You taste better in my memory than you will in person. Probably.",
      "Back? Brave. I respect brave. I also chew it.",
      "Returning customers get the riddle discount.",
    ],
    lateIntros: [
      "I asked the moon for the bargain first. The moon said no. So I eat travelers. Equivalent exchange.",
      "If you find Ossian, tell him I'm still here. Tell him slowly.",
    ],
    banter: [
      "Manners are a small kind of biting.",
      "My grandmother is a hill now. She likes it.",
      "I do not eat scholars. They take notes on me from the inside.",
      "Pebbles are an acquired taste. I am working on it.",
      "Riddles are friendship that hurts.",
    ],
    lore: [
      "I asked the moon for the same bargain. The moon said: you have too many teeth. I have not forgiven this.",
      "The king walked past me on his way down. He smelled like a song nobody had finished writing.",
      "I keep one of his teeth in my chest pocket. It hums at night. So do I, in self-defense.",
    ],
    questions: [
      {
        prompt: "Answer my riddle or be answer-shaped: I am older than your name and younger than your fear. What am I?",
        choices: [
          { label: "A. The moon", result: "Correct. The moon waves. You are spared.", score: 165, jump: 6 },
          { label: "B. Your appetite", result: "Wrong, but flattering. I let you pass for the compliment.", score: 145 },
          { label: "C. A song", result: "Closer than you know. The king hummed it. I let you pass quietly.", score: 170, jump: 5 },
        ],
      },
      {
        prompt: "Trade with me. I want one of your memories. Pick one.",
        choices: [
          { label: "A. Your first step", result: "I take it carefully and trade you three teeth-marks worth of luck.", score: 150 },
          { label: "B. The name of a friend", result: "Generous. The friend doesn't notice. Probably.", score: 165, jump: 5 },
          { label: "C. This very moment", result: "Bold. We trade. You forget meeting me. I write it down for both of us.", score: 175 },
        ],
      },
      {
        prompt: "If the moon offered you the bargain right now, would you take it?",
        choices: [
          { label: "A. Yes, immediately", result: "Liar. The moon respects ambition. I let you go.", score: 155, jump: 4 },
          { label: "B. Only with conditions", result: "Wise. Conditions are how the moon eats you politely.", score: 160, jump: 5 },
          { label: "C. No, I'd rather walk", result: "Honest. I am bored by you in a friendly way. Go.", score: 140 },
        ],
      },
    ],
  },
  {
    id: "scholar",
    name: "Lantern Scholar",
    glyph: "S",
    fg: "#b8e0ff",
    bg: "#142f3d",
    wander: 1.1,
    tempo: 0.82,
    role: "Archivist",
    bio: "Keeper of star-indexes, vanished bridges, and footnotes the king tried to delete.",
    sketch: [
      "  ____  ",
      " /_[]_\\ ",
      " ( -- ) ",
      " /|[]|\\ ",
      "  /__\\  ",
    ],
    intros: [
      "Your compass is humming an old cradle-song. That song once opened the silver gate.",
      "I have read about your bootprints in a book that has not been written yet.",
      "The moss here grows in question marks. Excellent terrain for inquiry.",
      "The lantern flame tilted toward you, then pretended it was stretching.",
      "In the eighth tale of Elder Varn, a traveler with your exact elbows ruined a prophecy.",
    ],
    repeatIntros: [
      "Back already. I've prepared a footnote about you.",
      "Your file has grown. So have you, slightly. Stand straighter.",
      "The lantern remembers you. The lantern remembers everyone, but you it remembers fondly.",
    ],
    lateIntros: [
      "I have cross-referenced your face with seventeen royal portraits. The match is not flattering, and I will not say further.",
      "There is a margin note in chapter nine that begins 'when the traveler returns'. I have folded it. We are at the fold.",
    ],
    banter: [
      "I would shush the moon if I had standing.",
      "All bridges are footnotes to a longer river.",
      "Citations available on request. The request is harder than the citation.",
      "Books have feelings. The dictionary is particularly proud.",
      "If you find a footnote in a tree, that one is mine.",
    ],
    lore: [
      "The kingdom was called Vissarlin. Most people misspell it on purpose now. The word grows back wrong.",
      "Ossian Varlo signed his bargain in iron and lullaby. I have a rubbing of it. It will not photocopy.",
      "There are nine fragments of his true name. Folk hold them by accident, by oath, or by appetite.",
    ],
    questions: [
      {
        prompt: "Citation needed. The moon stopped setting on the eve of what holiday?",
        choices: [
          { label: "A. The Long Bell Festival", result: "Correct. The bells rang all night and never stopped properly. You hear one now if you listen low.", score: 165, jump: 5 },
          { label: "B. A Tuesday", result: "Technically right. The footnote prefers the festival. The lantern blinks approvingly anyway.", score: 145 },
          { label: "C. No one wrote it down", result: "Then who am I, exactly. The footnote sighs. The path forward sighs less.", score: 155, jump: 4 },
        ],
      },
      {
        prompt: "I have a page out of order. Should I put it back or leave it?",
        choices: [
          { label: "A. Put it back", result: "The book settles. So does the meadow.", score: 150 },
          { label: "B. Leave it", result: "The page knows what it is doing. The book respects autonomy. So does the road.", score: 165, jump: 5 },
          { label: "C. Burn the page", result: "Drastic. Effective. The footnote describing the page now describes you.", score: 175, jump: 4 },
        ],
      },
      {
        prompt: "Pick the word the king feared most.",
        choices: [
          { label: "A. 'Sunrise'", result: "Of course. The lantern brightens. The wind moves you forward gently.", score: 170, jump: 5 },
          { label: "B. 'Family'", result: "Plausible. The lantern is uncertain. It still helps you.", score: 145 },
          { label: "C. His own name", result: "Yes. Don't say it here. The footnote underlines you kindly.", score: 165, jump: 4 },
        ],
      },
    ],
  },
  {
    id: "shopkeeper",
    name: "Traveling Star-Keeper",
    glyph: "$",
    fg: "#a8ff9d",
    bg: "#153919",
    wander: 1.5,
    tempo: 0.95,
    role: "Merchant",
    bio: "Bearer of bottled dawn, pocket storms, honest maps, and one suspiciously patient apple.",
    sketch: [
      "  ____  ",
      " /*__*\\ ",
      " ( ^^ ) ",
      " /|==|\\ ",
      "  /__\\  ",
    ],
    intros: [
      "You have the look of someone who needs a moon in a jar and maybe a snack.",
      "This crossroads was once a dragon's pantry. I kept the shelves.",
      "The wind says you are carrying luck with a cracked handle. I have handles.",
      "A star fell into my satchel last night and has been complaining about your posture.",
      "The apple insists it met you in a dream. It also insists it was taller.",
    ],
    repeatIntros: [
      "Back for the apple, then. The apple knew you would be.",
      "The pocket storm has been asking about you. It is twelve. Be kind.",
      "Returning customer! I have not lowered the prices, but I will pretend.",
    ],
    lateIntros: [
      "I sell bargain-shaped things. Don't sign anything with the moon yet. Talk to me first.",
      "I knew the king. He used to buy honest maps from me. He never used them.",
    ],
    banter: [
      "The apple is patient because it is plotting.",
      "Discounts available for stories. Better discounts for true ones.",
      "If you see a bottled storm, do not shake it. Sing to it.",
      "I once sold a sunrise to a ghoul. He returned it. Said it didn't taste right at midnight.",
      "The maps are honest. The maps are also smug.",
    ],
    lore: [
      "Ossian bought a map from me once. It showed only the moon. He laughed, and paid double.",
      "On the night he went under, my pocket storm rang itself. It does that for the very large or the very lost.",
      "I keep his receipt in a drawer. It has not faded. It is the only paper I have like that.",
    ],
    questions: [
      {
        prompt: "Three jars on my cart, three prices, no labels. Which do you point at?",
        choices: [
          { label: "A. The bright one", result: "Bottled dawn. Hand-bottled, hand-warm. You pay in coin and a small embarrassment.", score: 145, jump: 4 },
          { label: "B. The quiet one", result: "Honest map. It folds itself toward your next worry.", score: 160, jump: 5 },
          { label: "C. The one trying not to be noticed", result: "A breath of the king's. Wholesale price. I throw in the bottle.", score: 175, jump: 5 },
        ],
      },
      {
        prompt: "The apple wants to be paid in a story. Tell it one.",
        choices: [
          { label: "A. About your boots", result: "The apple weeps with sympathy. So do the boots.", score: 140 },
          { label: "B. About someone you lost", result: "The apple goes still. So do the crows. You feel one ounce lighter.", score: 165 },
          { label: "C. About the king", result: "The apple stiffens, then offers you a bite. I look away. We do not speak of this.", score: 175, jump: 6 },
        ],
      },
      {
        prompt: "I have a receipt I have never been able to give back. Will you take it?",
        choices: [
          { label: "A. Take it", result: "It is signed in iron. It says: one bargain, paid in full. You don't ask whose.", score: 170 },
          { label: "B. Read it aloud", result: "Don't. I take it back. The apple wakes up.", score: 130 },
          { label: "C. Leave it", result: "Wise. I tuck it away. The map for free, in apology.", score: 155, jump: 5 },
        ],
      },
    ],
  },
  {
    id: "ghost",
    name: "Lantern Ghost",
    glyph: "G",
    fg: "#c9fff6",
    bg: "#12313a",
    wander: 2.8,
    tempo: 0.65,
    role: "Court servant",
    bio: "A translucent wanderer who served the king's table and still remembers what was almost said over soup.",
    sketch: [
      "  .--.  ",
      " ( oo ) ",
      " /|  |\\ ",
      "/_|__|_\\",
      "  w  w  ",
    ],
    intros: [
      "Your breath fogs in a shape I knew three centuries ago.",
      "The air behind you is colder than regret and warmer than prophecy.",
      "A legend says I waited here for a rider of starlight. You are shorter, but I am flexible.",
      "The nearby reeds are whispering your name backward. It suits you oddly well.",
      "I followed your lantern for a mile before noticing you were not carrying one.",
    ],
    repeatIntros: [
      "I knew you'd return. I always know. It's the one perk.",
      "Your warmth keeps. I have set aside a draft for you.",
      "You haunt me kindly. Thank you.",
    ],
    lateIntros: [
      "I served the king the night he went under. He ate slowly. He always did, on bad days.",
      "Do not ask me his name. I will say it correctly and then I will be too quiet for a year.",
    ],
    banter: [
      "I cannot reach the high shelves anymore.",
      "Mostly I am drafts and remembered laughter.",
      "Don't apologize to me. I'll cry, and then so will the air.",
      "The lanterns still know me. The hallways forgot first.",
      "Cold does not feel cold from the inside.",
    ],
    lore: [
      "He asked for nothing on his plate that night. We brought it anyway. It was the saddest plate.",
      "He kissed the moon goodnight through the kitchen window. The moon kissed back too long.",
      "I overheard one syllable of his true name as he stood up from the table. I have kept it. It is heavy.",
    ],
    questions: [
      {
        prompt: "I have been carrying a syllable for three hundred years. Will you take it for a while?",
        choices: [
          { label: "A. Yes", result: "It settles between your teeth like a cold pearl. You forget it is there until you don't.", score: 175, jump: 5 },
          { label: "B. No", result: "Thank you for the honesty. I tuck it back. It was getting cozy.", score: 140 },
          { label: "C. Only if I can give it back", result: "Fair. Most travelers return it. Some leave it in better hands.", score: 165, jump: 5 },
        ],
      },
      {
        prompt: "Tell me one thing you miss. I have an empty pocket exactly that size.",
        choices: [
          { label: "A. A meal", result: "The pocket fills with the warmth of it. The hallway brightens.", score: 150, jump: 4 },
          { label: "B. A person", result: "The pocket sighs and gives you back a draft of them.", score: 160 },
          { label: "C. A name", result: "Then we are alike. The pocket holds your hand for a moment.", score: 170, jump: 5 },
        ],
      },
      {
        prompt: "The lantern is asking me what time it is. What should I say to it?",
        choices: [
          { label: "A. 'Late'", result: "True. The lantern dims politely. The path brightens elsewhere.", score: 145 },
          { label: "B. 'Almost'", result: "Truer. The lantern beams. So does the road.", score: 165, jump: 5 },
          { label: "C. 'Never'", result: "Cruel. The lantern accepts. So does the road, sullenly.", score: 130 },
        ],
      },
    ],
  },
  {
    id: "ghoul",
    name: "Root-Cellar Ghoul",
    glyph: "H",
    fg: "#b9e27b",
    bg: "#26300f",
    wander: 1.6,
    tempo: 0.78,
    role: "Court cook",
    bio: "A damp old nibbling thing with moss in its pockets. Was the under-cook before the castles fell, and never got the recipe right.",
    sketch: [
      "  .__.  ",
      " (o,,o) ",
      " /|mm|\\ ",
      "  |__|  ",
      "  /  \\  ",
    ],
    intros: [
      "You crossed the mushrooms without asking their names. Rude, but promising.",
      "The dirt under you remembers a banquet where everyone arrived late and left transparent.",
      "I heard a tale in the roots: a traveler once answered bravely and was rewarded with soup.",
      "Your footsteps woke the turnips. They are pretending to sleep, badly.",
      "The cellar door under that leaf has been licking its hinges since you arrived.",
    ],
    repeatIntros: [
      "You. Back for the soup. There is no soup. There is only the idea of soup.",
      "The turnips have been preparing a small speech.",
      "Welcome again. Wipe your boots on the moss. It enjoys being responsible.",
    ],
    lateIntros: [
      "I cooked the king's last meal. He didn't eat it. I did. I have been salty about it ever since.",
      "If you find a syllable in a soup pot, it is one of his. Do not bite down.",
    ],
    banter: [
      "Recipes are spells with appetites.",
      "Don't trust the turnips. They have plans.",
      "I season everything with regret. It is plentiful.",
      "Mushrooms are courteous if you let them speak first.",
      "I have a cellar full of someone else's mornings.",
    ],
    lore: [
      "His favorite was a soup with no name. He insisted the moon was an ingredient. I never figured out which spoon.",
      "On the night he went under, the kitchen filled with bellflowers. They sang at me until I dropped the ladle.",
      "I have one of his syllables in a jar. It pickles slowly. It is almost ready.",
    ],
    questions: [
      {
        prompt: "Choose your taste. The pot is patient but the moss is not.",
        choices: [
          { label: "A. Bitter", result: "The pot agrees with you. The mushrooms wave you through politely.", score: 150 },
          { label: "B. Salt", result: "The pot weeps. The turnips applaud. You pass.", score: 160, jump: 5 },
          { label: "C. The taste of a thing nobody named", result: "The pot considers, then opens a cellar door for you. It approves.", score: 175, jump: 6 },
        ],
      },
      {
        prompt: "I have a jar I cannot open. Will you try, or shall we leave it?",
        choices: [
          { label: "A. Try to open it", result: "It opens. A syllable hops out, says 'oss-' and leaves. We let it.", score: 175, jump: 5 },
          { label: "B. Leave it", result: "Wise. The jar relaxes. The moss applauds your restraint.", score: 155 },
          { label: "C. Bury it deeper", result: "Kind. I owe you one mushroom of debt.", score: 145, jump: 3 },
        ],
      },
      {
        prompt: "Sing me one note. The cellar door is fussy.",
        choices: [
          { label: "A. A low one", result: "The hinges unbend. The cellar opens with a sigh.", score: 160, jump: 5 },
          { label: "B. A wobbly one", result: "Charming. The door considers you family.", score: 145 },
          { label: "C. The note the king sang", result: "The cellar gasps. So do I. We let you through quickly, before the moss tells.", score: 180, jump: 6 },
        ],
      },
    ],
  },
  {
    id: "skeleton",
    name: "Rattlebone Knight",
    glyph: "K",
    fg: "#fff0c8",
    bg: "#3c3020",
    wander: 1.2,
    tempo: 1.05,
    role: "Oathkeeper",
    bio: "A chivalrous heap of bones still sworn to protect a king who went under. He has not been relieved of duty.",
    sketch: [
      "  .--.  ",
      " (xx )  ",
      " /|##|\\ ",
      "  |##|  ",
      "  /  \\  ",
    ],
    intros: [
      "Your stance is brave, but your elbows lack heraldry.",
      "These hills were once a crown's sleeping guard. I remain on duty, technically.",
      "Long ago, I promised the queen I would challenge every wanderer. I did not ask how many wanderers there would be.",
      "Your bootlace drags like a defeated banner. I salute its service.",
      "The old battlefield just sneezed dust. It does that when destiny walks in.",
    ],
    repeatIntros: [
      "Stand! Approach! Oh. You. Stand at ease, then. At ease somewhat.",
      "I challenge all comers. I am also pleased to see you. Both things are true.",
      "The oath has not lapsed. Neither, I notice, have you.",
    ],
    lateIntros: [
      "If you are him, kneel. If you are not, kneel anyway. The oath is broad.",
      "I have been standing here since the night the moon stayed up. My armor has opinions about it.",
    ],
    banter: [
      "An oath is a kind of bone.",
      "I have not eaten in centuries. It is fine. Mostly.",
      "Heraldry must be earned. So must elbows.",
      "I rust on principle.",
      "Do not pity me. Pity the rust.",
    ],
    lore: [
      "I was at the door when he walked through it. He gave me his ring. I dropped it. I have not stopped looking.",
      "The queen's last order was: 'guard the door.' She did not say which door. I have guarded several.",
      "I once heard the king's true name in full. It rang in my ribcage for a year. I will not say it. I am sworn.",
    ],
    questions: [
      {
        prompt: "State your business with the kingdom. Briefly.",
        choices: [
          { label: "A. Passage", result: "Granted, with a salute. Honesty unlocks polite knights.", score: 145 },
          { label: "B. A name", result: "I cannot give that. I can point. The pointing is itself a kind of giving.", score: 165, jump: 5 },
          { label: "C. The king", result: "Long pause. The bones consider. The road clears for you sadly.", score: 175, jump: 6 },
        ],
      },
      {
        prompt: "Identify yourself by one of these signs: a ring, a song, or a scar.",
        choices: [
          { label: "A. A ring", result: "Show it. I cannot focus my sockets that well anymore. The road still opens.", score: 155 },
          { label: "B. A song", result: "Sing it. I salute on the third note. The path bows.", score: 170, jump: 5 },
          { label: "C. A scar", result: "Honest. Brave. I let you through with a small ceremonial nod.", score: 160, jump: 4 },
        ],
      },
      {
        prompt: "The oath says: challenge all wanderers. I do not want to. May I have your permission to lapse, briefly?",
        choices: [
          { label: "A. Yes, lapse", result: "Thank you. I sit. The road, embarrassed for me, helps you on.", score: 165, jump: 5 },
          { label: "B. No, do your duty", result: "Honorable. We exchange one polite blow each. I let you live. You let me feel useful.", score: 170 },
          { label: "C. Trade duties with me", result: "Tempting. Briefly the meadow has two knights. I let you go.", score: 155, jump: 4 },
        ],
      },
    ],
  },

  // ─── New characters ─────────────────────────────────────────────────────

  {
    id: "mermaid",
    name: "Tide-Tongue Mermaid",
    glyph: "~",
    fg: "#7fd8ff",
    bg: "#102a3d",
    wander: 1.4,
    tempo: 1.1,
    role: "Singer",
    bio: "She sang the king down. She may have meant to. She may not have. The tide has not forgiven either possibility.",
    sketch: [
      "  ___   ",
      " (o.o)  ",
      "  )|(   ",
      " /===\\  ",
      "  ~~~   ",
    ],
    intros: [
      "Step closer. The water is shallow and the rumors are not.",
      "Your reflection looks tired. Mine looks centuries.",
      "I heard your boots before I saw them. They squelch in tune.",
      "The river is currently rehearsing a complaint. You may sit in.",
      "If you have come for a song, name a key. If not, name a fear.",
    ],
    repeatIntros: [
      "The river kept track of you. We did the math together.",
      "Welcome back. The current saved you a polite eddy.",
      "Same boots. Different walk. I notice these things.",
    ],
    lateIntros: [
      "I sang him under. I admit it now. The tide is tired of pretending.",
      "If you find his name floating, return it to the river. The river is the only place it forgets to ache.",
    ],
    banter: [
      "Sit. The river prefers an audience.",
      "Fish remember insults forever. Choose words.",
      "I do not have feet. I have opinions about feet.",
      "Bridges are the rudest songs.",
      "The moon visits at low tide. Bring something to share.",
    ],
    lore: [
      "I sang every night by the king's window. He listened with his shoes off. He always took his shoes off.",
      "The night he went under, I sang the lullaby he asked for. I have not been able to stop since.",
      "His name is in the river. It washes downstream every spring and back upstream every autumn. I tried to grab it once. It bit me.",
    ],
    questions: [
      {
        prompt: "Pick a tide. I will sing accordingly. Some songs cost more than others.",
        choices: [
          { label: "A. Low and patient", result: "I sing him a lullaby. The path beside the river clears.", score: 150, jump: 5 },
          { label: "B. High and complaining", result: "I sing a quarrel. The river sulks, then ferries you across.", score: 160, jump: 6 },
          { label: "C. The tide on the night it happened", result: "I refuse, gently. But the river hears you ask, and is moved. You float forward.", score: 175, jump: 5 },
        ],
      },
      {
        prompt: "Tell me a word that floats. The river is judging us.",
        choices: [
          { label: "A. 'Maybe'", result: "It floats. The river approves.", score: 145 },
          { label: "B. 'Yes'", result: "Heavier than expected. It sinks, then comes up holding a charm.", score: 160 },
          { label: "C. 'Ossian'", result: "The river goes still. I let you through quickly. Don't look back.", score: 180, jump: 6 },
        ],
      },
      {
        prompt: "I lost a syllable downstream. Will you go look, or stay and ask better questions?",
        choices: [
          { label: "A. Look", result: "You find it tangled in reeds. It hums quietly the rest of the day.", score: 165, jump: 5 },
          { label: "B. Stay", result: "We sit. You ask a good one. The tide is grateful.", score: 155 },
          { label: "C. Ask the river directly", result: "Bold. The river answers in bubbles. You translate poorly but kindly.", score: 170, jump: 5 },
        ],
      },
    ],
  },
  {
    id: "hermit",
    name: "Bramble Hermit",
    glyph: "h",
    fg: "#c9d76b",
    bg: "#22301a",
    wander: 0.4,
    tempo: 0.5,
    role: "Eyewitness",
    bio: "Won't move from the spot he last saw the king on. Has been root-bound for centuries. Has opinions about birds.",
    sketch: [
      "  ,_,   ",
      " (o.o)  ",
      " /\"\"\"\\  ",
      "  | |   ",
      " //|\\\\  ",
    ],
    intros: [
      "Do not step on the moss. The moss has been there longer than you.",
      "I haven't moved since 1473. I have moved opinions.",
      "Sit. I have a story. I have one story.",
      "Your shadow keeps trying to leave. I sympathize.",
      "Mind the bramble. It is loyal but unkind.",
    ],
    repeatIntros: [
      "Back. The moss expected you. The moss is smug about it.",
      "You sat in the same spot. Considerate. Brambles appreciate consistency.",
      "I have not moved. Have you? Be honest.",
    ],
    lateIntros: [
      "He passed me on his way down. He nodded. The nod has not finished landing yet.",
      "If you find a king, ask him about his nod. He will know what I mean.",
    ],
    banter: [
      "Brambles are my friends. They are also my furniture.",
      "Birds visit. They bring news. I distrust the news.",
      "I have a bell, in case of bell-related emergencies.",
      "The wind is two seasons behind schedule.",
      "Don't bring me apples. The apple knows what it did.",
    ],
    lore: [
      "I was a young hermit when the king walked past. He had no entourage. He had a small bag and a tired face.",
      "He nodded at me. It was a kind nod. I have been trying to nod back ever since but my neck is leaves now.",
      "He whispered one syllable to the bramble as he passed. The bramble has kept it. It will not say which.",
    ],
    questions: [
      {
        prompt: "Identify the bird in that bush. There is a wrong answer.",
        choices: [
          { label: "A. A thrush", result: "Correct. The thrush nods like a king. I see why he passed by here.", score: 160, jump: 5 },
          { label: "B. A crow", result: "Wrong, gloriously. The crow takes offense and clears your path in revenge.", score: 165, jump: 6 },
          { label: "C. A bell", result: "Bells are not birds. They are nearly birds. The bramble accepts your nearly.", score: 145 },
        ],
      },
      {
        prompt: "Sit and tell me one true thing. Quickly. The moss is rationing patience.",
        choices: [
          { label: "A. 'I am lost'", result: "Honest. The bramble loosens. The path forward becomes a possibility.", score: 160, jump: 4 },
          { label: "B. 'I am looking for someone'", result: "Truer. The moss perks up. I point gently east.", score: 170, jump: 5 },
          { label: "C. 'I am the king'", result: "I do not laugh. I do not nod. The bramble considers you, and lets you pass.", score: 175, jump: 6 },
        ],
      },
      {
        prompt: "Should I move from this spot?",
        choices: [
          { label: "A. Yes, you should", result: "I will not. But I appreciate the prompt. The brambles applaud.", score: 145 },
          { label: "B. No, you shouldn't", result: "Correct. The moss agrees. The path forward agrees.", score: 165, jump: 5 },
          { label: "C. Only if you tell me why", result: "Fair. I tell you why. You walk on changed.", score: 175, jump: 5 },
        ],
      },
    ],
  },
  {
    id: "crow",
    name: "Two-Bellied Crow",
    glyph: "c",
    fg: "#cccccc",
    bg: "#1a1a1a",
    wander: 2.6,
    tempo: 1.45,
    role: "Gossip",
    bio: "Two heads on one bird. They argue. They contradict. One of them is usually right. The right one rotates.",
    sketch: [
      "  ww    ",
      " (oo)   ",
      " / Y \\  ",
      "  \\|/   ",
      "   `    ",
    ],
    intros: [
      "Caw. We saw you. (No we didn't.) Yes we did. (Be polite.) Be polite.",
      "You are walking in a direction. We have opinions about this.",
      "We have news. Two of them. They disagree.",
      "Worm? (No.) Sorry. We're not asking. (We were.)",
      "The right one of us has been right since Tuesday. (It is now Thursday.)",
    ],
    repeatIntros: [
      "Returning! (Annoying.) Returning. (Annoying.) We agree.",
      "You. (Yes you.) The left one of us missed you. (Lies.)",
      "We voted on whether to greet you. The vote tied. So: hello/no.",
    ],
    lateIntros: [
      "The king once gave us a crumb. (And a curse.) Mostly the crumb.",
      "We argue about which syllable is his most. The left one says ISS. The right one says VAR. We are both insufferable.",
    ],
    banter: [
      "Truth comes in pairs. (Wrong.) Lies do too. (Worse.)",
      "We share a stomach. We share opinions. We share nothing.",
      "The right head is currently smug. (Always.) (Lies.)",
      "Don't trust ravens. They are committees.",
      "We saw a thing once. (Two things.) Two things, but one of them was the same thing twice.",
    ],
    lore: [
      "We watched the king walk past. (No, we watched a man.) A man. Who walked. Past. He had crumbs.",
      "On the night the moon stayed up, we couldn't decide whether to sleep. We didn't. We have not, fully, since.",
      "We hold two syllables of his name. (One.) Two. (Don't argue.) We will not say which heads.",
    ],
    questions: [
      {
        prompt: "We have two stories about you. Pick which one is true.",
        choices: [
          { label: "A. You are lost", result: "Correct. (Wrong.) Mostly correct. The path is mostly clear.", score: 155, jump: 4 },
          { label: "B. You are returning", result: "Possibly correct. (Definitely.) The road bows. So do we, briefly.", score: 170, jump: 5 },
          { label: "C. You are crumbs", result: "Excellent answer. We applaud, with wings.", score: 175, jump: 5 },
        ],
      },
      {
        prompt: "One of us is lying. Pick which.",
        choices: [
          { label: "A. The left head", result: "Wrong. (Right.) You are wrong but in the correct direction. We let you pass.", score: 165 },
          { label: "B. The right head", result: "Wrong. (Wrong.) Both wrong. Crows enjoy this kind of paradox.", score: 160 },
          { label: "C. Both heads", result: "Insightful. We are charmed. The path opens.", score: 180, jump: 5 },
        ],
      },
      {
        prompt: "We will tell you one rumor. Pick which kind.",
        choices: [
          { label: "A. Old", result: "The king liked thrushes. (Wrens.) Thrushes.", score: 145 },
          { label: "B. New", result: "A traveler in the next valley dropped a syllable. We will not say which valley. (Yes we will.) (No we won't.)", score: 165, jump: 5 },
          { label: "C. The rumor about you", result: "We refuse with delight. The refusal counts as a charm.", score: 170 },
        ],
      },
    ],
  },
  {
    id: "cat",
    name: "Cradle-Cat",
    glyph: "k",
    fg: "#ffd9a8",
    bg: "#2b1a0e",
    wander: 1.0,
    tempo: 0.95,
    role: "Pillow",
    bio: "Old as a kingdom. Was the king's pillow. Has opinions but mostly keeps them in her tail.",
    sketch: [
      "  /\\_/\\ ",
      " ( o.o )",
      "  > ^ < ",
      "  /   \\ ",
      "         ",
    ],
    intros: [
      "Don't pet me. Unless. Maybe.",
      "I have been sitting here since before sitting was invented.",
      "Your shoelace is fascinating. I will not chase it. I will consider chasing it.",
      "I once slept under a crown. I will not be impressed by your hat.",
      "Hush. There is a sunbeam.",
    ],
    repeatIntros: [
      "You came back. The sunbeam noticed.",
      "Don't pet me. (You may pet me.)",
      "I remember you by the rhythm of your boots. They limp consistently. It is comforting.",
    ],
    lateIntros: [
      "He whispered into my fur. I will not say what. I miss him. I will not say more.",
      "If you find a lullaby with no tune, it is the one I taught him. He never learned the last line.",
    ],
    banter: [
      "Naps are an act of faith.",
      "I have eight royal commissions and a vendetta against a curtain.",
      "Hush. The sunbeam is napping.",
      "My tail keeps the better counsel.",
      "Don't bring me apples. (Bring me apples.)",
    ],
    lore: [
      "The king slept badly. I slept on his chest to fix it. It worked sometimes.",
      "On the night he went under, he laid me on the pillow and apologized. He has never come back for me.",
      "He whispered one syllable into my ear and asked me to keep it. I have. It purrs in my throat.",
    ],
    questions: [
      {
        prompt: "I have a thread. Choose what we do with it.",
        choices: [
          { label: "A. Chase it", result: "We chase. It leads us to a shortcut. The shortcut is brief and dignified.", score: 165, jump: 5 },
          { label: "B. Tug it", result: "We tug. A small bell rings far away. The road notices.", score: 155, jump: 4 },
          { label: "C. Let it be", result: "Wise. The thread sighs. So do I. So does the road.", score: 145 },
        ],
      },
      {
        prompt: "Tell me a lullaby. Any will do. I am picky and also dying for one.",
        choices: [
          { label: "A. About a moon", result: "Familiar. I purr. The path mews along.", score: 165 },
          { label: "B. About a meadow", result: "I purr softly. The meadow ahead unfolds politely.", score: 155, jump: 5 },
          { label: "C. About a king", result: "I go very still. Then I purr. The road clears in a hush.", score: 180, jump: 6 },
        ],
      },
      {
        prompt: "Would you like to know the syllable I carry, or would you rather not?",
        choices: [
          { label: "A. Tell me", result: "I purr it. You catch it in your hand. It is warm and weighs almost nothing.", score: 175, jump: 5 },
          { label: "B. Don't tell me", result: "I purr anyway. You feel oddly chosen.", score: 160 },
          { label: "C. Tell it to the sunbeam", result: "I do. The sunbeam blushes. The road glows briefly.", score: 170, jump: 5 },
        ],
      },
    ],
  },
  {
    id: "goose",
    name: "Spectacled Goose",
    glyph: "Q",
    fg: "#fff5b0",
    bg: "#2a2a14",
    wander: 1.5,
    tempo: 1.0,
    role: "Scribe",
    bio: "The king's appointed scribe. Has not received notice of dismissal. Wears spectacles. Honks officially.",
    sketch: [
      "  /=\\   ",
      " (o-o)  ",
      "  )*(   ",
      " /===\\  ",
      "  V V   ",
    ],
    intros: [
      "Halt. Sign in. The kingdom maintains records.",
      "Your name, please. Your alleged name. We accept allegations.",
      "Honk. I have been informed honking is acceptable greeting.",
      "Your boots are improperly registered. Proceed anyway.",
      "I am not lost. I am posted.",
    ],
    repeatIntros: [
      "Returning entry. Please re-sign. The kingdom requires consistency.",
      "Honk. You are filed under previous events.",
      "You may proceed past my honk with the appropriate paperwork. I will accept verbal paperwork.",
    ],
    lateIntros: [
      "The king has not collected his correspondence. It is piled here. I would not read it. But you may.",
      "If you find him, please ask him to file his absence. I have nowhere to put it.",
    ],
    banter: [
      "Bureaucracy is the longest spell.",
      "I have a stamp. I do not know what it stamps. It stamps anyway.",
      "Geese are widely misunderstood. We understand correctly.",
      "Forms are how the world keeps its promises.",
      "Honk. (That was on the record.)",
    ],
    lore: [
      "I was the king's scribe. I have all his signatures. None of them are the same. He was inconsistent.",
      "On the night the bargain was signed, I wrote in iron. The iron is still warm.",
      "I keep one syllable on a small card under my wing. It says ISS. It does not say where it goes.",
    ],
    questions: [
      {
        prompt: "Sign here. (Honk.) Choose your signature style.",
        choices: [
          { label: "A. Tidy", result: "Accepted. The road files you efficiently.", score: 145 },
          { label: "B. Dramatic", result: "Approved with theatre. The kingdom appreciates flourish.", score: 160, jump: 5 },
          { label: "C. With your true name", result: "I do not look. I file it. The road parts in deference.", score: 180, jump: 6 },
        ],
      },
      {
        prompt: "I have three forms. You must fill one. Choose.",
        choices: [
          { label: "A. Form ISS-1: Identity", result: "You fill it. I stamp it. You feel slightly more identified.", score: 160 },
          { label: "B. Form VAR-3: Travel intent", result: "You declare an intent. The road acknowledges it.", score: 165, jump: 4 },
          { label: "C. Form NUL-9: Refusal of service", result: "Bold. I accept your refusal with another form. The path opens out of bureaucratic exhaustion.", score: 170, jump: 5 },
        ],
      },
      {
        prompt: "An item is in my drawer addressed to no one. Will you accept it on behalf of the king?",
        choices: [
          { label: "A. Yes", result: "I hand it over. It is a small iron leaf. It hums.", score: 175, jump: 5 },
          { label: "B. No", result: "I keep it. I appreciate your respect for chain of custody.", score: 155 },
          { label: "C. Sign for the king yourself", result: "Conspiracy. I love it. The road becomes accidentally helpful.", score: 170, jump: 5 },
        ],
      },
    ],
  },
  {
    id: "toad",
    name: "Hedge-Sage Toad",
    glyph: "t",
    fg: "#8fd472",
    bg: "#1d2a14",
    wander: 0.6,
    tempo: 0.7,
    role: "Interim throne-sitter",
    bio: "Sat on the silver throne the night the king went under. Sat there for one minute. Has been retelling that minute for centuries.",
    sketch: [
      "  ,_,   ",
      " (o.o)  ",
      "  )W(   ",
      "  /-\\   ",
      "  \" \"   ",
    ],
    intros: [
      "Croak. You disturbed a very serious puddle.",
      "I rule this puddle. I rule it well. The puddle disagrees.",
      "Sit. I will require a small tribute. A pebble, a pun, or a polite nod.",
      "I once sat on a throne. I rate this puddle higher.",
      "The hedge is my council. Do not bow to the hedge. It encourages it.",
    ],
    repeatIntros: [
      "You. Returning citizen of my puddle. Sit.",
      "Croak. The puddle remembered your weight.",
      "The hedge has prepared a small monologue. Don't worry, I'll edit.",
    ],
    lateIntros: [
      "I sat on the silver throne. For one minute. I will not pretend it was a small minute.",
      "If you sit on a throne, do so briefly. The throne notices the long sits.",
    ],
    banter: [
      "Royalty is mostly posture.",
      "A puddle is a small throne with humility.",
      "Croak. (That was Latin.)",
      "Pebbles are excellent advisors. They keep their own counsel.",
      "Don't take advice from frogs. Take it from me.",
    ],
    lore: [
      "The night the king went under, the throne was empty for one minute. I sat. I felt it watching me.",
      "He left a syllable on the cushion. I sat on it. It is mine now. (It hums.)",
      "The crown does not fit me. I tried. I returned it to a bramble for safekeeping.",
    ],
    questions: [
      {
        prompt: "Pay tribute. Choose what to lay at the edge of my puddle.",
        choices: [
          { label: "A. A pebble", result: "Acceptable. The puddle bows. So does the road.", score: 145, jump: 3 },
          { label: "B. A compliment", result: "Generous. The hedge applauds. The road clears.", score: 160, jump: 4 },
          { label: "C. A confession", result: "Excellent! The puddle considers it carefully. The road respects you.", score: 170, jump: 5 },
        ],
      },
      {
        prompt: "Sit on my throne. Briefly. What does it feel like to you?",
        choices: [
          { label: "A. Wet", result: "Honest. The throne respects honesty. So do I.", score: 150 },
          { label: "B. Cold", result: "Truer than you know. The throne has not been warm in a long time.", score: 165, jump: 5 },
          { label: "C. Familiar", result: "I look at you for a long moment. Then I move aside. Sit longer if you wish.", score: 180, jump: 6 },
        ],
      },
      {
        prompt: "Should I leave the puddle and go look for the king?",
        choices: [
          { label: "A. Yes, go", result: "I will not. But I appreciate the offered courage. You inherit a little of it.", score: 155 },
          { label: "B. No, stay", result: "Correct. Someone has to stay. The puddle and I bow.", score: 165, jump: 5 },
          { label: "C. Send a messenger frog", result: "Brilliant. We dispatch one. He returns with crumbs. Useful crumbs.", score: 170, jump: 5 },
        ],
      },
    ],
  },
  {
    id: "mason",
    name: "Mason of the Slow Stair",
    glyph: "B",
    fg: "#cdb8a0",
    bg: "#2a241a",
    wander: 0.8,
    tempo: 0.6,
    role: "Builder",
    bio: "Cut and laid the stones that the castles sank along. Proud of the craft. Conflicted about the consequence.",
    sketch: [
      "  ___   ",
      " (---)  ",
      " /[#]\\  ",
      "  |#|   ",
      "  / \\   ",
    ],
    intros: [
      "Mind the stair. I cut it personally.",
      "I have been working since before you were a rumor. Stand aside.",
      "Stone remembers everything. It is exhausting.",
      "Test the step. Good. The stair likes you.",
      "I do not build for kings anymore. I build for the road.",
    ],
    repeatIntros: [
      "Same boots. Stand a little to the left. The stair is settling.",
      "Returning. I appreciate consistency. The stones do too.",
      "Welcome back. I have laid one new stone in your absence.",
    ],
    lateIntros: [
      "I built the stair the king sank along. I am not proud. I am also not unproud. It was good work.",
      "If you find a stair that breathes, it is mine. Step softly. Step honestly.",
    ],
    banter: [
      "A stair is a promise rendered in geometry.",
      "Don't sit on a step. Sit beside one. Respect the work.",
      "Mortar tastes terrible. I checked.",
      "I have a hammer named regret. It is very effective.",
      "The road and I disagree about my best work. The road is wrong.",
    ],
    lore: [
      "He commissioned the stair the night before he went under. He paid in iron. He always paid in iron.",
      "On the descent, the stair sighed. I have been listening for that sigh ever since. I hear it sometimes in your boots.",
      "I carved his initial into the last step. I will not say which letter. I have my pride.",
    ],
    questions: [
      {
        prompt: "Pick a stone. We'll see which one likes you.",
        choices: [
          { label: "A. The cornerstone", result: "It is proud and difficult. It approves of you. Good.", score: 165, jump: 5 },
          { label: "B. A loose one", result: "Honest pick. The stone confesses a shortcut. We use it.", score: 170, jump: 5 },
          { label: "C. The one that hums", result: "That is the last step of the king's stair. I would have stopped you, but you are right.", score: 175 },
        ],
      },
      {
        prompt: "Help me lay a stone. Which direction does it face?",
        choices: [
          { label: "A. Toward the moon", result: "Conventional. The stair accepts it. So does the road.", score: 155 },
          { label: "B. Toward the sun", result: "Brave. Wrong, but brave. The stair sighs fondly.", score: 145 },
          { label: "C. Toward whoever needs it", result: "Correct. The stair turns to face you. The road follows.", score: 175, jump: 5 },
        ],
      },
      {
        prompt: "Should the next stair go up or down?",
        choices: [
          { label: "A. Up", result: "Optimistic. We lay it up. The road grows.", score: 160, jump: 5 },
          { label: "B. Down", result: "Realistic. We lay it down. The road grows somewhere else.", score: 160, jump: 5 },
          { label: "C. Sideways", result: "Architecturally rude. I love it. The road becomes confused and helpful.", score: 175, jump: 6 },
        ],
      },
    ],
  },
];

// Fallback question pool — used only if a character lacks its own.
export const QUESTION_BANK = [
  {
    prompt: "A stone by your foot has begun counting your blinks. What do you do before it reaches thirteen?",
    choices: [
      { label: "A. Blink twice on purpose", result: "The stone loses count and pretends this was its plan.", score: 115 },
      { label: "B. Wink at the stone", result: "The stone blushes gravel and opens a little stair in the moss.", score: 165, jump: 6 },
      { label: "C. Close both eyes", result: "The dark shows you a shortcut with excellent manners.", score: 135, jump: 3 },
    ],
  },
  {
    prompt: "A bridge asks for one memory as toll. Its planks are already humming your childhood tune.",
    choices: [
      { label: "A. Give a lullaby", result: "The bridge hums it back with one missing note.", score: 115, jump: 4 },
      { label: "B. Give this question", result: "Elegant. The bridge forgets why it stopped you.", score: 175, jump: 7 },
      { label: "C. Give a sneeze", result: "The bridge accepts. Old magic has strange sums.", score: 130 },
    ],
  },
  {
    prompt: "A map has a blank spot labeled YOU ARE PROBABLY HERE, with an arrow pointing at your nose.",
    choices: [
      { label: "A. Trust it", result: "The map is flattered and becomes slightly accurate.", score: 115, jump: 4 },
      { label: "B. Draw a shortcut", result: "Reality sighs and allows the doodle.", score: 165, jump: 8 },
      { label: "C. Fold the nose away", result: "The world develops a crease just wide enough for you.", score: 135, jump: 3 },
    ],
  },
  {
    prompt: "The wind offers you a choice of three futures, all written on leaves that are already wilting.",
    choices: [
      { label: "A. Take the brightest leaf", result: "It crumbles into pollen. You feel briefly famous.", score: 140, jump: 4 },
      { label: "B. Take the quietest leaf", result: "It holds. The path ahead stops arguing with itself.", score: 165, jump: 5 },
      { label: "C. Let the wind keep them", result: "The wind respects your manners and stops pushing.", score: 150 },
    ],
  },
  {
    prompt: "Someone has left a crown in the mud. It is still warm. The mud is not.",
    choices: [
      { label: "A. Pick it up", result: "It fits for one heartbeat, then remembers it belongs elsewhere.", score: 155, jump: 4 },
      { label: "B. Bury it deeper", result: "The earth sighs in relief. A root points you onward.", score: 170, jump: 5 },
      { label: "C. Ask who lost it", result: "The hills do not answer. The crown answers by humming.", score: 145 },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────
// World landmarks, items, and quest — narrative for Index.jsx
// ──────────────────────────────────────────────────────────────────────────

export const ENTRANCE_TYPES = [
  {
    id: "dark-doorway",
    name: "Dark Doorway",
    char: "D",
    fg: "#dfc17d",
    bg: "#16100b",
    toast:
      "The stone frame inhales your torchlight. Beneath your boots, a stair exhales cold air that smells of iron and lullabies.",
  },
  {
    id: "moon-well",
    name: "Moon Well",
    char: "O",
    fg: "#9ee7ff",
    bg: "#111f2f",
    toast:
      "The water holds no sky — only rafters, crown moldings, and a throne room that should be impossible from here. You step through the reflection anyway.",
  },
  {
    id: "hollow-tree",
    name: "Hollow Tree",
    char: "Y",
    fg: "#b9e27b",
    bg: "#152414",
    toast:
      "The bark parts like an eyelid. Root-dark halls open beneath you, still humming the footfalls of whoever went down first.",
  },
  {
    id: "ruined-arch",
    name: "Ruined Arch",
    char: "A",
    fg: "#f0d28a",
    bg: "#30271c",
    toast:
      "The arch remembers being a gate. Mortar unknits. For one breath the kingdom's old name tries to climb back into your mouth.",
  },
  {
    id: "sinking-stair",
    name: "Sinking Stair",
    char: "<",
    fg: "#cdb8a0",
    bg: "#1a1610",
    toast:
      "Each step is newer below than above. The mason's chisel marks still glow. Someone paid in iron to have this built on the way down.",
  },
];

export const MAGICAL_ITEMS = [
  "moon key",
  "cracked bell",
  "sleepy apple",
  "bottle of dawn",
  "borrowed shadow",
  "silver breadcrumb",
  "tiny thunder",
  "moss crown",
  "lantern seed",
  "velvet map",
  "iron leaf",
  "half a lullaby",
  "pocket tide",
  "king's receipt",
  "syllable in wax",
];

export const MAGICAL_ITEM_BLURBS = {
  "moon key": "It fits no lock you have seen. It fits the moon's patience perfectly.",
  "cracked bell": "Rings once in your pocket. Somewhere underground, something answers.",
  "sleepy apple": "One bite and the grass around you yawns. Useful. Rude.",
  "bottle of dawn": "Warm glass. The label says OPEN AT NIGHT. You did not.",
  "borrowed shadow": "Lighter than yours. It keeps stepping where you meant to go.",
  "silver breadcrumb": "Birds argue over it without landing. The trail behind you looks intentional.",
  "tiny thunder": "A storm the size of a hazelnut. It purrs when held.",
  "moss crown": "Soft. Slightly guilty. Fits like you forgot you were royal.",
  "lantern seed": "Plant it in regret. It grows light that does not lie.",
  "velvet map": "Honest, smug, and always one valley behind the truth.",
  "iron leaf": "Still warm from whatever signature burned it.",
  "half a lullaby": "You know the tune. The last line was eaten by a cat.",
  "pocket tide": "Sloshes politely. Low tide when you are brave.",
  "king's receipt": "Paid in full. The ink has not faded in centuries.",
  "syllable in wax": "You almost hear a name when you hold it to your ear.",
};

export const LOST_WING = {
  id: "lost-fairy-wing",
  item: "fairy wing",
  x: 16,
  y: -7,
  char: "}",
  fg: "#f6a6ff",
  bg: "#2b1638",
};

export const GROUNDED_FAIRY = {
  id: "grounded-bellflower-fairy",
  name: "Grounded Bellflower Fairy",
  x: 42,
  y: 13,
  char: "f",
  fg: "#ffc7ff",
  bg: "#30183c",
};

export const LORE_INVOKE_THRESHOLD = 7;

export const QUEST_COPY = {
  startRumor:
    "A glitter of violet lies in the starting meadow — a fairy wing torn loose when something big went under the world.",
  wingFoundRumor:
    "East of the meadow, a bellflower fairy walks the grass without flying. She is missing half a story and all of one wing.",
  postFairyHint:
    "A doorway should answer the blessing within a short walk. Look for a glyph pulsing gold on the grass.",
  fairyHelpedRumor:
    "The bellflower blessing hums in your pocket. Old doors listen. Moon stairs remember your weight.",
  wingToast:
    "You lift a lost fairy wing from the grass. It still tries to beat once, politely, against your palm.",
  fairyToast:
    "The grounded fairy fastens the wing, loops once around your head, and leaves a bellflower blessing in your hair. Wild magic grows gentler when it sees you coming.",
  fairyHint:
    "The fairy stamps her foot at the turf. \"Wing first, hero second. The meadow is not subtle.\"",
  castleEnterHint: "Light three torches for the castle's blessing, or find a < moon stair to climb back into weather.",
  castleTorch: (remaining) =>
    remaining > 0
      ? `A castle torch wakes. ${remaining} still dream in the dark.`
      : "The third torch answers in blue fire. A hidden stair sighs open somewhere the stone forgot to be solid.",
  castleExit: "The moon stair exhales you into open air. The kingdom above smells like rain and unfinished names.",
  moonStairWaiting: "The moon stair is still remembering how to be a stair. Wait.",
  invokeNeedLore:
    "The stair listens, but not yet to you. Walk the wilds. Let seven tales settle in your journal, or light the castle torches first.",
  invokePrompt: "The moon stair is lit. The air wants a name spoken aloud.",
};

export const ENDING_COPY = {
  speak: `You speak the nine syllables into the stone. For a breath, nothing moves. Then the stair shivers and the dark becomes polite.`,
  moon:
    "The moon does not set. It leans closer, half-lidded, and answers in a voice like tide on glass: \"I held my bargain. He held his. You are not him — but you carried his name up the wrong way round. That counts.\"",
  kingdom:
    "The kingdom's name climbs back through the soil — not as a crown, but as weather. Grass remembers. Rivers correct their spelling. Somewhere above, a bell that had been holding its breath rings once.",
  stairChoice:
    "The stair offers two honest directions: back into weather, or deeper into the lullaby where the king still sleeps.",
  climb:
    "You climb. The moon does not follow. It waits, as it always has — half-open, patient, unfair.",
  stay:
    "You stay one more breath beneath the moon. The stone is warm. The kingdom hums your footsteps into its old ledger.",
  credits:
    "You finished what the meadow started. Ossian Varlo sleeps. The moon keeps its promise. The wilds remain — but they know your weight now.",
  memory:
    "The world will open again with your memory intact: tales heard, charms kept, best score honored.",
};

export const getQuestChecklist = (quest, castleGoal, loreCount) => {
  const torchCount = castleGoal?.litTorches?.size ?? 0;
  const torchesDone = Boolean(castleGoal?.complete || quest.returnedFromCastle);
  const canInvoke =
    quest.fairyHelped &&
    !quest.endingInvoked &&
    torchesDone &&
    (loreCount >= LORE_INVOKE_THRESHOLD || torchCount >= 3);

  const acts = [
    { id: "wing", label: "Find the violet fairy wing", done: quest.wingFound },
    {
      id: "fairy",
      label: "Return the wing to the bellflower fairy",
      done: quest.fairyHelped,
    },
    {
      id: "entrance",
      label: "Enter a glowing doorway underground",
      done: quest.castleEntered,
    },
    {
      id: "torches",
      label: "Light three castle torches",
      done: torchesDone,
      detail: quest.castleEntered ? `${Math.min(torchCount, 3)}/3 lit` : null,
    },
    {
      id: "invoke",
      label: "Speak Ossian Varlo on a lit Moon Stair",
      done: quest.endingInvoked,
    },
  ];

  const firstOpen = acts.find((act) => !act.done);
  return acts.map((act) => ({
    ...act,
    current: firstOpen?.id === act.id,
    detail: act.id === "invoke" && canInvoke && !act.done ? "ready on moon stair" : act.detail,
  }));
};

const directionTo = (targetX, targetY, worldX, worldY) => {
  const dx = targetX - worldX;
  const dy = targetY - worldY;
  const distance = Math.hypot(dx, dy);

  if (distance < 4) {
    return "close by";
  }

  const angle = Math.atan2(dy, dx);
  const octant = Math.round(angle / (Math.PI / 4));
  const labels = [
    "east",
    "southeast",
    "south",
    "southwest",
    "west",
    "northwest",
    "north",
    "northeast",
  ];

  return labels[(octant + 8) % 8];
};

export const getQuestDirection = (quest, worldX, worldY) => {
  if (!quest.wingFound) {
    return directionTo(LOST_WING.x, LOST_WING.y, worldX, worldY);
  }

  if (!quest.fairyHelped) {
    return directionTo(GROUNDED_FAIRY.x, GROUNDED_FAIRY.y, worldX, worldY);
  }

  if (!quest.castleEntered && quest.guideEntrance) {
    return directionTo(quest.guideEntrance.x, quest.guideEntrance.y, worldX, worldY);
  }

  return null;
};

// Generic rumor pool — biome hints, dungeon tips, and mystery breadcrumbs.
export const FLAVOR_RUMORS = [
  "A dark doorway west of a river leads to halls where the walls hum in their sleep.",
  "Skeleton knights bow only to travelers carrying something that glows.",
  "The Moon Well shows castle rooms that were never built above ground.",
  "A shopkeeper once hid a bottled sunrise behind the third mushroom ring.",
  "Ghosts in haunted vales remember exits before they remember names.",
  "Standing stones point toward arches when the grass is full of sparks.",
  "Castle kitchens are peaceful if you do not insult the soup.",
  "Every hollow tree has roots in at least one buried throne room.",
  "Tide-Tongue Mermaids sing the same lullaby on both shores. Someone asked them to.",
  "The Bramble Hermit has not moved since the king walked past. Ask about the nod.",
  "Two-Bellied Crows argue over which syllable of a royal name is loudest. Both are insufferable.",
  "A Spectacled Goose still files paperwork for a kingdom that sleeps under the soil.",
  "Cradle-Cats keep syllables warm in their throats. Petting is negotiable.",
  "The Mason of the Slow Stair carved the king's descent in stone that still sighs.",
  "Crystal glades grow where the moon's bargain leaked through the grass.",
  "Ember heaths remember the Long Bell Festival — the night the bells never quite stopped.",
  "Velvet-Step Thieves return what they steal if you tell them a true thing first.",
  "Lantern Scholars will not photocopy the king's signature. The ink refuses.",
  "Root-Cellar Ghouls pickle syllables. Do not bite down.",
  "Moon-Hungry Monsters were refused the same bargain the king got. They are still bitter.",
  "Mangrove roots knit doorways only visible when the tide is thinking.",
  "Salt flats remember every footprint until the wind files the paperwork.",
  "Petrified forests grew still the night someone said the word forever too loudly.",
  "Geyser basins keep time in steam — scholars set watches there and regret it.",
  "Canyon echoes arrive before the words that made them. Walk softly.",
  "Taiga needles fall in alphabets. Hermits collect the vowels.",
  "Bamboo groves argue in percussion. Thieves time their steps to the winning rhythm.",
];

export const getMysteryStage = (loreCount) => {
  let stage = MYSTERY_STAGES[0];
  for (const candidate of MYSTERY_STAGES) {
    if (loreCount >= candidate.threshold) {
      stage = candidate;
    }
  }
  return stage;
};

export const pickRumor = (roll, loreCount, questState) => {
  if (!questState.fairyHelped) {
    if (!questState.wingFound) {
      return QUEST_COPY.startRumor;
    }
    return QUEST_COPY.wingFoundRumor;
  }

  if (!questState.castleEntered && roll < 0.72) {
    return QUEST_COPY.postFairyHint;
  }

  if (!questState.endingInvoked && loreCount >= LORE_INVOKE_THRESHOLD && roll < 0.45) {
    return getMysteryStage(loreCount).rumor;
  }

  if (loreCount >= 2 && roll < 0.38) {
    return getMysteryStage(loreCount).rumor;
  }

  return FLAVOR_RUMORS[Math.floor(roll * FLAVOR_RUMORS.length) % FLAVOR_RUMORS.length];
};

export const buildEncounterDialogue = (type, hashAt, { seenCount = 0, loreMature = false } = {}) => {
  const pickFrom = (items, seed) =>
    items[Math.floor(hashAt(seed) * items.length) % items.length];
  let intro;

  if (seenCount > 0 && type.repeatIntros?.length) {
    intro = pickFrom(type.repeatIntros, 911);
  } else if (loreMature && type.lateIntros?.length) {
    intro = pickFrom(type.lateIntros, 911);
  } else {
    intro = pickFrom(type.intros, 911);
  }

  if (type.banter?.length && hashAt(914) > 0.52) {
    intro = `${intro} ${pickFrom(type.banter, 915)}`;
  }

  const questionPool = type.questions?.length ? type.questions : QUESTION_BANK;
  const question = pickFrom(questionPool, 910);

  return { intro, question };
};

export const pickUnheardLore = (type, heardKeys, hashAt) => {
  if (!type.lore?.length) {
    return null;
  }

  const unheard = type.lore
    .map((line, index) => ({ line, key: `${type.id}:${index}` }))
    .filter((entry) => !heardKeys.has(entry.key));

  if (!unheard.length) {
    return null;
  }

  return unheard[Math.floor(hashAt(913) * unheard.length) % unheard.length];
};
