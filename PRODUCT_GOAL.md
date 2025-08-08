


The goal is to understand how you build modern products, solve problems, and explain your code during a project walkthrough. The time and effort you spend on it are up to you, but there’s no need to invest more than about half a day’s work.

Here’s the assignment:

Build a web app that allows users to make guesses on whether the market price of Bitcoin (BTC/USD) will be higher or lower after one minute.

Rules:

    The player can at all times see their current score and the latest available BTC price in USD
    The player can choose to enter a guess of either “up” or “down“
    After a guess is entered, the player cannot make new guesses until the existing guess is resolved
    The guess is resolved when the price changes and at least 60 seconds have passed since the guess was made
    If the guess is correct (up = price went higher, down = price went lower), the user gets 1 point added to their score. If the guess is incorrect, the user loses 1 point.
    Players can only make one guess at a time
    New players start with a score of 0
    Players should be able to close their browser and return back to see their score and continue to make more guesses

Solution requirements:

    The guesses should be resolved fairly using BTC price data from any available 3rd party API
    The score of each player should be persisted in a backend data store (AWS services preferred)
    Please provide us a link to your deployed solution.

Testing is encouraged.

Please describe the app's functionality as well as how to run and deploy the application to the best of your ability in a README file.

Please provide the project in a public git repository.

Let me know when you would send it back to me so I can inform my colleagues. Once I will receive your coding assignment, I’ll forward it to them, and if they’re happy with it and give me the green light, I’ll invite you for the project walkthrough.

If you have any questions, feel free to reach out by replying to this email. I am here to help :)

Best regards,
Aiko
