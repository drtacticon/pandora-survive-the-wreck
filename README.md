# Pandora: Survive the Wreck

A turn-based browser adaptation of SPI's **The Wreck of the B.S.M. Pandora** (1980), featuring the original scanned map and counter artwork.

**Play:** https://drtacticon.github.io/pandora-survive-the-wreck/

## Play

Select one of the five named crew. Select a connected map space and choose Move, or use an action at the current location. Each surviving crew member gets **one action per turn**. After every crew member acts or waits, use **Resolve turn** to run specimen movement, combat, and shutdown. Activated bots each have one optional action per turn.

Restore Computer, Navigation, Control, Power, and Environment to green (6/9); restrain all ten specimens; seal two hull breaches; then restart FTL from Control pod A3. Searches replenish shared supplies. Stun specimens before capturing them. MedPod A5 treats crew; GSO repairs faster.

The ship uses the original 21 pods, nine tubes, and three connected risors. All seven bot types are present: Ambot, Erobot, EVAbot, Imrebot, Ubot, Reconbot, and Specibot. Activate them locally or from appropriate remote-control pods. Bots use their printed movement speeds and specialized abilities.

Keyboard: 1–5 select crew; S search; R repair; T stun; C capture; W wait. Progress autosaves locally. New Mission offers 30- and 20-tick clocks.

## Original materials

Original design: James F. Dunnigan. Original artwork and graphic design: Joe Barney and Redmond A. Simonsen. Original map and counter artwork © 1980 Simulations Publications, Inc.; respective rights holders retain their rights. No ownership or new license is claimed over these materials.

Scans: [Vassal module v1.1 / Al Hay Archive](https://vassalengine.org/wiki_old/wiki/Module:The_Wreck_of_the_B.S.M._Pandora). Rules: [SPI Wargame Resources](https://www.spigames.net/PDFv2/WreckoftheBSMPandora.pdf).

This is a streamlined, noncommercial fan adaptation, not an exact rules implementation. Fixed pod assignments, deterministic repairs, simplified specimen behavior, shared supplies, and the one-action-per-crew turn structure are adaptations. Exterior EVA, original attribute/reaction/repair tables, and berserk bots are not simulated. See the in-game sources page for details.

## Development

Static HTML/CSS/JavaScript with no build step. Serve the game directory using any static web server. `engine.js` contains testable game rules; `game.js` handles the interface. No external game libraries or server are required. Google Fonts are optional; system fallbacks work offline.

## Personnel, equipment, and discovery

Click a visible crew or bot chit for name, rank/position, specialty, live statistics, carried items and weapons, and controlled bots. Unsearched pods (including starting pods) are gray. Hull damage tints spaces light red. Contents of unsearched pods are absent from the map and bot roster; specimens still move and attack while hidden. Search or use a Scanner/Reconbot to discover pods. Loose equipment uses original chits and can be picked up or dropped for one action. Shared ship stores remain separate from carried equipment. Existing version-two missions migrate without losing progress.

Hull-damaged rooms must be repaired before they can be searched. Remote scans also skip damaged rooms.

New missions place the two hull breaches in pods A2 and C4. Existing saved missions retain their current breach locations and progress.
