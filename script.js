document.addEventListener("DOMContentLoaded", () => {
    // Game state
    const state = {
      stats: { wins: 0, draws: 0, loses: 0 },
      gameHistory: [],
      currentRound: 1,
      playerChoice: null,
      computerChoice: null,
      result: null,
      countdown: null,
      gameMode: "classic", // classic, best-of-5, time-attack, sudden-death, mirror
      difficulty: "medium", // easy, medium, hard
      playerStreak: 0,
      bestStreak: 0,
      specialMoveCount: 0,
      timeLeft: 30,
      timerInterval: null,
      isTimerRunning: false,
      playerPattern: [],
      winsWith: { rock: false, paper: false, scissors: false },
      achievements: {
        firstWin: false,
        streak3: false,
        win10: false,
        allChoices: false,
        hardWin: false,
        specialMove: false,
        perfectGame: false,
        comeback: false,
        gamesPlayed: false,
        allModes: false,
      },
      modesPlayed: {
        classic: false,
        bestOf5: false,
        timeAttack: false,
        suddenDeath: false,
        mirror: false,
      },
      lastComputerChoice: null,
      totalGamesPlayed: 0,
      isDarkTheme: false,
      wasLosingByThree: false,
    }
  
    // DOM elements
    const elements = {
      options: document.querySelectorAll(".option"),
      playerScore: document.getElementById("player-score"),
      computerScore: document.getElementById("computer-score"),
      drawAnimation: document.getElementById("draw-animation"),
      countdownDisplay: document.getElementById("countdown-display"),
      countdownText: document.querySelector(".countdown"),
      resultDisplay: document.getElementById("result-display"),
      resultText: document.querySelector(".result-text"),
      historyBody: document.getElementById("history-body"),
      noHistory: document.getElementById("no-history"),
      totalGames: document.getElementById("total-games"),
      winRate: document.getElementById("win-rate"),
      currentRoundDisplay: document.getElementById("current-round"),
      bestStreakDisplay: document.getElementById("best-streak"),
      rockStats: document.getElementById("rock-stats"),
      paperStats: document.getElementById("paper-stats"),
      scissorsStats: document.getElementById("scissors-stats"),
      rockProgress: document.getElementById("rock-progress"),
      paperProgress: document.getElementById("paper-progress"),
      scissorsProgress: document.getElementById("scissors-progress"),
      noStats: document.getElementById("no-stats"),
      statsDistribution: document.getElementById("stats-distribution"),
      toast: document.getElementById("toast"),
      resetGame: document.getElementById("reset-game"),
      showRules: document.getElementById("show-rules"),
      rulesModal: document.getElementById("rules-modal"),
      closeModal: document.querySelector(".close-modal"),
      tabButtons: document.querySelectorAll(".tab-button"),
      tabPanels: document.querySelectorAll(".tab-panel"),
      currentYear: document.getElementById("current-year"),
      themeToggle: document.getElementById("theme-toggle"),
      modeButtons: document.querySelectorAll(".mode-btn"),
      difficultyButtons: document.querySelectorAll(".difficulty-btn"),
      timeAttackContainer: document.getElementById("time-attack-container"),
      timerProgress: document.querySelector(".timer-progress"),
      timerText: document.querySelector(".timer-text"),
      startTimer: document.getElementById("start-timer"),
      roundDisplay: document.getElementById("round-display"),
      bestOfProgress: document.getElementById("best-of-progress"),
      playerProgress: document.querySelector(".player-progress"),
      computerProgress: document.querySelector(".computer-progress"),
      specialMoveBtn: document.getElementById("special-move"),
      specialMoveCounter: document.querySelector(".special-move-counter"),
      playerChoice: document.getElementById("player-choice"),
      computerChoice: document.getElementById("computer-choice"),
      gameOverModal: document.getElementById("game-over-modal"),
      gameResult: document.getElementById("game-result"),
      finalPlayerScore: document.getElementById("final-player-score"),
      finalComputerScore: document.getElementById("final-computer-score"),
      playAgain: document.getElementById("play-again"),
      achievements: {
        firstWin: document.getElementById("achievement-first-win"),
        streak3: document.getElementById("achievement-streak-3"),
        win10: document.getElementById("achievement-win-10"),
        allChoices: document.getElementById("achievement-all-choices"),
        hardWin: document.getElementById("achievement-hard-win"),
        specialMove: document.getElementById("achievement-special-move"),
        perfectGame: document.getElementById("achievement-perfect-game"),
        comeback: document.getElementById("achievement-comeback"),
        gamesPlayed: document.getElementById("achievement-games-played"),
        allModes: document.getElementById("achievement-all-modes"),
      },
      achievementsCount: document.getElementById("achievements-count"),
      achievementProgress: {
        firstWin: document.getElementById("first-win-progress"),
        streak: document.getElementById("streak-progress"),
        win10: document.getElementById("win-10-progress"),
        allChoices: document.getElementById("all-choices-progress"),
        hardWin: document.getElementById("hard-win-progress"),
        specialMove: document.getElementById("special-move-progress"),
        perfectGame: document.getElementById("perfect-game-progress"),
        comeback: document.getElementById("comeback-progress"),
        gamesPlayed: document.getElementById("games-played-progress"),
        allModes: document.getElementById("all-modes-progress"),
      },
    }
  
    // Game options
    const options = ["rock", "paper", "scissors"]
    const optionEmojis = {
      rock: "👊",
      paper: "✋",
      scissors: "✌️",
    }
  
    // Initialize the game
    function init() {
      // Load saved data from localStorage if available
      loadGameData()
  
      // Add event listeners
      elements.options.forEach((option) => {
        option.addEventListener("click", () => handleChoice(option.dataset.option))
      })
  
      elements.resetGame.addEventListener("click", resetGame)
      elements.showRules.addEventListener("click", showRules)
      elements.closeModal.addEventListener("click", closeModal)
      elements.rulesModal.addEventListener("click", (e) => {
        if (e.target === elements.rulesModal) closeModal()
      })
      elements.gameOverModal.addEventListener("click", (e) => {
        if (e.target === elements.gameOverModal) closeModal()
      })
  
      elements.tabButtons.forEach((button) => {
        button.addEventListener("click", () => switchTab(button.dataset.tab))
      })
  
      elements.themeToggle.addEventListener("click", toggleTheme)
  
      elements.modeButtons.forEach((button) => {
        button.addEventListener("click", () => changeGameMode(button.dataset.mode))
      })
  
      elements.difficultyButtons.forEach((button) => {
        button.addEventListener("click", () => changeDifficulty(button.dataset.difficulty))
      })
  
      elements.startTimer.addEventListener("click", startTimeAttack)
  
      elements.specialMoveBtn.addEventListener("click", useSpecialMove)
  
      elements.playAgain.addEventListener("click", () => {
        closeModal()
        resetGame()
      })
  
      // Check for saved theme preference
      if (localStorage.getItem("darkTheme") === "true") {
        state.isDarkTheme = true
        document.body.classList.add("dark-theme")
        elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>'
      }
  
      // Update UI
      updateScoreboard()
      updateSpecialMoveButton()
      updateAchievements()
      updateAchievementProgress()
    }
  
    // Save game data to localStorage
    function saveGameData() {
      const gameData = {
        stats: state.stats,
        bestStreak: state.bestStreak,
        achievements: state.achievements,
        winsWith: state.winsWith,
        modesPlayed: state.modesPlayed,
        totalGamesPlayed: state.totalGamesPlayed,
      }
      localStorage.setItem("rpsGameData", JSON.stringify(gameData))
    }
  
    // Load game data from localStorage
    function loadGameData() {
      const savedData = localStorage.getItem("rpsGameData")
      if (savedData) {
        const gameData = JSON.parse(savedData)
        state.stats = gameData.stats || { wins: 0, draws: 0, loses: 0 }
        state.bestStreak = gameData.bestStreak || 0
        state.achievements = gameData.achievements || {
          firstWin: false,
          streak3: false,
          win10: false,
          allChoices: false,
          hardWin: false,
          specialMove: false,
          perfectGame: false,
          comeback: false,
          gamesPlayed: false,
          allModes: false,
        }
        state.winsWith = gameData.winsWith || { rock: false, paper: false, scissors: false }
        state.modesPlayed = gameData.modesPlayed || {
          classic: false,
          bestOf5: false,
          timeAttack: false,
          suddenDeath: false,
          mirror: false,
        }
        state.totalGamesPlayed = gameData.totalGamesPlayed || 0
      }
    }
  
    // Toggle theme
    function toggleTheme() {
      state.isDarkTheme = !state.isDarkTheme
      if (state.isDarkTheme) {
        document.body.classList.add("dark-theme")
        elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>'
      } else {
        document.body.classList.remove("dark-theme")
        elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>'
      }
      localStorage.setItem("darkTheme", state.isDarkTheme)
    }
  
    // Change game mode
    function changeGameMode(mode) {
      state.gameMode = mode
  
      // Update UI
      elements.modeButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.mode === mode)
      })
  
      // Show/hide time attack container
      elements.timeAttackContainer.classList.toggle("hidden", mode !== "time-attack")
  
      // Show/hide best of progress
      elements.bestOfProgress.classList.toggle("hidden", mode !== "best-of-5")
  
      // Track mode played
      if (mode === "classic") state.modesPlayed.classic = true
      if (mode === "best-of-5") state.modesPlayed.bestOf5 = true
      if (mode === "time-attack") state.modesPlayed.timeAttack = true
      if (mode === "sudden-death") state.modesPlayed.suddenDeath = true
      if (mode === "mirror") state.modesPlayed.mirror = true
  
      // Check for all modes achievement
      checkAllModesAchievement()
  
      // Reset game if changing modes
      resetGame()
    }
  
    // Change difficulty
    function changeDifficulty(difficulty) {
      state.difficulty = difficulty
  
      // Update UI
      elements.difficultyButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.difficulty === difficulty)
      })
    }
  
    // Start time attack mode
    function startTimeAttack() {
      resetGame()
      state.isTimerRunning = true
      state.timeLeft = 30
  
      // Update UI
      elements.startTimer.disabled = true
      elements.timerProgress.style.width = "100%"
      elements.timerText.textContent = "30s"
  
      // Start timer
      state.timerInterval = setInterval(() => {
        state.timeLeft--
  
        // Update timer UI
        const percentage = (state.timeLeft / 30) * 100
        elements.timerProgress.style.width = `${percentage}%`
        elements.timerText.textContent = `${state.timeLeft}s`
  
        // Check if time is up
        if (state.timeLeft <= 0) {
          clearInterval(state.timerInterval)
          state.isTimerRunning = false
          elements.startTimer.disabled = false
  
          // Show game over
          showGameOver()
        }
      }, 1000)
    }
  
    // Determine winner
    function determineWinner(player, computer) {
      if (player === computer) return "draw"
      if (
        (player === "rock" && computer === "scissors") ||
        (player === "scissors" && computer === "paper") ||
        (player === "paper" && computer === "rock")
      ) {
        return "win"
      }
      return "lose"
    }
  
    // Handle player choice
    function handleChoice(choice) {
      if (state.countdown !== null) return
      if (state.gameMode === "time-attack" && !state.isTimerRunning) return
  
      // Start countdown
      state.countdown = 1
      state.playerChoice = choice
  
      // Add to player pattern for AI analysis
      state.playerPattern.push(choice)
      if (state.playerPattern.length > 10) {
        state.playerPattern.shift()
      }
  
      // Reset option classes
      elements.options.forEach((option) => {
        option.classList.remove("player-win", "computer-win", "draw", "flipped")
      })
  
      // Hide draw animation
      elements.drawAnimation.classList.remove("draw-animation")
  
      // Update battle arena
      elements.playerChoice.textContent = "?"
      elements.computerChoice.textContent = "?"
  
      // Show countdown
      elements.countdownDisplay.classList.remove("hidden")
      elements.countdownText.textContent = state.countdown
  
      // Start countdown timer
      const countdownInterval = setInterval(() => {
        state.countdown--
  
        if (state.countdown > 0) {
          elements.countdownText.textContent = state.countdown
        } else {
          elements.countdownText.textContent = "Go!"
          clearInterval(countdownInterval)
  
          // Process result after a short delay
          setTimeout(() => {
            processResult()
            elements.countdownDisplay.classList.add("hidden")
            state.countdown = null
          }, 300)
        }
      }, 500)
    }
  
    // Process game result
    function processResult() {
      // Computer makes choice
      const computerSelection = getComputerChoice()
      state.computerChoice = computerSelection
  
      // Determine winner
      const gameResult = determineWinner(state.playerChoice, state.computerChoice)
      state.result = gameResult
  
      // Update stats
      state.stats[gameResult === "win" ? "wins" : gameResult === "draw" ? "draws" : "loses"]++
      state.totalGamesPlayed++
  
      // Check for perfect game achievement
      if (state.stats.wins >= 5 && state.stats.loses === 0 && !state.achievements.perfectGame) {
        state.achievements.perfectGame = true
        unlockAchievement("perfectGame")
      }
  
      // Check for comeback achievement
      if (state.wasLosingByThree && state.stats.wins > state.stats.loses && !state.achievements.comeback) {
        state.achievements.comeback = true
        unlockAchievement("comeback")
      }
  
      // Check if player is losing by 3 or more
      if (state.stats.loses >= state.stats.wins + 3) {
        state.wasLosingByThree = true
      }
  
      // Check for games played achievement
      if (state.totalGamesPlayed >= 20 && !state.achievements.gamesPlayed) {
        state.achievements.gamesPlayed = true
        unlockAchievement("gamesPlayed")
      }
  
      // Update streak
      if (gameResult === "win") {
        state.playerStreak++
        if (state.playerStreak > state.bestStreak) {
          state.bestStreak = state.playerStreak
        }
  
        // Track wins with different choices
        state.winsWith[state.playerChoice] = true
  
        // Check for special move
        if (state.playerStreak >= 3 && state.specialMoveCount < 3) {
          state.specialMoveCount++
          updateSpecialMoveButton()
          showToast("Special Move Available!", "Win 3 in a row to earn a special move", "info")
        }
      } else {
        state.playerStreak = 0
      }
  
      updateScoreboard()
  
      // Show draw animation if needed
      if (gameResult === "draw") {
        elements.drawAnimation.classList.add("draw-animation")
      }
  
      // Update option styling
      elements.options.forEach((option) => {
        const optionType = option.dataset.option
  
        if (optionType === state.playerChoice) {
          option.classList.add(gameResult === "win" ? "player-win" : gameResult === "lose" ? "computer-win" : "draw")
        }
      })
  
      // Update battle arena
      elements.playerChoice.textContent = optionEmojis[state.playerChoice]
      elements.computerChoice.textContent = optionEmojis[state.computerChoice]
      elements.playerChoice.classList.add("flip")
      elements.computerChoice.classList.add("flip")
  
      // Reset flip animation after it completes
      setTimeout(() => {
        elements.playerChoice.classList.remove("flip")
        elements.computerChoice.classList.remove("flip")
      }, 500)
  
      // Store last computer choice for mirror mode
      state.lastComputerChoice = state.computerChoice
  
      // Add to history
      state.gameHistory.unshift({
        round: state.currentRound,
        playerChoice: state.playerChoice,
        computerChoice: state.computerChoice,
        result: gameResult,
      })
  
      // Increment round
      state.currentRound++
      elements.roundDisplay.textContent = `Round ${state.currentRound}`
  
      // Update UI
      updateHistory()
      updateStats()
      updateAchievementProgress()
  
      // Check for achievements
      checkAchievements(gameResult)
  
      // Show result animation
      showResultAnimation(gameResult)
  
      // Update best of progress
      if (state.gameMode === "best-of-5") {
        updateBestOfProgress()
  
        // Check for game over
        if (state.stats.wins >= 5 || state.stats.loses >= 5) {
          setTimeout(() => {
            showGameOver()
          }, 1000)
        }
      }
  
      // Check for sudden death game over
      if (state.gameMode === "sudden-death" && gameResult === "lose") {
        setTimeout(() => {
          showGameOver()
        }, 1000)
      }
  
      // Save game data
      saveGameData()
    }
  
    // Get computer choice based on difficulty and game mode
    function getComputerChoice() {
      // If player used special move, computer always loses
      if (state.isSpecialMoveActive) {
        state.isSpecialMoveActive = false
  
        // Return the option that loses to player's choice
        if (state.playerChoice === "rock") return "scissors"
        if (state.playerChoice === "paper") return "rock"
        if (state.playerChoice === "scissors") return "paper"
      }
  
      // Mirror mode: Computer copies player's previous move
      if (state.gameMode === "mirror" && state.lastComputerChoice) {
        return state.playerChoice
      }
  
      // Easy difficulty: Computer makes more mistakes
      if (state.difficulty === "easy") {
        // 40% chance to pick the losing option
        if (Math.random() < 0.4) {
          if (state.playerChoice === "rock") return "scissors"
          if (state.playerChoice === "paper") return "rock"
          if (state.playerChoice === "scissors") return "paper"
        }
      }
  
      // Hard difficulty: Computer tries to predict player's moves
      if (state.difficulty === "hard") {
        // Analyze player pattern if we have enough data
        if (state.playerPattern.length >= 3) {
          // Look for patterns in player's choices
          const lastChoice = state.playerPattern[state.playerPattern.length - 1]
  
          // Check if player repeats the same choice
          const isRepeating = state.playerPattern.slice(-3).every((choice) => choice === lastChoice)
          if (isRepeating) {
            // Player likely to use same choice again, so counter it
            if (lastChoice === "rock") return "paper"
            if (lastChoice === "paper") return "scissors"
            if (lastChoice === "scissors") return "rock"
          }
  
          // Check if player alternates between two choices
          const lastThree = state.playerPattern.slice(-3)
          if (lastThree[0] === lastThree[2] && lastThree[0] !== lastThree[1]) {
            // Player might use the third option next
            const unusedOption = options.find((opt) => !lastThree.includes(opt))
            if (unusedOption) {
              // Counter the unused option
              if (unusedOption === "rock") return "paper"
              if (unusedOption === "paper") return "scissors"
              if (unusedOption === "scissors") return "rock"
            }
          }
  
          // If no pattern detected, counter the last choice
          if (lastChoice === "rock") return "paper"
          if (lastChoice === "paper") return "scissors"
          if (lastChoice === "scissors") return "rock"
        }
      }
  
      // Medium difficulty or fallback: Random choice
      return options[Math.floor(Math.random() * options.length)]
    }
  
    // Use special move
    function useSpecialMove() {
      if (state.specialMoveCount <= 0) return
  
      state.specialMoveCount--
      state.isSpecialMoveActive = true
      updateSpecialMoveButton()
  
      // Show toast
      showToast("Special Move Activated!", "Your next move will be a guaranteed win!", "success")
  
      // Update achievement
      if (!state.achievements.specialMove) {
        state.achievements.specialMove = true
        unlockAchievement("specialMove")
      }
  
      // Update achievement progress
      updateAchievementProgress()
    }
  
    // Update scoreboard
    function updateScoreboard() {
      elements.playerScore.textContent = state.stats.wins
      elements.computerScore.textContent = state.stats.loses
      elements.roundDisplay.textContent = `Round ${state.currentRound}`
    }
  
    // Update best of progress
    function updateBestOfProgress() {
      const playerWidth = (state.stats.wins / 5) * 100
      const computerWidth = (state.stats.loses / 5) * 100
  
      elements.playerProgress.style.width = `${playerWidth}%`
      elements.computerProgress.style.width = `${computerWidth}%`
    }
  
    // Update special move button
    function updateSpecialMoveButton() {
      elements.specialMoveCounter.textContent = `${state.specialMoveCount}/3`
      elements.specialMoveBtn.disabled = state.specialMoveCount <= 0
    }
  
    // Update game history
    function updateHistory() {
      if (state.gameHistory.length > 0) {
        elements.noHistory.style.display = "none"
  
        // Clear existing history
        elements.historyBody.innerHTML = ""
  
        // Add new history items
        state.gameHistory.forEach((game) => {
          const row = document.createElement("tr")
  
          // Round
          const roundCell = document.createElement("td")
          roundCell.textContent = game.round
          row.appendChild(roundCell)
  
          // Player choice
          const playerCell = document.createElement("td")
          playerCell.innerHTML = `<span>${optionEmojis[game.playerChoice]}</span> ${game.playerChoice}`
          playerCell.style.textTransform = "capitalize"
          row.appendChild(playerCell)
  
          // Computer choice
          const computerCell = document.createElement("td")
          computerCell.innerHTML = `<span>${optionEmojis[game.computerChoice]}</span> ${game.computerChoice}`
          computerCell.style.textTransform = "capitalize"
          row.appendChild(computerCell)
  
          // Result
          const resultCell = document.createElement("td")
          const resultBadge = document.createElement("span")
          resultBadge.classList.add("result-badge")
  
          if (game.result === "win") {
            resultBadge.classList.add("win-badge")
            resultBadge.textContent = "Win"
          } else if (game.result === "lose") {
            resultBadge.classList.add("lose-badge")
            resultBadge.textContent = "Loss"
          } else {
            resultBadge.classList.add("draw-badge")
            resultBadge.textContent = "Draw"
          }
  
          resultCell.appendChild(resultBadge)
          row.appendChild(resultCell)
  
          elements.historyBody.appendChild(row)
        })
      } else {
        elements.noHistory.style.display = "block"
      }
    }
  
    // Update statistics
    function updateStats() {
      const totalGames = state.stats.wins + state.stats.draws + state.stats.loses
      elements.totalGames.textContent = totalGames
      elements.bestStreakDisplay.textContent = state.bestStreak
  
      // Calculate win rate
      const winRate = totalGames === 0 ? 0 : Math.round((state.stats.wins / (state.stats.wins + state.stats.loses)) * 100)
      elements.winRate.textContent = `${winRate}%`
  
      // Update current round
      elements.currentRoundDisplay.textContent = state.currentRound
  
      // Update choice distribution
      if (state.gameHistory.length > 0) {
        elements.noStats.style.display = "none"
        elements.statsDistribution.style.display = "block"
  
        // Calculate choice counts
        const choiceCounts = {
          rock: state.gameHistory.filter((g) => g.playerChoice === "rock").length,
          paper: state.gameHistory.filter((g) => g.playerChoice === "paper").length,
          scissors: state.gameHistory.filter((g) => g.playerChoice === "scissors").length,
        }
  
        // Update stats display
        for (const choice of options) {
          const count = choiceCounts[choice]
          const percentage = Math.round((count / state.gameHistory.length) * 100)
  
          document.getElementById(`${choice}-stats`).textContent = `${count} (${percentage}%)`
          document.getElementById(`${choice}-progress`).style.width = `${percentage}%`
        }
      } else {
        elements.noStats.style.display = "block"
        elements.statsDistribution.style.display = "none"
      }
    }
  
    // Check for achievements
    function checkAchievements(gameResult) {
      // First win
      if (gameResult === "win" && !state.achievements.firstWin) {
        state.achievements.firstWin = true
        unlockAchievement("firstWin")
      }
  
      // 3 win streak
      if (state.playerStreak >= 3 && !state.achievements.streak3) {
        state.achievements.streak3 = true
        unlockAchievement("streak3")
      }
  
      // 10 total wins
      if (state.stats.wins >= 10 && !state.achievements.win10) {
        state.achievements.win10 = true
        unlockAchievement("win10")
      }
  
      // Win with all choices
      if (state.winsWith.rock && state.winsWith.paper && state.winsWith.scissors && !state.achievements.allChoices) {
        state.achievements.allChoices = true
        unlockAchievement("allChoices")
      }
  
      // Win on hard difficulty
      if (gameResult === "win" && state.difficulty === "hard" && !state.achievements.hardWin) {
        state.achievements.hardWin = true
        unlockAchievement("hardWin")
      }
    }
  
    // Check for all modes achievement
    function checkAllModesAchievement() {
      if (
        state.modesPlayed.classic &&
        state.modesPlayed.bestOf5 &&
        state.modesPlayed.timeAttack &&
        state.modesPlayed.suddenDeath &&
        state.modesPlayed.mirror &&
        !state.achievements.allModes
      ) {
        state.achievements.allModes = true
        unlockAchievement("allModes")
      }
    }
  
    // Unlock achievement
    function unlockAchievement(achievementId) {
      const achievement = elements.achievements[achievementId]
      if (achievement) {
        // Add unlocked class to the achievement
        achievement.classList.add("unlocked")
  
        // Add animation class
        achievement.classList.add("just-unlocked")
  
        // Remove animation class after animation completes
        setTimeout(() => {
          achievement.classList.remove("just-unlocked")
        }, 500)
  
        // Show toast
        const name = achievement.querySelector(".achievement-name").textContent
        showToast("Achievement Unlocked!", name, "success")
  
        // Update achievement progress
        updateAchievementProgress()
  
        // Trigger confetti
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        })
      }
    }
  
    // Update achievements UI
    function updateAchievements() {
      for (const [id, achieved] of Object.entries(state.achievements)) {
        if (achieved) {
          const achievement = elements.achievements[id]
          if (achievement) {
            achievement.classList.add("unlocked")
          }
        }
      }
    }
  
    // Show result animation
    function showResultAnimation(result) {
      elements.resultDisplay.classList.remove("hidden")
  
      if (result === "win") {
        elements.resultText.textContent = "You Win!"
        elements.resultText.style.color = "var(--win-color)"
  
        // Trigger confetti for wins
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        })
      } else if (result === "lose") {
        elements.resultText.textContent = "You Lose!"
        elements.resultText.style.color = "var(--lose-color)"
      } else {
        elements.resultText.textContent = "Draw!"
        elements.resultText.style.color = "var(--draw-color)"
      }
  
      // Hide result after animation
      setTimeout(() => {
        elements.resultDisplay.classList.add("hidden")
      }, 1000)
  
      // Show toast notification
      const resultMessages = {
        win: "You won this round!",
        lose: "Computer won this round!",
        draw: "It's a draw!",
      }
  
      showToast(`Round ${state.currentRound - 1} Result`, resultMessages[result], result)
    }
  
    // Show game over
    function showGameOver() {
      // Stop timer if running
      if (state.timerInterval) {
        clearInterval(state.timerInterval)
        state.isTimerRunning = false
      }
  
      // Update game over modal
      if (state.stats.wins > state.stats.loses) {
        elements.gameResult.textContent = "You Win!"
        elements.gameResult.style.color = "var(--win-color)"
      } else if (state.stats.wins < state.stats.loses) {
        elements.gameResult.textContent = "You Lose!"
        elements.gameResult.style.color = "var(--lose-color)"
      } else {
        elements.gameResult.textContent = "It's a Draw!"
        elements.gameResult.style.color = "var(--draw-color)"
      }
  
      elements.finalPlayerScore.textContent = state.stats.wins
      elements.finalComputerScore.textContent = state.stats.loses
  
      // Show modal
      elements.gameOverModal.classList.add("show")
    }
  
    // Show toast notification
    function showToast(title, message, type = "success") {
      elements.toast.className = "toast"
      elements.toast.classList.add(
        type === "win" || type === "success"
          ? "success"
          : type === "lose" || type === "error"
            ? "error"
            : type === "draw" || type === "warning"
              ? "warning"
              : "info",
      )
  
      const toastTitle = elements.toast.querySelector(".toast-title")
      const toastMessage = elements.toast.querySelector(".toast-message")
  
      toastTitle.textContent = title
      toastMessage.textContent = message
  
      elements.toast.classList.add("show")
  
      setTimeout(() => {
        elements.toast.classList.remove("show")
      }, 2000)
    }
  
    // Reset game
    function resetGame() {
      // Stop timer if running
      if (state.timerInterval) {
        clearInterval(state.timerInterval)
        state.isTimerRunning = false
      }
  
      state.stats = { wins: 0, draws: 0, loses: 0 }
      state.gameHistory = []
      state.currentRound = 1
      state.playerChoice = null
      state.computerChoice = null
      state.result = null
      state.playerStreak = 0
      state.specialMoveCount = 0
      state.isSpecialMoveActive = false
      state.timeLeft = 30
      state.wasLosingByThree = false
  
      // Reset UI
      updateScoreboard()
      updateHistory()
      updateStats()
      updateSpecialMoveButton()
      updateBestOfProgress()
  
      elements.playerChoice.textContent = "?"
      elements.computerChoice.textContent = "?"
      elements.startTimer.disabled = false
      elements.timerProgress.style.width = "100%"
      elements.timerText.textContent = "30s"
  
      // Reset option classes
      elements.options.forEach((option) => {
        option.classList.remove("player-win", "computer-win", "draw", "flipped")
      })
  
      // Hide draw animation
      elements.drawAnimation.classList.remove("draw-animation")
  
      showToast("Game Reset", "All stats and history have been cleared.", "info")
    }
  
    // Show rules modal
    function showRules() {
      elements.rulesModal.classList.add("show")
    }
  
    // Close modal
    function closeModal() {
      elements.rulesModal.classList.remove("show")
      elements.gameOverModal.classList.remove("show")
    }
  
    // Switch tabs
    function switchTab(tabId) {
      elements.tabButtons.forEach((button) => {
        button.classList.remove("active")
        if (button.dataset.tab === tabId) {
          button.classList.add("active")
        }
      })
  
      elements.tabPanels.forEach((panel) => {
        panel.classList.remove("active")
        if (panel.id === `${tabId}-tab`) {
          panel.classList.add("active")
        }
      })
    }
  
    // Add a function to update achievement progress
    function updateAchievementProgress() {
      // First win progress
      const firstWinProgress = state.stats.wins > 0 ? 100 : 0
      elements.achievementProgress.firstWin.style.width = `${firstWinProgress}%`
  
      // Streak progress
      const streakProgress = (state.playerStreak / 3) * 100
      elements.achievementProgress.streak.style.width = `${Math.min(streakProgress, 100)}%`
  
      // Win 10 progress
      const win10Progress = (state.stats.wins / 10) * 100
      elements.achievementProgress.win10.style.width = `${Math.min(win10Progress, 100)}%`
  
      // All choices progress
      const choicesWon =
        (state.winsWith.rock ? 1 : 0) + (state.winsWith.paper ? 1 : 0) + (state.winsWith.scissors ? 1 : 0)
      const allChoicesProgress = (choicesWon / 3) * 100
      elements.achievementProgress.allChoices.style.width = `${allChoicesProgress}%`
  
      // Hard win progress
      const hardWinProgress = state.achievements.hardWin ? 100 : 0
      elements.achievementProgress.hardWin.style.width = `${hardWinProgress}%`
  
      // Special move progress
      const specialMoveProgress = state.achievements.specialMove ? 100 : 0
      elements.achievementProgress.specialMove.style.width = `${specialMoveProgress}%`
  
      // Perfect game progress
      const perfectGameProgress = state.achievements.perfectGame
        ? 100
        : state.stats.wins >= 5 && state.stats.loses === 0
          ? 100
          : state.stats.loses > 0
            ? 0
            : (state.stats.wins / 5) * 100
      elements.achievementProgress.perfectGame.style.width = `${perfectGameProgress}%`
  
      // Comeback progress
      const comebackProgress = state.achievements.comeback ? 100 : 0
      elements.achievementProgress.comeback.style.width = `${comebackProgress}%`
  
      // Games played progress
      const gamesPlayedProgress = (state.totalGamesPlayed / 20) * 100
      elements.achievementProgress.gamesPlayed.style.width = `${Math.min(gamesPlayedProgress, 100)}%`
  
      // All modes progress
      const modesPlayed = Object.values(state.modesPlayed).filter(Boolean).length
      const allModesProgress = (modesPlayed / 5) * 100
      elements.achievementProgress.allModes.style.width = `${allModesProgress}%`
  
      // Update achievements count
      const achievedCount = Object.values(state.achievements).filter(Boolean).length
      elements.achievementsCount.textContent = `${achievedCount}/10`
    }
  
    //Import confetti
    const confetti = window.confetti
  
    // Initialize the game
    init()
  })
  