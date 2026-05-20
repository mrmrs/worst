1. Disturbance Field
Prompt:
Build a minimalist browser game where the player controls a single bright pixel moving through a black pixel field. Every pixel the player passes through becomes “disturbed” and turns into a permanent hazard. The goal is to disturb as many pixels as possible without touching any previously disturbed pixel.
The player starts in the center of the screen. Movement is continuous, not grid-based, but the disturbed trail is pixel-accurate. The controls should feel slightly slippery, like a tiny spaceship with inertia. The player can turn, accelerate, and brake, but never stop completely. The tension comes from slowly boxing yourself in.
Add scoring based on the number of unique pixels disturbed. Add multipliers for tight turns, near-misses with your own trail, and long uninterrupted movement. As difficulty increases, introduce “memory distortion”: some disturbed pixels fade visually but remain deadly, forcing the player to remember their path.
Visually, keep it brutal and abstract: black background, white player pixel, red disturbed pixels, subtle glow only when near death. The game should feel like Snake, Super Hexagon, and a panic attack inside a bitmap editor.
2. Red Pixel Census
Prompt:
Create a browser game where each round shows a noisy canvas filled with thousands of randomly colored pixels. The player must estimate how many true red pixels are present while also playing a small reflex game.
The player controls a tiny cursor or avatar that must dodge incoming shapes while the noisy pixel field flickers, scrolls, warps, or rotates. The player has only a few seconds to survive and then enter their guess. The closer the guess, the more points they get. Wrong guesses damage the player or shrink the arena.
The trick is that some pixels are “almost red” but do not count. For example, pure red #ff0000 counts, but slightly orange, pink, or dark red does not. Later levels introduce decoys: red pixels that briefly turn red but do not stay red long enough to count, or red pixels hidden behind transparent noise.
Game modes could include:
Exact Count: guess the number.
Threshold Mode: answer whether there are more or fewer than a target number.
Survival Census: keep dodging while mentally counting.
Cruel Mode: the counting field is also the obstacle field.
The game should be visually overwhelming but mechanically simple: dodge, observe, guess, repeat.
3. One Frame Too Late
Prompt:
Make a reflex game where the player’s visible avatar is always slightly behind their actual input. The true hitbox is invisible or partially delayed, so the player must learn to act based on rhythm and prediction rather than sight.
The player navigates through narrow rotating gates, sudden slits, and collapsing corridors. The displayed avatar lags by 100–300 milliseconds, and the delay subtly changes over time. Early levels teach the player to distrust the visual position; later levels make the delay dynamic.
Controls are simple: left/right rotation, or WASD movement. Obstacles move in clean geometric patterns. The player’s true position can be hinted by tiny artifacts: a faint shadow, a sound cue, a distortion ring, or a one-frame flash.
Scoring rewards:
distance survived,
number of gates passed,
near misses,
successful movement during high-lag phases.
The emotional goal is to make the player think: “This is unfair,” then realize it is learnable, then become obsessed with mastering the timing.
4. Hex Taxonomy
Prompt:
Design a radial reflex game inspired by high-speed geometric tunnel games, but instead of simply dodging walls, the player must classify symbols while moving around a rotating polygonal arena.
The player orbits around the center of a hexagon, octagon, or decagon. Incoming walls collapse toward the center, leaving gaps. At the same time, a symbol appears in the middle: a glyph, number, color, creature, fake letter, or abstract icon. The player must move into the correct sector before the wall closes.
Each sector has a rule, such as:
“prime numbers only,”
“warm colors,”
“symbols with symmetry,”
“letters with enclosed spaces,”
“things that are alive,”
“things that are lying.”
The rules change rapidly, but in learnable sets. The player is not only reacting to gaps but also making tiny categorization decisions under pressure.
Make it fast, geometric, and harsh. Use rotating backgrounds, pounding rhythm, and crisp shapes. The best version should feel like a math quiz strapped to a bullet hell.
5. Negative Space Surgeon
Prompt:
Create a game where the player must carve safe negative space out of a dense field of moving particles. The player controls a scalpel cursor that removes pixels or cells from the screen. The objective is to reveal a hidden shape without cutting into forbidden areas.
The screen begins as a noisy mass of tiny colored cells. The player drags through it to cut paths, remove tissue, or isolate regions. Some colors are safe to cut, some are deadly, and some mutate after being cut. The hidden target might be a silhouette, word, maze exit, or anatomical-looking shape.
The challenge is that every cut creates consequences:
removed cells become drifting debris,
cut edges become unstable,
forbidden cells spread into empty space,
your previous cuts become walls,
the safe area shrinks over time.
Scoring rewards precision, minimal cuts, and speed. Add an “infection meter” that rises whenever the player cuts incorrectly. The game should feel like doing surgery on a corrupted computer screen while the screen is trying to heal itself incorrectly.
6. Cursor Must Not Understand
Prompt:
Build a browser game where the player guides a cursor through tiny abstract mazes, but every region of the maze changes the cursor’s control behavior.
The rules are simple at first: get from start to exit without touching walls. But different zones alter the mouse or keyboard behavior:
inverted movement,
delayed movement,
acceleration-only movement,
cursor snaps to grid,
cursor repels from walls,
cursor rotates around its own position,
horizontal and vertical controls swap,
movement is mirrored across the screen.
The twist is that the labels on the zones may be misleading, incomplete, or written in strange symbols the player learns through trial and error.
Each level should be short, maybe 10–20 seconds, but extremely dense. The player should fail often and instantly restart. Add a leaderboard for fastest completion with fewest wall touches.
Make the visual style look like a broken operating system: tiny windows, fake UI warnings, glitched cursors, hostile tooltips, and error messages that are sometimes useful.
7. The Floor Is Previously Clicked
Prompt:
Make a browser game using actual DOM elements instead of only canvas. The screen is filled with hundreds or thousands of tiny clickable tiles, buttons, checkboxes, links, and form elements. The player must click targets in a sequence, but every element they click becomes deadly terrain.
The objective is to reach a final button without touching or crossing over previously clicked elements. The mouse cursor has a visible trail, and any collision with “dead” UI elements ends the run. Levels become harder as the page scrolls, shifts, zooms, or rearranges itself.
Mechanics:
clicked buttons become red and dangerous,
some buttons flee from the cursor,
some expand after being clicked,
some create pop-up obstacles,
some must be double-clicked but become dangerous after the first click,
some labels lie about what they do.
Scoring is based on route efficiency, speed, and how many optional buttons the player dares to collect. The game should feel like a sadistic web form, a mouse precision test, and a memory maze.
8. Impossible Stopwatch
Prompt:
Create a timing game where the player must click at exact invisible moments. There is no normal stopwatch. Instead, timing is communicated through abstract patterns: pulsing circles, rotating bars, shifting colors, sound ticks, particle rhythms, or screen distortions.
Each round gives a target like:
click exactly on the 13th pulse,
click when three rotating lines align,
click halfway between two flashes,
click when the screen is visually calm,
click when the hidden beat would occur.
The game measures the player’s error in milliseconds. A perfect click gives a satisfying freeze-frame; a bad click creates mocking visual feedback.
As levels progress, the game introduces distractions:
fake pulses,
skipped beats,
uneven rhythms,
accelerating tempo,
delayed sound,
misleading visual sync.
The game should be almost meditative at first, then become brutally precise. The core appeal is chasing a perfect click.
9. Static Oracle
Prompt:
Make a game where the player must identify meaningful pixels hidden inside visual static while dodging threats. The screen is a noisy field of random black, white, red, and blue pixels. Somewhere inside the static is a tiny “oracle pixel” or symbol that appears for only a fraction of a second.
The player controls a reticle or small avatar. They must move toward the oracle and activate it, but touching false oracle pixels causes damage. Enemies are also camouflaged inside the static and only become visible when near the player.
Core mechanics:
scan the noise,
infer which pixels are meaningful,
move through a hostile field,
activate the correct signal before it disappears.
Add rounds where the oracle is not a pixel but a pattern: three red pixels in a diagonal, a blinking square, a hidden letter, or a cluster with a specific ratio of colors.
The game should feel like staring at television static until it starts staring back.
10. Reflex CAPTCHA From Hell
Prompt:
Build a game that looks like a CAPTCHA test, but it is secretly a high-speed reflex challenge. Each round asks the player to “select all squares containing…” something increasingly absurd, while the grid animates, rotates, or changes.
Examples:
select all squares containing circles that are pretending to be squares,
select all red objects except the honest ones,
click the only tile that moved before the sound,
avoid tiles that contain the word “avoid,” unless the word is upside down,
select the object that would be next in the sequence.
The player has only a few seconds per round. Wrong clicks create hazards that persist into later rounds. Correct clicks increase speed and complexity.
Make the game escalate from plausible CAPTCHA to surreal machine interrogation. It should feel like a website security check designed by an alien who hates humans.
11. Wound Around a Word
Prompt:
Create a typing-reflex hybrid where words are physical objects in the playfield. The player controls a small moving avatar, but typing letters changes the environment.
A word appears on screen, such as SPIRAL, FRACTURE, or ESCAPE. Each typed letter removes, rotates, or activates the matching letter in the arena. The player must type the word while simultaneously dodging the letters as they become moving hazards.
Example:
Typing S makes all S-shaped obstacles start spinning.
Typing P opens a gate but releases a projectile.
Typing the wrong letter adds an extra enemy letter.
Finishing the word clears the level.
The player cannot simply type quickly; they must time each keystroke based on what that letter will do. This creates a weird rhythm where spelling becomes level manipulation.
The aesthetic should be stark and typographic: giant letters, monospace fonts, black-and-white contrast, with occasional violent color flashes for mistakes.
12. Pixel Debt
Prompt:
Make a survival game where every action creates “pixel debt.” The player moves through a field collecting valuable pixels, but each pixel touched must eventually be repaid.
At first, the player can collect freely. But each collected pixel adds debt to a meter. When the meter fills, the game spawns consequences:
gravity increases,
controls become heavier,
old collected pixels return as enemies,
the screen zooms in,
safe zones shrink,
the player’s hitbox grows.
The player can repay debt by visiting dangerous repayment zones, sacrificing score, or staying still inside hostile patterns. This creates a risk-reward loop: collect too much and the game becomes unmanageable; repay too often and you lose potential score.
The design should be abstract and cruelly economical. Make it feel like a debt simulator disguised as an arcade game.
13. The Unfair Metronome
Prompt:
Build a rhythm-reflex game where the player survives by obeying a metronome that keeps changing its own rules. The player controls a dot in a circular arena. Obstacles appear on beats, and the player must move only at certain times.
At first, movement is safe on every beat. Then rules evolve:
move only on odd beats,
move only on prime-numbered beats,
move every third beat but not every ninth,
stop moving during silent beats,
reverse controls after accented beats,
jump sectors when the metronome skips.
The game should display the beat count but not always clearly. Sometimes the player must infer it through sound, color, or arena pulses.
Scoring rewards survival and “obedience streaks.” Moving at the wrong time causes instant death or spawns a persistent obstacle.
The result should feel like a rhythm game for people who enjoy being punished by number theory.
14. Live Inventory Tetris
Prompt:
Create a game where the player must arrange inventory items into a grid, but the items are alive and the grid is under attack.
The player drags weird shapes into an inventory panel. However:
items wiggle,
items rotate themselves,
some repel each other,
some decay if not placed quickly,
some bite the cursor,
some grow when touching certain colors,
some scream and shake the grid.
Meanwhile, hazards approach from outside the inventory. The player must pack items efficiently before the wave hits. A badly packed inventory creates weak points; a well-packed one becomes a shield.
The core loop:
Receive bizarre items.
Fit them into a limited grid.
Survive a short attack phase.
Keep the surviving inventory into the next round.
Make it feel like Tetris, an RPG inventory screen, and a tiny containment facility.
15. Color Command Contradiction
Prompt:
Build a high-speed Stroop-effect game with movement. The player controls a dot in an arena divided into colored zones. A command appears in the center, but the command can refer to either the color of the text, the word itself, the background color, or a previous command.
Examples:
The word “BLUE” appears in red text. The rule says “obey ink,” so move to red.
The word “GREEN” appears on a yellow background. The rule says “obey meaning,” so move to green.
The rule says “opposite of last safe color.”
The rule says “avoid the truthful color.”
The player has less than a second to choose a zone before the arena collapses. Wrong choices kill instantly or reduce the arena size.
Add difficulty by rotating the arena, swapping zone positions, hiding labels, or making colors pulse. The challenge is not just reaction speed but resisting the brain’s automatic interpretation.
16. Breathe or Die
Prompt:
Create a minimalist game where the player must synchronize movement with a breathing circle while dodging hazards. A large circle expands and contracts slowly. The player can only move safely during inhale, only attack during exhale, or only pass through certain barriers while holding the right rhythm.
Controls are simple: move with arrow keys and press/hold a key to “breathe.” If the player breathes out of sync, their vision narrows, controls degrade, or the arena becomes more hostile.
The game should start calm, almost like a meditation app, then gradually become stressful:
bullets enter during inhale,
safe zones appear during exhale,
enemies mimic the breathing rhythm,
panic events tempt the player to break rhythm,
the breathing circle occasionally lies.
The best version creates a strange contradiction: the player must stay calm to survive a game designed to make them tense.
17. Borderline
Prompt:
Make a browser game that takes place only on the border of the browser window. The player is a small dot traveling along the edges of the viewport. The interior of the screen is deadly void.
The player can move clockwise or counterclockwise along the border and can jump across corners. Obstacles also travel along the border, forcing quick reversals and corner timing. Collectibles appear on edges, sometimes requiring the player to resize, scroll, or change the layout of the page to reach them.
Advanced mechanics:
the border folds inward,
the window edge becomes a track,
corners become teleporters,
the browser UI itself is mimicked as fake hazards,
the safe border shrinks after each lap.
This should feel like a racetrack, a UI joke, and a claustrophobic arcade game. It works especially well as a tiny browser toy that uses the actual viewport dimensions as part of the level.
18. The Last Safe Pixel
Prompt:
Design a survival game where the entire screen is slowly becoming hostile, and the player can designate only one safe pixel at a time.
The player moves through a dense pixel grid. Every few seconds, the environment updates: safe pixels decay, danger spreads, and old paths close. The player has one ability: mark a single pixel or tiny region as temporarily safe. The challenge is to chain these safe markings while moving through increasingly impossible terrain.
Rules:
only one marked safe pixel can exist at once,
marking a new pixel removes the old one,
the player must physically reach marked pixels before they expire,
some pixels become safe only if surrounded by danger,
some danger pixels imitate safe pixels.
Scoring is based on distance crossed, number of successful safe-chain transitions, and how long the player survives after the arena becomes nearly impossible.
The game should feel like crossing a collapsing digital ocean one pixel at a time.
19. Mitosis Pong
Prompt:
Create a Pong-like reflex game where the ball splits every time it hits something. The player controls a paddle, but only one ball is “real.” The rest are decoys, parasites, or future hazards.
At the start, there is one ball. After each bounce, it divides into two. The player must keep the real ball alive while allowing false balls to escape, collide, or destroy each other. The real ball might be indicated by subtle clues: a slightly different trail, sound, spin, or shadow.
As the game escalates, the screen fills with balls. Some split aggressively, some merge, some copy the real ball’s appearance, and some punish the player for touching them.
The player must decide under pressure:
which ball to save,
which balls to ignore,
when to intentionally sacrifice space,
when to use limited “purge” abilities.
The result should feel like Pong undergoing biological failure.
20. Noise Chef
Prompt:
Build a game where the player cooks recipes out of falling pixels. The screen rains colored pixels, static chunks, and tiny ingredients. A recipe appears briefly, such as “7 red, 3 blue, 1 gold, no green.” The player controls a small bowl or collection zone and must catch exactly the right ingredients.
The challenge is that the visual field is noisy and deceptive:
fake ingredients look almost correct,
some colors change while falling,
some pixels are poisonous only after being caught,
recipes update mid-round,
the bowl leaks if overfilled,
the player must dump wrong ingredients while dodging hazards.
Scoring rewards exact recipes, speed, and streaks. A perfect dish clears the screen; a bad dish spawns enemies or distorts the controls.
Make the visual style ridiculous: part cooking show, part glitch art, part arcade reflex nightmare.
21. Parallax Lie Detector
Prompt:
Create a side-scrolling or top-down dodge game where only one visual layer is physically real, but many layers look convincing.
The screen contains several parallax layers: foreground shapes, background shadows, reflections, ghost obstacles, projected outlines, and fake collision objects. The player must determine which layer is currently solid based on subtle cues.
Every few seconds, the “real” layer changes. The player might infer it from:
the direction of shadows,
which layer reacts to sound,
which layer casts particles,
tiny labels in the background,
previous collision behavior.
The controls are simple, but perception is the challenge. The game becomes difficult because the player must ignore visually dominant fake threats and dodge barely visible real ones.
The ideal feeling: the player screams at the screen, dies, then realizes the clue was visible the whole time.
22. Tethered to Your Mistake
Prompt:
Make a reflex game where every input the player makes is recorded and replayed by a clone after a short delay. The player must survive while being haunted by their own previous movements.
The player navigates an arena collecting points and avoiding hazards. After five seconds, a ghost appears and repeats exactly what the player did. That ghost is dangerous to touch. After another five seconds, another ghost appears. Soon the arena is full of delayed versions of the player.
The player must plan movement patterns that leave room for future selves. Panic movements create chaotic ghosts that later trap the player. Clean movement creates predictable, manageable ghosts.
Add variations:
some ghosts are solid walls,
some shoot when the player previously pressed a key,
some collect points before the player can,
some must be used to press switches,
some replay mistakes at double speed.
The game should feel like playing against your own lack of discipline.
23. Minimum Viable Apocalypse
Prompt:
Create a tiny apocalypse simulator on a 16x16 or 32x32 grid. The player moves one cell at a time, but the world reacts in real time. Every cell the player steps on becomes corrupted, and corrupted cells spread according to simple rules.
The player’s goal is to survive as long as possible, collect resources, or reach a sequence of exits. But each move makes the world worse:
stepped-on cells become infection,
infection spreads to neighboring cells,
walls decay,
exits move,
resources mutate,
enemies spawn from overused paths.
The twist is that the game looks almost stupidly simple, like a toy grid, but becomes strategically and reflexively intense. Turns happen quickly, maybe every half-second, so the player must make decisions under pressure.
Score is based on turns survived, corruption contained, and optional objectives completed. The game should feel like a roguelike compressed into a tiny arcade panic box.
24. The Game Hates Straight Lines
Prompt:
Build a movement game where the player scores by moving continuously through an arena, but is punished for predictable motion. Straight lines, repeated curves, repeated speeds, and repeated angles create hazards.
The player controls a dot leaving a trail. The game analyzes movement patterns in real time. If the player moves too straight, a laser forms along that trajectory. If they repeat a curve, the old curve becomes a wall. If they maintain the same speed too long, enemies synchronize to it.
The goal is to survive while drawing chaotic but controlled paths. The game rewards:
varied angles,
rhythmic unpredictability,
tight dodges,
controlled acceleration changes,
staying close to danger without repeating movement.
It should create a strange skill: elegant evasive improvisation. The player is not just dodging obstacles; they are dodging the consequences of their own habits.
Visual style: abstract line art, trail-based hazards, geometric punishment.
25. Blackout Debugger
Prompt:
Make a memory-navigation game where the screen is usually black. The player moves through an invisible maze, but every movement briefly reveals only the nearby area or leaves a fading trail of what was seen.
The player’s task is to reach an exit, collect symbols, or repair broken nodes. The maze is full of invisible hazards. The player can trigger a “debug flash” to reveal the whole screen for a fraction of a second, but each flash makes the maze more dangerous.
Mechanics:
moving reveals a tiny radius,
walls are only visible after touching near them,
debug flashes show everything briefly,
enemies move mostly in darkness,
the player’s previous path fades slowly,
some revealed information becomes outdated.
The challenge is memory under pressure. The player must build a mental map while being chased or while the maze shifts.
Make the game feel like debugging a corrupted program from inside the program itself. The final levels should be nearly black, with the player surviving on rhythm, memory, and fear.
