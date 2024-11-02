# ReactJack.ts
It's browser-based blackjack... With React, _Jack_.

## Live Demo!
To play, just [click here](https://www.daveyknific.com/react-jack/index.html)!

## Dependencies:
 - React.js
 - TypeScript
 - Vite (for build, rollup, and dev server)

## To Run Locally:
Clone this Git repository, navigate to its root directory, and run:

    npm install
    npx vite

## How Do You Calculate a Player's Current Score in Blackjack?
1) Set aside _all_ `Ace` cards; Do not count them:
	- The value of each Ace card will be calculated _last_ because they have their own logical system that depends on the final total of `non-Ace` cards
2) Add up the score of every card that is **NOT an Ace card**:
	- **K**ings, **Q**ueens, and **J**acks _ALL_ have a value of `10`
	- _ex:_ A hand that contains `[9, Q, 3]` will equal `22`
3) Once you have determined the **final sum** of all _non-Ace_ cards, iterate through each Ace card in the player's hand and use the following logic:
	- Does adding `11` to the player's total make the player's score `greater than 21`? If not, add `11` to the total. If _yes_, add only `1` to their total score

## CSS Card Animation Tactic:
In `src/util/gameMethods.ts`, you'll find two methods called `evaluateCssClassFor___Card()`.

Every time a card is dealt to a player, we run this function for each card and apply the class to each card so that we can assign a specific CSS animation to it.