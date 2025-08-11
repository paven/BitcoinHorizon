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

- [>] Implement guess resolution after 60 seconds or a price change
  - [?] Is the 60 seconds from when the fetch or from the guess?
    - [!] The 60 seconds is from when the guess is made, not from the fetch. (See PRODUCT_GOAL.md: "the guess is
      resolved when the price changes and at least 60 seconds have passed since the guess was made") - AI
  - [>] Implement timer functionality
    - [>] Add price comparison logic
      - [>] fetch new price after 60 seconds
      - [ ] Compare the current price with the price at the time of the guess
      - [ ] Determine if the guess was correct based on the price change
      - [ ] Show the result of the guess (correct or incorrect)]
      - [ ] Unlocl the guess submission button after resolution

  - [ ] Add price comparison logic
  - [ ] Create resolution display
  - [ ] Write tests for resolution logic

- [ ] Allow the user to submit a guess ("up" or "down")
  - [x] Create basic bitcoin-guess component structure
  - [x] Add "up" and "down" buttons
  - [x] Write test for component rendering
  - [/] Implement guess submission logic
    - [/] Define the state structure for the user's guess (e.g., "up" or "down", and whether a guess is currently
      active)
      - [X] State structure on componend
      - [ ] State structure on server
    - [/] Add logic to lock further guesses until the current guess is resolved
      - [x] Lock guess submission in the component
      - [x] Add visual feedback for locked state
      - [ ] Add lock as part of server state
    - [ ] Implement guess resolution after 60 seconds or a price change
  - [x] Add visual feedback for guess selection
    - [x] Add visual feedback for selected state
    - [x] Add visual feedback for not selected state
    - [x] Add visual feedback for none selected state

---

# later

- [ ] Players should be able to close their browser and return back to see their score and continue to make more guesses
  - [ ] Implement session storage
  - [ ] Add session recovery logic
  - [ ] Write tests for session persistence

- [ ] Display the current BTC/USD price using a 3rd party API
  - [x] Implement fetchBTCPrice function with API integration
  - [x] Add error handling for API calls
  - [x] Write tests for BTC price fetching
  - [ ] Create bitcoin-price component UI
  - [ ] Add price auto-refresh functionality

- [ ] Implement user authentication and session persistence
  - [ ] Create authentication UI in auth-section
  - [ ] Implement authentication flow
  - [ ] Add session management
  - [ ] Write tests for auth flow

- [ ] Show the user's current score
  - [ ] Create score display component
  - [ ] Implement score tracking logic
  - [ ] Add tests for score management

- [ ] Lock further guesses until the current guess is resolved
  - [ ] Add state management for guess status
  - [ ] Implement button disable logic
  - [ ] Add visual indicators for locked state

- [ ] Resolve the guess after 60 seconds and a price change
  - [ ] Implement timer functionality
  - [ ] Add price comparison logic
  - [ ] Create resolution display
  - [ ] Write tests for resolution logic

- [ ] Update the user's score based on the guess outcome
  - [ ] Implement scoring rules
  - [ ] Add score update logic
  - [ ] Write tests for score calculations

- [ ] Persist user scores in a backend data store (preferably AWS)
  - [ ] Set up AWS infrastructure
  - [ ] Implement data storage logic
  - [ ] Add data retrieval functions
  - [ ] Write tests for data persistence

- [x] Review tests for core features and logic
  - [x] Setup Playwright test environment
  - [x] Write tests for BTC price fetching
  - [x] Test component rendering
  - [ ] Add integration tests
  - [ ] Add end-to-end tests

- [ ] Add a favicon to the app for better branding and browser tab visibility
  - [ ] Create favicon asset
  - [ ] Add favicon links to HTML

- [ ] Prepare deployment and add instructions to the README
  - [ ] Write deployment documentation
  - [ ] Add setup instructions
  - [ ] Document testing procedures
  - [ ] Include usage guidelines

- [x] Set up project structure and initialize repository
  - [x] Basic HTML structure with sections for components
  - [x] Project dependencies setup (@playwright/test, start-server-and-test, vite)
  - [x] Basic component structure (bitcoin-guess, bitcoin-price)
