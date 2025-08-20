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

---

# Now

- [>] Players should be able to close their browser and return to see their score and any active guess
  - [x] Persist score across browser sessions
    - [x] Add tests for score session persistence
    - [x] Implement session storage for score
  - [x] Ensure guess buttons are only enabled when a price is available
    - [x] Save latest fetched price in a store
    - [x] Keep buttons disabled if price fetch fails
  - [>] Allows a player to close their browser and return to an in-progress guess.
    - [>] When a guess is made, the guess details (guess, initialPrice, timestamp) are sent with the event.
      - [x] When a guess is made, the guess details (guess, initialPrice) are sent with the event.
      - [x] When a guess is made, the guess details (.., timestamp) are sent with the event.
    - [x] When a guess is made, the guess details (guess, initialPrice, timestamp) are saved to `localStorage`.
    - [>] When the page loads, if a guess exists in `localStorage`, the `bitcoin-guess` component initializes with that
      guess state.
    - [ ] When the page loads, if a guess exists in `localStorage`, the `bitcoin-compare` component initializes with the
      initial price from that guess.
    - [ ] When the page loads, if a guess in `localStorage` is still within its 60-second waiting period, the timer
      continues from where it left off.
    - [ ] When a guess is resolved (e.g., after a price refresh), the guess is cleared from `localStorage`.

# later
- [ ] Persist user scores in a backend data store (preferably AWS)
  - [ ] Set up AWS infrastructure
  - [ ] Implement data storage logic
  - [ ] Add data retrieval functions
  - [ ] Write tests for data persistence

- [ ] When recovering guesses, and time has passed, use historic BTC prices
- [ ] Support more currencies.
- [ ] Show count down counter.
- [ ] Refactor: Separate business logic from UI components (move towards Hexagonal Architecture).
  - [ ] Extract application controller logic from `index.html` into a dedicated module.
  - [ ] Merge bitcoin-price and bitcoin guess.

- [ ] Implement user authentication and session persistence
  - [ ] Create authentication UI in auth-section
  - [ ] Implement authentication flow
  - [ ] Add session management
  - [ ] Write tests for auth flow


- [ ] Add a favicon to the app for better branding and browser tab visibility
  - [ ] Create favicon asset
  - [ ] Add favicon links to HTML

# Done

- [x] Set up project structure and initialize repository
- [x] Display the current BTC/USD price using a 3rd party API
- [x] Allow the user to submit a guess ("up" or "down")
- [x] Implement guess resolution after 60 seconds or a price change
- [x] Show the user's current score

---

# Product related questions

- [?] Opertunity Identification: What specific opertunity are we trying to adress?
- [?] What are the underlying needs of this opertunity, not just the symptoms?
- [?] Customer Identification: Who wants this opertunity adress?
- [?] What is the cost for our customer if this problem is not solved?
- [?] What is the gain for our customer if this opertunity is adressed?
- [?] Customer What are the core needs and pain points of our target customer?
- [?] Market? Who else is targeting this opertunity?
- [?] How are they targeting the opertunity?
- [?] What are the strengths and weaknesses of their approach?
- [?] What gain are we looking for?
- [?] How mush are we willing to invest?
- [?] What are the potential risks and dependencies of this investment?
- [?] Market Opportunity: What is the size of this market, and what is our potential share?
- [?] How will our offering fit into the existing market ecosystem?
- [?] Value Proposition: What unique value do we offer that competitors don't?
- [?] Success Metrics: How will we measure success for this product or feature?
- [?] What does success look like from the customer's perspective?
- [?] Is the proposed solution the best way of solving our bussniss case?
- [?] How does this proposed solution align with our long-term strategic goals?
- [?] What is the desired minimum viable product (MVP) for this game, and what features could be considered for future
  iterations?
- [?] What is the long-term vision for this product?
- [?] What are the potential monetization strategies for this game, if any?
  -[?] What are the key performance indicators (KPIs) we will use to measure the health and success of the product?

# User experience related questions

- [?] Who are our target users?
- [?] What are the underlying motivations and goals of our users when they interact with our product?
- [?] What are the core needs and pain of our target users?
- [?] What is the user's current way of addressing this opertunity?
- [?] In what environment or context will the user be using this product?
- [?] How frequently will they use this product?
- [?] How would the user expect this to work? (patterns in existing products, other patterns that we should follow)
- [?] Is this actually solving the user need?
- [?] How can we create a fair and transparent system for resolving guesses to build user trust?
- [?] What does an ideal user journey look like from a player's first guess to a high score?
- [?] What is the desired visual and tonal aesthetic for the application?
- [?] What is the best/desired visual and tonal aesthetic for the application?
- [?] How will we provide feedback to the user, both for correct and incorrect guesses, to keep them engaged?
- [?] What is the desired experience for a returning player?