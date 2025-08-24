# Implementation Steps for BitcoinHorizon

---
Legend:

- [ ] To do
- [x] Done
- [>] Now / Next / In Progress
- [/] Partially done
- [-] Dropped/cancelled
- [?] Question
- [!] Answer / fact / detail
- details
- ?? ".." quoted from [Product goal](PRODUCT_GOAL.md)

---
Enabler: tech stack

- [x] Playwright
- [x] Vite
- [x] hybrids.js
- [x] typescript
  - [x]update [Technology](TECHNOLOGY.md)
- [ ] add documentations of TECHNOLOGY to /TECHNOLOGY
  - [x] (hybrids.js stor)[TECHNOLOGY/hybrids.js/store]

# Feature: Bitcoin Price Display

- [>] "The player can at all times see their latest available BTC price in USD"
  - [>] Create a hybrids js store that fetches a price
    - [x] "BTC price data from any available 3rd party API"
    - [ ] mockFetch flag to not use API tokens during testing

# Feature: Score Management

- [ ] "New players start with a score of 0"
- [ ] "The player can at all times see their current score"
- [ ] "Players should be able to close their browser and return back to see their score"
- [ ] "The score of each player should be persisted in a backend data store (AWS services preferred)"

# Feature: Making Price Predictions

- [>] "The player can choose to enter a guess of either 'up' or 'down'"
- [ ] "Players can only make one guess at a time"
- [ ] "After a guess is entered, the player cannot make new guesses until the existing guess is resolved"
- [ ] Persist active guesses on the server to prevent client-side manipulation

# Feature: Prediction Resolution

- [ ] "The guess is resolved when the price changes and at least 60 seconds have passed since the guess was made"
- [ ] "If the guess is correct (up = price went higher, down = price went lower), the user gets 1 point added to their
  score"
- [ ] "If the guess is incorrect, the user loses 1 point"
- [ ] "The guesses should be resolved fairly using BTC price data from any available 3rd party API"

# Feature: Project Deliverables

- [ ] "Please provide us a link to your deployed solution"
  - [ ] AWS - static site
- [ ] "Please describe the app's functionality as well as how to run and deploy the application to the best of your
  ability in a README file"
- [ ] "Please provide the project in a public git repository"
- [ ] "Testing is encouraged"