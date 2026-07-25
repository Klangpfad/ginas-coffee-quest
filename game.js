    // Gina's Coffee Quest 3.3 keeps everything in one file: canvas game, DOM menus, CSS and sound.
    const canvas = document.getElementById("game");
    const useMobilePlayfield = window.matchMedia("(max-width: 720px)").matches;
    canvas.width = useMobilePlayfield ? 600 : 900;
    canvas.height = useMobilePlayfield ? 800 : 600;
    const ctx = canvas.getContext("2d");
    const ginaSprite = new Image();
    ginaSprite.src = "gina-sprite.png";

    const ui = {
      score: document.getElementById("score"),
      time: document.getElementById("time"),
      lives: document.getElementById("lives"),
      sideHighscoreValue: document.getElementById("sideHighscoreValue"),
      sideBestMedalValue: document.getElementById("sideBestMedalValue"),
      coffeeCount: document.getElementById("coffeeCount"),
      cookieCount: document.getElementById("cookieCount"),
      powerStatus: document.getElementById("powerStatus"),
      medalProgress: document.getElementById("medalProgress"),
      loading: document.getElementById("loadingScreen"),
      loadingTip: document.getElementById("loadingTip"),
      stage: document.querySelector(".stage"),
      start: document.getElementById("startScreen"),
      countdown: document.getElementById("countdownScreen"),
      countdownValue: document.getElementById("countdownValue"),
      pause: document.getElementById("pauseScreen"),
      gameOver: document.getElementById("gameOverScreen"),
      finalRank: document.getElementById("finalRank"),
      finalMedal: document.getElementById("finalMedal"),
      finalScore: document.getElementById("finalScore"),
      finalHighscore: document.getElementById("finalHighscore"),
      gameOverMessage: document.getElementById("gameOverMessage"),
      finalCoffee: document.getElementById("finalCoffee"),
      finalCookies: document.getElementById("finalCookies"),
      finalSurvival: document.getElementById("finalSurvival"),
      finalCombo: document.getElementById("finalCombo"),
      finalNearMiss: document.getElementById("finalNearMiss"),
      finalBugsAvoided: document.getElementById("finalBugsAvoided"),
      achievements: document.getElementById("achievementsScreen"),
      achievementSummary: document.getElementById("achievementSummary"),
      achievementList: document.getElementById("achievementList"),
      toastStack: document.getElementById("toastStack"),
      powerStrip: document.getElementById("powerStrip"),
      touchJoystick: document.getElementById("touchJoystick"),
      joystickBase: document.getElementById("joystickBase"),
      joystickKnob: document.getElementById("joystickKnob"),
      musicButton: document.getElementById("musicButton"),
      startMusicButton: document.getElementById("startMusicButton"),
      startButton: document.getElementById("startButton"),
      resumeButton: document.getElementById("resumeButton"),
      restartButton: document.getElementById("restartButton"),
      resetHighscoreButton: document.getElementById("resetHighscoreButton"),
      resetAchievementsButton: document.getElementById("resetAchievementsButton"),
      achievementsButton: document.getElementById("achievementsButton"),
      closeAchievementsButton: document.getElementById("closeAchievementsButton"),
      closeAchievementsFooterButton: document.getElementById("closeAchievementsFooterButton")
    };

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    const GAME_SECONDS = 60;
    const MAX_LIVES = 3;
    const COMBO_SECONDS = 1.45;
    const NEAR_MISS_SCORE = 5;
    const NEAR_MISS_MARGIN = 24;
    const BUG_THREAT_MARGIN = 90;
    const BUG_DODGE_CLEAR_MARGIN = 150;
    const STORAGE_KEY = "ginaCoffeeQuestHighscore";
    const BEST_MEDAL_KEY = "ginaCoffeeQuestBestMedal";
    const LEGACY_HIGHSCORE_KEYS = ["ginaCoffeeHighscore", "ginasCoffeeQuestHighscore"];
    const ACHIEVEMENT_KEY = "ginasCoffeeQuestAchievements";
    const keys = new Set();
    const joystickVector = { x: 0, y: 0 };
    let joystickPointerId = null;

    const tips = [
      "Kaffee erhöht die Administrator-Stabilität.",
      "Krümel sind keine Sicherheitslücke.",
      "Gute Laune ist ein Systemfehler."
    ];

    const itemTypes = {
      coffee: { score: 10, radius: 18, color: "#ffd56f" },
      cookie: { score: 25, radius: 18, color: "#e7a858" },
      chip: { score: 50, radius: 17, color: "#83d8ff" },
      goldenCoffee: { score: 10, radius: 20, color: "#ffe777" },
      shieldHalo: { score: 0, radius: 21, color: "#fff4a8" },
      turboCoffee: { score: 0, radius: 20, color: "#ff8ed6" }
    };

    const bugTypes = {
      standard: {
        radius: 22,
        minSpeed: 85,
        maxSpeed: 145,
        minLife: 6.5,
        maxLife: 10.5,
        color: "#ef4057",
        glow: "rgba(239, 64, 87, 0.7)"
      },
      sprinter: {
        radius: 16,
        minSpeed: 155,
        maxSpeed: 215,
        minLife: 5,
        maxLife: 7.5,
        color: "#ff8a3d",
        glow: "rgba(255, 138, 61, 0.72)"
      },
      hunter: {
        radius: 25,
        minSpeed: 72,
        maxSpeed: 102,
        minLife: 8,
        maxLife: 12,
        turnRate: 1.35,
        color: "#a86dff",
        glow: "rgba(168, 109, 255, 0.74)"
      }
    };

    const difficultyStages = [
      {
        phase: 1,
        startsAt: 0,
        maxBugs: 6,
        spawnMin: 1.65,
        spawnMax: 2.25,
        speedMultiplier: 0.95,
        message: "Kaffeepause: Standard-Bugs unterwegs."
      },
      {
        phase: 2,
        startsAt: 20,
        maxBugs: 8,
        spawnMin: 1.15,
        spawnMax: 1.7,
        speedMultiplier: 1.08,
        message: "Schicht 2: Sprinter und Jäger tauchen auf!"
      },
      {
        phase: 3,
        startsAt: 40,
        maxBugs: 10,
        spawnMin: 0.78,
        spawnMax: 1.18,
        speedMultiplier: 1.22,
        message: "Alarmstufe Rot: Das System dreht auf!"
      }
    ];

    const achievements = {
      firstCoffee: {
        icon: "☕",
        title: "Erste Tasse Kaffee",
        description: "Sammle deinen ersten Kaffee in einer Runde.",
        target: 1,
        progress: () => stats.coffee,
        done: () => stats.coffee >= 1
      },
      cookieMaster: {
        icon: "🍪",
        title: "Krümelmeister",
        description: "Sammle 10 Cookies in einer Runde.",
        target: 10,
        progress: () => stats.cookies,
        done: () => stats.cookies >= 10
      },
      bugHunter: {
        icon: "🐛",
        title: "Bug-Jäger",
        description: "Weiche 20 bedrohlichen Bugs in einer Runde aus.",
        target: 20,
        progress: () => stats.bugsAvoided,
        done: () => stats.bugsAvoided >= 20
      },
      nightShift: {
        icon: "🌙",
        title: "Nachtschicht",
        description: "Erreiche 300 Punkte in einer Runde.",
        target: 300,
        progress: () => score,
        done: () => score >= 300
      },
      serverGuru: {
        icon: "💻",
        title: "Server-Guru",
        description: "Erreiche 500 Punkte in einer Runde.",
        target: 500,
        progress: () => score,
        done: () => score >= 500
      }
    };

    const funnyMessages = [
      "Kaffeepegel stabilisiert.",
      "Administrator-Fokus +10.",
      "Krümel erkannt.",
      "Der Bug war nur Deko.",
      "System läuft überraschend stabil."
    ];

    const gameOverMessages = [
      "Gina behauptet, der Bug war nur Deko.",
      "Server-Snacks leer. Bitte nachfüllen.",
      "Der Heiligenschein braucht ein Update.",
      "Kaffee alle. Systemmut sinkt.",
      "Gute Laune wurde ordnungsgemäß gespeichert."
    ];

    const medals = [
      { minScore: 0, emoji: "☕", title: "Kaffee-Neuling" },
      { minScore: 500, emoji: "🥉", title: "Kaffee-Azubi" },
      { minScore: 1000, emoji: "🥈", title: "Server-Techniker" },
      { minScore: 1500, emoji: "🥇", title: "Rechenzentrums-Held" },
      { minScore: 2000, emoji: "💎", title: "Gina's Lieblingsadmin" }
    ];

    let state = "loading";
    let score = 0;
    let highscore = loadHighscore();
    let bestMedal = loadBestMedal();
    let unlockedAchievements = loadAchievements();
    let lives = MAX_LIVES;
    let timeLeft = GAME_SECONDS;
    let lastFrame = performance.now();
    let elapsed = 0;
    let itemSpawnTimer = 0;
    let bugSpawnTimer = 0;
    let items = [];
    let bugs = [];
    let particles = [];
    let scorePopups = [];
    let ginaSparkles = [];
    let starsNear = [];
    let starsMid = [];
    let starsFar = [];
    let messageTimer = 0;
    let lastPowerLabel = "";
    let newHighscoreAnnounced = false;
    let countdownTimeout = null;
    let pausedFromState = "playing";
    let lastDifficultyPhase = 1;
    let lastRunMedal = medals[0];
    let achievementReturnState = "start";
    let comboCount = 0;
    let comboTimer = 0;
    let stats = createEmptyStats();
    let activePowerups = {
      doublePoints: 0,
      shield: 0,
      turbo: 0
    };

    const gina = {
      x: WIDTH / 2,
      y: HEIGHT / 2,
      r: 38,
      speed: 270,
      baseSpeed: 270,
      invincible: 0,
      wingPhase: 0
    };

    const audio = {
      context: null,
      musicOn: false,
      musicTimer: null,
      beat: 0
    };

    createStars();
    renderBestMedal();
    updateHud();
    renderAchievementOverview();
    showLoadingScreen();

    ui.startButton.addEventListener("click", startGame);
    ui.restartButton.addEventListener("click", startGame);
    ui.resetHighscoreButton.addEventListener("click", resetHighscore);
    ui.resetAchievementsButton.addEventListener("click", resetAchievements);
    ui.resumeButton.addEventListener("click", togglePause);
    ui.musicButton.addEventListener("click", toggleMusic);
    ui.startMusicButton.addEventListener("click", toggleMusic);
    ui.achievementsButton.addEventListener("click", openAchievementOverview);
    ui.closeAchievementsButton.addEventListener("click", closeAchievementOverview);
    ui.closeAchievementsFooterButton.addEventListener("click", closeAchievementOverview);

    // Keyboard input supports arrows, WASD, Enter/Space for menus and P for pause.
    window.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
        event.preventDefault();
      }

      keys.add(key);

      const buttonHasFocus = event.target && event.target.tagName === "BUTTON";
      if (
        (state === "start" || state === "gameover") &&
        (key === "enter" || key === " ") &&
        !buttonHasFocus
      ) {
        startGame();
      }

      if (key === "escape" && state === "achievements") {
        closeAchievementOverview();
      }

      if (key === "p" && (state === "countdown" || state === "playing" || state === "paused")) {
        togglePause();
      }
    });

    window.addEventListener("keyup", (event) => {
      keys.delete(event.key.toLowerCase());
    });

    window.addEventListener("blur", pauseForInterruption);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pauseForInterruption();
    });

    // The virtual joystick supports smooth direction and speed on touch devices.
    ui.touchJoystick.addEventListener("pointerdown", (event) => {
      if (joystickPointerId !== null) return;

      event.preventDefault();
      joystickPointerId = event.pointerId;
      ui.touchJoystick.classList.add("active");
      ui.touchJoystick.setPointerCapture(event.pointerId);
      updateJoystick(event.clientX, event.clientY);
    });

    ui.touchJoystick.addEventListener("pointermove", (event) => {
      if (event.pointerId !== joystickPointerId) return;
      event.preventDefault();
      updateJoystick(event.clientX, event.clientY);
    });

    const endJoystickInput = (event) => {
      if (event.pointerId !== joystickPointerId) return;
      event.preventDefault();
      resetJoystick();
    };

    ui.touchJoystick.addEventListener("pointerup", endJoystickInput);
    ui.touchJoystick.addEventListener("pointercancel", endJoystickInput);
    ui.touchJoystick.addEventListener("lostpointercapture", endJoystickInput);

    function updateJoystick(clientX, clientY) {
      const baseRect = ui.joystickBase.getBoundingClientRect();
      const centerX = baseRect.left + baseRect.width / 2;
      const centerY = baseRect.top + baseRect.height / 2;
      const maxTravel = Math.max(1, baseRect.width / 2 - ui.joystickKnob.offsetWidth / 2 - 4);
      let offsetX = clientX - centerX;
      let offsetY = clientY - centerY;
      const distance = Math.hypot(offsetX, offsetY);

      if (distance > maxTravel) {
        const scale = maxTravel / distance;
        offsetX *= scale;
        offsetY *= scale;
      }

      joystickVector.x = offsetX / maxTravel;
      joystickVector.y = offsetY / maxTravel;
      ui.joystickKnob.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      ui.touchJoystick.dataset.inputX = joystickVector.x.toFixed(3);
      ui.touchJoystick.dataset.inputY = joystickVector.y.toFixed(3);
      ui.touchJoystick.dataset.lastInputX = ui.touchJoystick.dataset.inputX;
      ui.touchJoystick.dataset.lastInputY = ui.touchJoystick.dataset.inputY;
    }

    function resetJoystick() {
      joystickPointerId = null;
      joystickVector.x = 0;
      joystickVector.y = 0;
      ui.touchJoystick.classList.remove("active");
      ui.joystickKnob.style.transform = "translate(0px, 0px)";
      ui.touchJoystick.dataset.inputX = "0";
      ui.touchJoystick.dataset.inputY = "0";
    }

    function showLoadingScreen() {
      let tipIndex = 0;
      const tipTimer = setInterval(() => {
        tipIndex = (tipIndex + 1) % tips.length;
        ui.loadingTip.textContent = tips[tipIndex];
      }, 850);

      setTimeout(() => {
        clearInterval(tipTimer);
        state = "start";
        ui.loading.classList.add("hidden");
        ui.start.classList.remove("hidden");
        ui.achievementsButton.disabled = false;
      }, 2300);
    }

    function startGame() {
      ensureAudio();
      clearTimeout(countdownTimeout);
      state = "countdown";
      score = 0;
      lives = MAX_LIVES;
      timeLeft = GAME_SECONDS;
      elapsed = 0;
      itemSpawnTimer = 0;
      bugSpawnTimer = 0;
      items = [];
      bugs = [];
      particles = [];
      scorePopups = [];
      ginaSparkles = [];
      stats = createEmptyStats();
      comboCount = 0;
      comboTimer = 0;
      activePowerups = {
        doublePoints: 0,
        shield: 0,
        turbo: 0
      };
      messageTimer = 0;
      newHighscoreAnnounced = false;
      pausedFromState = "playing";
      lastDifficultyPhase = 1;
      lastRunMedal = medals[0];
      ui.stage.classList.remove("new-highscore", "power-double", "power-shield", "power-turbo");
      gina.x = WIDTH / 2;
      gina.y = HEIGHT / 2;
      gina.invincible = 0;
      gina.speed = gina.baseSpeed;

      hideAllOverlays();
      updateHud();

      for (let i = 0; i < 7; i++) spawnItem();
      for (let i = 0; i < 3; i++) spawnBug();
      startCountdown();
    }

    function startCountdown() {
      const steps = ["3", "2", "1", "Los!"];
      let stepIndex = 0;

      ui.countdown.classList.remove("hidden");
      ui.countdownValue.textContent = steps[stepIndex];
      ui.countdownValue.classList.remove("countdown-pop");
      void ui.countdownValue.offsetWidth;
      ui.countdownValue.classList.add("countdown-pop");

      const nextStep = () => {
        stepIndex += 1;

        if (stepIndex >= steps.length) {
          ui.countdown.classList.add("hidden");
          state = "playing";
          lastFrame = performance.now();
          return;
        }

        ui.countdownValue.textContent = steps[stepIndex];
        ui.countdownValue.classList.remove("countdown-pop");
        void ui.countdownValue.offsetWidth;
        ui.countdownValue.classList.add("countdown-pop");
        countdownTimeout = setTimeout(nextStep, stepIndex === steps.length - 1 ? 650 : 760);
      };

      countdownTimeout = setTimeout(nextStep, 760);
    }

    function endGame() {
      state = "gameover";
      saveHighscore();
      const earnedMedal = updateBestMedal(score);
      updateHud();
      ui.finalRank.textContent = getGameOverRank();
      ui.finalMedal.textContent = formatMedal(earnedMedal);
      ui.finalScore.textContent = `Endstand: ${score}`;
      ui.finalHighscore.textContent = `Highscore: ${highscore}`;
      ui.gameOverMessage.textContent = gameOverMessages[Math.floor(Math.random() * gameOverMessages.length)];
      ui.finalCoffee.textContent = `Gesammelte Kaffees: ${stats.coffee}`;
      ui.finalCookies.textContent = `Gesammelte Cookies: ${stats.cookies}`;
      ui.finalSurvival.textContent = `Überlebte Zeit: ${Math.floor(stats.survivalTime)}s`;
      ui.finalCombo.textContent = `Beste Combo: x${stats.bestCombo}`;
      ui.finalNearMiss.textContent = `Knapp vorbei: ${stats.nearMisses}`;
      ui.finalBugsAvoided.textContent = `Ausgewichene Bugs: ${stats.bugsAvoided}`;
      ui.gameOver.classList.remove("hidden");
    }

    function getGameOverRank() {
      if (score >= 700) return "Server-Legende";
      if (score >= 520) return "Kaffee-Kommandantin";
      if (score >= 380) return "Bug-Ausweicherin";
      if (score >= 240) return "Snack-Sammlerin";
      if (stats.survivalTime >= GAME_SECONDS - 1) return "Durchhalterin";
      if (stats.coffee >= 8) return "Kaffeemeisterin";
      if (stats.cookies >= 6) return "Keks-Kennerin";
      return "Kaffeepause";
    }

    function togglePause() {
      if (state === "countdown" || state === "playing") {
        pauseForInterruption();
        return;
      }

      if (state === "paused") {
        if (pausedFromState === "countdown") {
          ui.pause.classList.add("hidden");
          state = "countdown";
          startCountdown();
          return;
        }

        state = "playing";
        ui.pause.classList.add("hidden");
        lastFrame = performance.now();
      }
    }

    function pauseForInterruption() {
      if (state !== "playing" && state !== "countdown") return;

      pausedFromState = state;
      clearTimeout(countdownTimeout);
      state = "paused";
      keys.clear();
      resetJoystick();
      ui.countdown.classList.add("hidden");
      ui.pause.classList.remove("hidden");
    }

    function hideAllOverlays() {
      ui.loading.classList.add("hidden");
      ui.start.classList.add("hidden");
      ui.countdown.classList.add("hidden");
      ui.pause.classList.add("hidden");
      ui.gameOver.classList.add("hidden");
      ui.achievements.classList.add("hidden");
    }

    function openAchievementOverview() {
      if (state === "loading" || state === "achievements") return;

      achievementReturnState = state;

      if (state === "countdown") {
        clearTimeout(countdownTimeout);
        ui.countdown.classList.add("hidden");
      }

      if (state === "playing" || state === "countdown") {
        keys.clear();
        resetJoystick();
      }

      state = "achievements";
      renderAchievementOverview();
      ui.achievements.classList.remove("hidden");
      ui.closeAchievementsButton.focus();
    }

    function closeAchievementOverview() {
      if (state !== "achievements") return;

      ui.achievements.classList.add("hidden");

      if (achievementReturnState === "countdown") {
        state = "countdown";
        startCountdown();
      } else {
        state = achievementReturnState;
        if (state === "playing") lastFrame = performance.now();
      }

      ui.achievementsButton.focus();
    }

    function renderAchievementOverview() {
      const entries = Object.entries(achievements);
      const unlockedCount = entries.filter(([key]) => unlockedAchievements[key]).length;

      ui.achievementSummary.textContent =
        `${unlockedCount} von ${entries.length} freigeschaltet`;
      ui.achievementsButton.textContent =
        `🏅 Erfolge ${unlockedCount}/${entries.length}`;
      ui.achievementList.innerHTML = "";

      entries.forEach(([key, achievement]) => {
        const unlocked = Boolean(unlockedAchievements[key]);
        const progress = Math.min(achievement.target, Math.max(0, achievement.progress()));
        const percentage = Math.round((progress / achievement.target) * 100);
        const card = document.createElement("article");

        card.className = `achievement-card ${unlocked ? "unlocked" : "locked"}`;
        card.innerHTML = `
          <div class="achievement-card-header">
            <span class="achievement-icon" aria-hidden="true">${achievement.icon}</span>
            <strong>${achievement.title}</strong>
            <span class="achievement-state">${unlocked ? "✓ Freigeschaltet" : `${progress}/${achievement.target}`}</span>
          </div>
          <p>${achievement.description}</p>
          <div class="achievement-progress" aria-hidden="true">
            <span style="width: ${unlocked ? 100 : percentage}%"></span>
          </div>
        `;
        ui.achievementList.appendChild(card);
      });
    }

    function updateHud() {
      ui.score.textContent = `Score: ${score}`;
      ui.time.textContent = `Zeit: ${Math.ceil(timeLeft)}`;
      ui.lives.textContent = "♥".repeat(lives) + "♡".repeat(MAX_LIVES - lives);
      updateHighscoreDisplay();
      ui.coffeeCount.textContent = `Kaffee: ${stats.coffee}`;
      ui.cookieCount.textContent = `Cookies: ${stats.cookies}`;
      updateMedalProgress();
      const activeNames = [];
      if (activePowerups.doublePoints > 0) activeNames.push(`2x ${Math.ceil(activePowerups.doublePoints)}s`);
      if (activePowerups.shield > 0) activeNames.push(`Schutz ${Math.ceil(activePowerups.shield)}s`);
      if (activePowerups.turbo > 0) activeNames.push(`Turbo ${Math.ceil(activePowerups.turbo)}s`);
      const powerLabel = activeNames.length ? activeNames.join(" | ") : "Power: -";
      ui.powerStatus.textContent = powerLabel;
      if (powerLabel !== lastPowerLabel) {
        ui.powerStrip.innerHTML = activeNames.map((name) => `<div class="power-pill">${name}</div>`).join("");
        lastPowerLabel = powerLabel;
      }
      updatePowerupFrameState();
    }

    function updatePowerupFrameState() {
      ui.stage.classList.toggle("power-double", activePowerups.doublePoints > 0);
      ui.stage.classList.toggle("power-shield", activePowerups.shield > 0);
      ui.stage.classList.toggle("power-turbo", activePowerups.turbo > 0);
    }

    function updateMedalProgress() {
      const earnedMedal = getMedalForScore(score);
      const nextMedal = medals.find((medal) => score < medal.minScore);

      if (nextMedal) {
        ui.medalProgress.textContent =
          `${nextMedal.emoji} ${score}/${nextMedal.minScore} bis ${nextMedal.title}`;
      } else {
        ui.medalProgress.textContent = "💎 Höchste Medaille erreicht";
      }

      if (state === "playing" && earnedMedal.minScore > lastRunMedal.minScore) {
        lastRunMedal = earnedMedal;
        showToast(`Neue Medaille: ${formatMedal(earnedMedal)}`, true);
        playAchievementSound();
        burst(gina.x, gina.y, "#ffd56f", 26);
      }
    }

    function gameLoop(now) {
      const delta = Math.min((now - lastFrame) / 1000, 0.033);
      lastFrame = now;

      if (state === "playing") {
        update(delta);
      } else {
        elapsed += delta * 0.35;
      }

      draw();
      requestAnimationFrame(gameLoop);
    }

    function update(delta) {
      elapsed += delta;
      timeLeft -= delta;
      stats.survivalTime = GAME_SECONDS - timeLeft;
      messageTimer -= delta;
      updateDifficultyFeedback();

      if (timeLeft <= 0) {
        timeLeft = 0;
        endGame();
        return;
      }

      updatePowerups(delta);
      updateCombo(delta);
      updatePlayer(delta);
      updateSpawns(delta);
      updateBugs(delta);
      checkNearMisses();
      updateParticles(delta);
      updateScorePopups(delta);
      updateSparkles(delta);
      checkCollisions();
      checkAchievements();
      maybeShowFunnyMessage();
      updateHud();
    }

    function updatePlayer(delta) {
      let dx = joystickVector.x;
      let dy = joystickVector.y;

      if (isDown("arrowleft", "a")) dx -= 1;
      if (isDown("arrowright", "d")) dx += 1;
      if (isDown("arrowup", "w")) dy -= 1;
      if (isDown("arrowdown", "s")) dy += 1;

      if (dx !== 0 || dy !== 0) {
        const length = Math.hypot(dx, dy);
        const movementScale = length > 1 ? 1 / length : 1;
        const speed = activePowerups.turbo > 0 ? gina.baseSpeed * 1.48 : gina.baseSpeed;
        gina.speed = speed;
        gina.x += dx * movementScale * speed * delta;
        gina.y += dy * movementScale * speed * delta;
      }

      gina.x = clamp(gina.x, gina.r, WIDTH - gina.r);
      gina.y = clamp(gina.y, gina.r + 28, HEIGHT - gina.r);
      gina.invincible = Math.max(0, gina.invincible - delta);
      gina.wingPhase += delta * 8;
    }

    function updatePowerups(delta) {
      activePowerups.doublePoints = Math.max(0, activePowerups.doublePoints - delta);
      activePowerups.shield = Math.max(0, activePowerups.shield - delta);
      activePowerups.turbo = Math.max(0, activePowerups.turbo - delta);
    }

    function updateCombo(delta) {
      if (comboTimer <= 0) return;

      comboTimer = Math.max(0, comboTimer - delta);
      if (comboTimer === 0) {
        comboCount = 0;
      }
    }

    function isDown(primary, alternative) {
      return keys.has(primary) || keys.has(alternative);
    }

    function updateSpawns(delta) {
      itemSpawnTimer -= delta;
      bugSpawnTimer -= delta;
      const difficulty = getDifficulty();

      if (itemSpawnTimer <= 0 && items.length < 11) {
        spawnItem();
        itemSpawnTimer = random(0.45, 0.95);
      }

      if (bugSpawnTimer <= 0 && bugs.length < difficulty.maxBugs) {
        spawnBug(difficulty);
        bugSpawnTimer = random(difficulty.spawnMin, difficulty.spawnMax);
      }
    }

    function updateBugs(delta) {
      bugs = bugs.filter((bug) => {
        bug.age += delta;

        if (bug.type === "hunter") {
          const currentAngle = Math.atan2(bug.vy, bug.vx);
          const targetAngle = Math.atan2(gina.y - bug.y, gina.x - bug.x);
          const angleDifference = Math.atan2(
            Math.sin(targetAngle - currentAngle),
            Math.cos(targetAngle - currentAngle)
          );
          const turn = clamp(
            angleDifference,
            -bug.turnRate * delta,
            bug.turnRate * delta
          );
          bug.vx = Math.cos(currentAngle + turn) * bug.speed;
          bug.vy = Math.sin(currentAngle + turn) * bug.speed;
        }

        bug.x += bug.vx * delta;
        bug.y += bug.vy * delta;
        bug.spin += delta * (bug.type === "sprinter" ? 9 : 5);

        if (bug.x < bug.r || bug.x > WIDTH - bug.r) bug.vx *= -1;
        if (bug.y < bug.r + 30 || bug.y > HEIGHT - bug.r) bug.vy *= -1;

        bug.x = clamp(bug.x, bug.r, WIDTH - bug.r);
        bug.y = clamp(bug.y, bug.r + 30, HEIGHT - bug.r);
        updateBugDodgeState(bug);

        if (bug.age >= bug.life) {
          burst(bug.x, bug.y, "#83d8ff", 8);
          return false;
        }

        return true;
      });
    }

    function updateBugDodgeState(bug) {
      if (bug.dodgeAwarded || bug.hitPlayer) return;

      const hitDistance = gina.r + bug.r;
      const currentDistance = distance(gina, bug);

      if (
        currentDistance > hitDistance &&
        currentDistance <= hitDistance + BUG_THREAT_MARGIN
      ) {
        bug.wasThreatening = true;
      }

      if (
        bug.wasThreatening &&
        currentDistance >= hitDistance + BUG_DODGE_CLEAR_MARGIN
      ) {
        bug.dodgeAwarded = true;
        stats.bugsAvoided += 1;
        burst(bug.x, bug.y, "#83d8ff", 6);
      }
    }

    function updateParticles(delta) {
      particles = particles.filter((particle) => {
        particle.life -= delta;
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        particle.vy += 42 * delta;
        return particle.life > 0;
      });
    }

    function updateScorePopups(delta) {
      scorePopups = scorePopups.filter((popup) => {
        popup.life -= delta;
        popup.y -= 42 * delta;
        popup.x += Math.sin((popup.maxLife - popup.life) * 8) * 8 * delta;
        return popup.life > 0;
      });
    }

    function updateSparkles(delta) {
      if (Math.random() < 0.7) {
        ginaSparkles.push({
          x: gina.x + random(-42, 42),
          y: gina.y + random(-58, 42),
          vx: random(-8, 8),
          vy: random(-28, -8),
          size: random(1.4, 3.2),
          life: random(0.35, 0.8),
          maxLife: 0.8
        });
      }

      ginaSparkles = ginaSparkles.filter((sparkle) => {
        sparkle.life -= delta;
        sparkle.x += sparkle.vx * delta;
        sparkle.y += sparkle.vy * delta;
        return sparkle.life > 0;
      });
    }

    function checkCollisions() {
      items = items.filter((item) => {
        if (distance(gina, item) < gina.r + item.r) {
          collectItem(item);
          return false;
        }
        return true;
      });

      bugs = bugs.filter((bug) => {
        if (distance(gina, bug) < gina.r + bug.r) {
          bug.hitPlayer = true;

          if (activePowerups.shield > 0) {
            showToast("Schutz-Heiligenschein: Bug freundlich ignoriert.", false);
            playCollectSound("chip");
            burst(bug.x, bug.y, "#fff4a8", 18);
            return false;
          }

          if (gina.invincible === 0) {
            lives -= 1;
            gina.invincible = 1.4;
            playBugSound();
            showToast("Der Bug war nur Deko.", false);
            burst(gina.x, gina.y, "#ef4057", 22);

            if (lives <= 0) {
              lives = 0;
              endGame();
            }
          }

          return true;
        }

        return true;
      });
    }

    function checkNearMisses() {
      bugs.forEach((bug) => {
        if (bug.nearMissAwarded || gina.invincible > 0) return;

        const hitDistance = gina.r + bug.r;
        const currentDistance = distance(gina, bug);
        if (currentDistance <= hitDistance || currentDistance > hitDistance + NEAR_MISS_MARGIN) return;

        bug.nearMissAwarded = true;
        stats.nearMisses += 1;
        score += NEAR_MISS_SCORE;
        showScorePopup(bug.x, bug.y - 18, NEAR_MISS_SCORE);
        burst(bug.x, bug.y, "#83d8ff", 10);
        showToast(`Knapp vorbei! +${NEAR_MISS_SCORE}`, false);
        checkNewHighscore();
      });
    }

    function collectItem(item) {
      let awardedScore = 0;

      if (item.type === "goldenCoffee") {
        activePowerups.doublePoints = 10;
        stats.coffee += 1;
        awardedScore = itemTypes[item.type].score;
        score += awardedScore;
        showToast("Goldener Kaffee: doppelte Punkte für 10 Sekunden.", false);
      } else if (item.type === "shieldHalo") {
        activePowerups.shield = 5;
        showToast("Schutz-Heiligenschein aktiviert.", false);
      } else if (item.type === "turboCoffee") {
        activePowerups.turbo = 8;
        showToast("Turbo-Kaffee: Gina zischt los.", false);
      } else {
        const multiplier = activePowerups.doublePoints > 0 ? 2 : 1;
        awardedScore = itemTypes[item.type].score * multiplier;
        score += awardedScore;
        if (item.type === "coffee") stats.coffee += 1;
        if (item.type === "cookie") stats.cookies += 1;
        if (item.type === "chip") stats.chips += 1;
      }

      if (awardedScore > 0) {
        const comboBonus = registerCombo(item.x, item.y);
        showScorePopup(item.x, item.y, awardedScore);
        if (comboBonus > 0) {
          score += comboBonus;
          showScorePopup(item.x, item.y - 28, comboBonus);
        }
        checkNewHighscore();
      }

      if (itemTypes[item.type].score > 0 && item.type !== "goldenCoffee") {
        if (activePowerups.doublePoints > 0) {
          showToast("Administrator-Fokus +10.", false);
        }
      }

      playCollectSound(item.type);
      burst(item.x, item.y, itemTypes[item.type].color, 16);
      checkAchievements();
    }

    function spawnItem() {
      const roll = Math.random();
      const type = roll < 0.5
        ? "coffee"
        : roll < 0.74
          ? "cookie"
          : roll < 0.9
            ? "chip"
            : roll < 0.94
              ? "goldenCoffee"
              : roll < 0.97
                ? "shieldHalo"
                : "turboCoffee";
      const radius = itemTypes[type].radius;
      const position = findSafeSpawnPosition({
        radius,
        minY: 72,
        playerClearance: 80,
        entities: [...items, ...bugs],
        entityClearance: 12
      });

      items.push({
        type,
        x: position.x,
        y: position.y,
        r: radius,
        bob: random(0, Math.PI * 2),
        spin: random(0, Math.PI * 2)
      });
    }

    function spawnBug(difficulty = getDifficulty()) {
      const type = chooseBugType(difficulty.phase);
      const settings = bugTypes[type];
      const speed = random(settings.minSpeed, settings.maxSpeed) * difficulty.speedMultiplier;
      const angle = random(0, Math.PI * 2);
      const radius = settings.radius;
      const position = findSafeSpawnPosition({
        radius,
        minY: 96,
        playerClearance: 120,
        entities: [...bugs, ...items],
        entityClearance: 24
      });

      bugs.push({
        type,
        x: position.x,
        y: position.y,
        r: radius,
        speed,
        turnRate: settings.turnRate || 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        spin: random(0, Math.PI * 2),
        nearMissAwarded: false,
        wasThreatening: false,
        dodgeAwarded: false,
        hitPlayer: false,
        age: 0,
        life: random(settings.minLife, settings.maxLife)
      });
    }

    function chooseBugType(phase) {
      if (phase === 1) return "standard";

      const roll = Math.random();
      if (phase === 2) {
        if (roll < 0.58) return "standard";
        if (roll < 0.84) return "sprinter";
        return "hunter";
      }

      if (roll < 0.4) return "standard";
      if (roll < 0.7) return "sprinter";
      return "hunter";
    }

    function getDifficulty() {
      const survivalTime = Math.max(0, GAME_SECONDS - timeLeft);
      return difficultyStages.reduce(
        (current, stage) => survivalTime >= stage.startsAt ? stage : current,
        difficultyStages[0]
      );
    }

    function updateDifficultyFeedback() {
      const difficulty = getDifficulty();
      ui.stage.dataset.difficultyPhase = String(difficulty.phase);

      if (difficulty.phase <= lastDifficultyPhase) return;

      lastDifficultyPhase = difficulty.phase;
      showToast(difficulty.message, true);
      playAchievementSound();
      burst(gina.x, gina.y, difficulty.phase === 3 ? "#ef4057" : "#ff8a3d", 20);
    }

    function findSafeSpawnPosition({
      radius,
      minY,
      playerClearance,
      entities,
      entityClearance
    }) {
      let bestPosition = { x: radius + 16, y: minY };
      let bestClearance = -Infinity;

      for (let attempt = 0; attempt < 40; attempt += 1) {
        const candidate = {
          x: random(radius + 16, WIDTH - radius - 16),
          y: random(minY, HEIGHT - radius - 16),
          r: radius
        };
        const distanceFromPlayer = distance(gina, candidate) - gina.r - radius;
        const distanceFromEntities = entities.length
          ? Math.min(...entities.map((entity) => distance(entity, candidate) - entity.r - radius))
          : Infinity;
        const clearance = Math.min(
          distanceFromPlayer - playerClearance,
          distanceFromEntities - entityClearance
        );

        if (clearance >= 0) return candidate;

        if (clearance > bestClearance) {
          bestClearance = clearance;
          bestPosition = candidate;
        }
      }

      return bestPosition;
    }

    function burst(x, y, color, amount) {
      for (let i = 0; i < amount; i++) {
        const angle = random(0, Math.PI * 2);
        const speed = random(35, 130);
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 20,
          size: random(2.5, 6),
          color,
          life: random(0.35, 0.8),
          maxLife: 0.8
        });
      }
    }

    function createStars() {
      starsFar = Array.from({ length: 70 }, () => ({
        x: random(0, WIDTH),
        y: random(0, HEIGHT),
        r: random(0.8, 1.8),
        speed: random(4, 10)
      }));

      starsMid = Array.from({ length: 52 }, () => ({
        x: random(0, WIDTH),
        y: random(0, HEIGHT),
        r: random(1, 2.4),
        speed: random(8, 16)
      }));

      starsNear = Array.from({ length: 38 }, () => ({
        x: random(0, WIDTH),
        y: random(0, HEIGHT),
        r: random(1.4, 3.2),
        speed: random(12, 25)
      }));
    }

    function draw() {
      drawBackground();
      drawItems();
      drawBugs();
      drawParticles();
      drawScorePopups();
      drawGina();
      drawSparkles();

      if (state === "paused") {
        drawPausedTint();
      }
    }

    function drawBackground() {
      const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      sky.addColorStop(0, "#111b35");
      sky.addColorStop(0.58, "#1b2640");
      sky.addColorStop(1, "#3a251e");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      drawStarLayer(starsFar, 0.45);
      drawStarLayer(starsMid, 0.6);
      drawStarLayer(starsNear, 0.8);

      const aurora = ctx.createRadialGradient(WIDTH * 0.18, HEIGHT * 0.22, 20, WIDTH * 0.18, HEIGHT * 0.22, 280);
      aurora.addColorStop(0, "rgba(72, 214, 255, 0.18)");
      aurora.addColorStop(1, "rgba(72, 214, 255, 0)");
      ctx.fillStyle = aurora;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.fillStyle = "rgba(126, 75, 39, 0.38)";
      ctx.fillRect(0, HEIGHT - 86, WIDTH, 86);
      ctx.fillStyle = "rgba(255, 213, 111, 0.16)";
      ctx.beginPath();
      ctx.ellipse(WIDTH * 0.72, HEIGHT - 92, 170, 26, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawStarLayer(stars, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      stars.forEach((star) => {
        const y = (star.y + elapsed * star.speed) % HEIGHT;
        const shimmer = 0.65 + Math.sin(elapsed * 2 + star.x) * 0.25;
        ctx.fillStyle = `rgba(255, 245, 194, ${shimmer})`;
        ctx.beginPath();
        ctx.arc(star.x, y, star.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    function drawGina() {
      const blink = gina.invincible > 0 && Math.floor(gina.invincible * 13) % 2 === 0;
      if (blink) return;

      if (ginaSprite.complete && ginaSprite.naturalWidth > 0) {
        const floatY = Math.sin(elapsed * 2.05) * 6;
        const breathe = 1 + Math.sin(elapsed * 2.2) * 0.012;
        const spriteHeight = 136;
        const spriteWidth = spriteHeight * (ginaSprite.naturalWidth / ginaSprite.naturalHeight);

        ctx.save();
        ctx.translate(gina.x, gina.y + floatY);

        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = "#071525";
        ctx.beginPath();
        ctx.ellipse(4, 68 - floatY * 0.35, 43, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.scale(breathe, 1 / breathe);
        ctx.shadowColor = "rgba(74, 214, 255, 0.55)";
        ctx.shadowBlur = 16;
        ctx.drawImage(ginaSprite, -spriteWidth / 2, -72, spriteWidth, spriteHeight);
        ctx.restore();
        return;
      }

      ctx.save();
      const floatY = Math.sin(elapsed * 2.05) * 6;
      const breathe = Math.sin(elapsed * 2.2) * 0.016;
      const haloPulse = 1 + Math.sin(elapsed * 4.1) * 0.055;
      ctx.translate(gina.x, gina.y + floatY);

      // Soft contact shadow and layered glow keep Gina readable over the moving background.
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = "#071525";
      ctx.beginPath();
      ctx.ellipse(5, 70 - floatY * 0.35, 46, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const glow = ctx.createRadialGradient(0, 0, 6, 0, 7, 110);
      glow.addColorStop(0, "rgba(142, 239, 255, 0.92)");
      glow.addColorStop(0.38, "rgba(80, 211, 255, 0.32)");
      glow.addColorStop(0.66, "rgba(255, 213, 111, 0.17)");
      glow.addColorStop(1, "rgba(255, 213, 111, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 5, 116, 0, Math.PI * 2);
      ctx.fill();

      const wingOpen = Math.sin(gina.wingPhase) * 0.14 + Math.sin(elapsed * 3.3) * 0.035;
      drawWing(-39, 1, -1, wingOpen);
      drawWing(39, 1, 1, wingOpen);

      ctx.save();
      ctx.scale(1 + breathe, 1 - breathe * 0.5);

      const body = ctx.createRadialGradient(-18, -30, 8, 4, 18, 78);
      body.addColorStop(0, "#d9ffff");
      body.addColorStop(0.34, "#8ff1ff");
      body.addColorStop(0.72, "#35c9f4");
      body.addColorStop(1, "#18a9e3");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.moveTo(-39, -7);
      ctx.bezierCurveTo(-39, -47, 39, -48, 41, -8);
      ctx.bezierCurveTo(44, 18, 34, 49, 10, 58);
      ctx.bezierCurveTo(-18, 68, -39, 47, -40, 19);
      ctx.bezierCurveTo(-41, 8, -40, 0, -39, -7);
      ctx.fill();

      // Small friendly curl keeps the angel/ghost silhouette without making Gina spooky.
      const tail = ctx.createLinearGradient(10, 44, 48, 61);
      tail.addColorStop(0, "#28bff0");
      tail.addColorStop(1, "#94f5ff");
      ctx.fillStyle = tail;
      ctx.beginPath();
      ctx.moveTo(13, 45);
      ctx.bezierCurveTo(32, 45, 39, 54, 49, 55);
      ctx.bezierCurveTo(42, 64, 29, 59, 20, 55);
      ctx.bezierCurveTo(15, 53, 11, 52, 7, 51);
      ctx.fill();

      ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
      ctx.beginPath();
      ctx.ellipse(-13, -23, 15, 25, -0.45, 0, Math.PI * 2);
      ctx.fill();

      drawArm(-28, 15, -0.38);
      drawArm(29, 16, 0.42);

      // Big glossy eyes, brows and cheeks mirror the provided Gina reference.
      ctx.fillStyle = "#082346";
      ctx.beginPath();
      ctx.ellipse(-14, -12, 8.8, 12.5, 0.04, 0, Math.PI * 2);
      ctx.ellipse(15, -12, 8.8, 12.5, -0.04, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#0d65b6";
      ctx.beginPath();
      ctx.ellipse(-11.7, -8.8, 4.4, 6.2, 0.08, 0, Math.PI * 2);
      ctx.ellipse(17.3, -8.8, 4.4, 6.2, -0.08, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(-17, -18, 3.3, 0, Math.PI * 2);
      ctx.arc(12, -18, 3.3, 0, Math.PI * 2);
      ctx.arc(-11, -7, 1.25, 0, Math.PI * 2);
      ctx.arc(18, -7, 1.25, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#199bdf";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-24, -28);
      ctx.quadraticCurveTo(-17, -33, -9, -29);
      ctx.moveTo(9, -29);
      ctx.quadraticCurveTo(18, -33, 26, -27);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 139, 177, 0.36)";
      ctx.beginPath();
      ctx.ellipse(-25, 2, 6.2, 3.5, -0.12, 0, Math.PI * 2);
      ctx.ellipse(26, 2, 6.2, 3.5, 0.12, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#075d9d";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(1, 6, 14, 0.18, Math.PI - 0.18);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.beginPath();
      ctx.ellipse(-5, 25, 10, 4, -0.05, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(7, 102, 184, 0.58)";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Gina", -1, 37);

      ctx.restore();

      // The halo is drawn last so its glow stays crisp and close to the reference image.
      ctx.save();
      ctx.scale(haloPulse, 1);
      ctx.strokeStyle = "#ffe88a";
      ctx.lineWidth = 5.2 + Math.sin(elapsed * 5) * 0.55;
      ctx.shadowColor = "#ffd56f";
      ctx.shadowBlur = 22 + Math.sin(elapsed * 4) * 8;
      ctx.beginPath();
      ctx.ellipse(0, -60, 34, 9, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.ellipse(-4, -63, 24, 4.2, -0.02, Math.PI * 1.05, Math.PI * 1.92);
      ctx.stroke();
      ctx.restore();

      ctx.restore();
    }

    function drawWing(x, y, direction, wingOpen) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(direction, 1);
      ctx.rotate(-0.2 - wingOpen);

      ctx.fillStyle = "rgba(255, 255, 255, 0.58)";
      ctx.beginPath();
      ctx.ellipse(4, 9, 20, 35, -0.72, 0, Math.PI * 2);
      ctx.fill();

      const feathers = [
        { x: -3, y: -11, rx: 9, ry: 28, rot: -0.54, alpha: 0.95 },
        { x: 8, y: -2, rx: 10, ry: 33, rot: -0.72, alpha: 0.9 },
        { x: 19, y: 8, rx: 9, ry: 28, rot: -0.88, alpha: 0.86 },
        { x: 27, y: 18, rx: 7, ry: 21, rot: -1.02, alpha: 0.82 },
        { x: 9, y: 17, rx: 7, ry: 18, rot: -0.95, alpha: 0.72 }
      ];

      feathers.forEach((feather) => {
        const gradient = ctx.createLinearGradient(feather.x - 8, feather.y - 20, feather.x + 12, feather.y + 24);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${feather.alpha})`);
        gradient.addColorStop(0.72, `rgba(238, 252, 255, ${feather.alpha * 0.9})`);
        gradient.addColorStop(1, `rgba(151, 223, 255, ${feather.alpha * 0.55})`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(feather.x, feather.y, feather.rx, feather.ry, feather.rot, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.strokeStyle = "rgba(105, 183, 228, 0.28)";
      ctx.lineWidth = 1.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-3, -12);
      ctx.quadraticCurveTo(10, 4, 22, 31);
      ctx.moveTo(8, -5);
      ctx.quadraticCurveTo(18, 9, 28, 27);
      ctx.moveTo(14, 8);
      ctx.quadraticCurveTo(19, 16, 22, 26);
      ctx.stroke();
      ctx.restore();
    }

    function drawArm(x, y, angle) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      const arm = ctx.createLinearGradient(-10, -20, 10, 22);
      arm.addColorStop(0, "#c8fbff");
      arm.addColorStop(0.55, "#74e8ff");
      arm.addColorStop(1, "#31bdec");
      ctx.fillStyle = arm;
      ctx.beginPath();
      ctx.ellipse(0, 0, 11.5, 25, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.beginPath();
      ctx.ellipse(-3, -7, 3.2, 11, -0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawItems() {
      items.forEach((item) => {
        const y = item.y + Math.sin(elapsed * 4 + item.bob) * 4;
        const spin = Math.sin(elapsed * 2.8 + item.spin) * 0.16;
        drawItemAura(item.x, y, item.type);
        if (item.type === "coffee") drawCoffee(item.x, y, spin, false);
        if (item.type === "cookie") drawCookie(item.x, y, spin);
        if (item.type === "chip") drawChip(item.x, y, spin);
        if (item.type === "goldenCoffee") drawCoffee(item.x, y, spin, true);
        if (item.type === "shieldHalo") drawShieldHalo(item.x, y, spin);
        if (item.type === "turboCoffee") drawTurboCoffee(item.x, y, spin);
      });
    }

    function drawItemAura(x, y, type) {
      const aura = {
        coffee: { color: "rgba(247, 241, 231, 0.18)", radius: 25, shape: "circle" },
        cookie: { color: "rgba(231, 168, 88, 0.18)", radius: 25, shape: "circle" },
        chip: { color: "rgba(131, 216, 255, 0.2)", radius: 27, shape: "diamond" },
        goldenCoffee: { color: "rgba(255, 213, 111, 0.32)", radius: 31, shape: "ring" },
        shieldHalo: { color: "rgba(255, 244, 168, 0.3)", radius: 34, shape: "ring" },
        turboCoffee: { color: "rgba(255, 142, 214, 0.24)", radius: 30, shape: "speed" }
      }[type];

      if (!aura) return;

      ctx.save();
      ctx.globalAlpha = 0.85 + Math.sin(elapsed * 5 + x) * 0.15;
      ctx.fillStyle = aura.color;
      ctx.strokeStyle = aura.color.replace("0.", "0.9");
      ctx.lineWidth = 2;

      if (aura.shape === "diamond") {
        ctx.translate(x, y);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-aura.radius * 0.7, -aura.radius * 0.7, aura.radius * 1.4, aura.radius * 1.4);
      } else if (aura.shape === "ring") {
        ctx.beginPath();
        ctx.arc(x, y, aura.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (aura.shape === "speed") {
        ctx.beginPath();
        ctx.ellipse(x - 10, y + 3, aura.radius, aura.radius * 0.55, -0.18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 142, 214, 0.36)";
        ctx.fillRect(x - 43, y + 10, 18, 4);
        ctx.fillRect(x - 39, y - 7, 14, 3);
      } else {
        ctx.beginPath();
        ctx.arc(x, y, aura.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    function drawCoffee(x, y, rotation = 0, golden = false) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.shadowColor = golden ? "#ffd56f" : "transparent";
      ctx.shadowBlur = golden ? 15 : 0;
      ctx.fillStyle = golden ? "#fff7c9" : "#f7f1e7";
      ctx.fillRect(-12, -10, 22, 20);
      ctx.strokeStyle = golden ? "#fff7c9" : "#f7f1e7";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(13, 0, 7, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.fillStyle = golden ? "#b88617" : "#7a3f1f";
      ctx.fillRect(-10, -10, 18, 5);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const steam = Math.sin(elapsed * 6 + x) * 3;
      ctx.moveTo(-5, -16);
      ctx.quadraticCurveTo(-10 + steam, -24, -2, -29);
      ctx.moveTo(6, -16);
      ctx.quadraticCurveTo(1 - steam, -24, 9, -29);
      ctx.stroke();
      ctx.restore();
    }

    function drawCookie(x, y, rotation = 0) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillStyle = "#d9964a";
      ctx.beginPath();
      ctx.arc(0, 0, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#6d3c22";
      [[-7, -4], [4, -8], [8, 6], [-3, 7]].forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    function drawChip(x, y, rotation = 0) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillStyle = "#83d8ff";
      ctx.fillRect(-15, -15, 30, 30);
      ctx.fillStyle = "#15344d";
      ctx.font = "bold 11px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("CPU", 0, 1);
      ctx.fillStyle = "#ffd56f";
      for (let i = -2; i <= 2; i++) {
        ctx.fillRect(i * 6 - 1, -20, 2, 5);
        ctx.fillRect(i * 6 - 1, 15, 2, 5);
        ctx.fillRect(-20, i * 6 - 1, 5, 2);
        ctx.fillRect(15, i * 6 - 1, 5, 2);
      }
      ctx.restore();
    }

    function drawShieldHalo(x, y, rotation = 0) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.strokeStyle = "#fff4a8";
      ctx.lineWidth = 6;
      ctx.shadowColor = "#ffd56f";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.ellipse(0, 0, 23, 10, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    function drawTurboCoffee(x, y, rotation = 0) {
      drawCoffee(x, y, rotation, false);
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = "#ff8ed6";
      ctx.beginPath();
      ctx.moveTo(-25, 9);
      ctx.lineTo(-38, 16);
      ctx.lineTo(-25, 20);
      ctx.moveTo(24, 9);
      ctx.lineTo(39, 16);
      ctx.lineTo(24, 20);
      ctx.fill();
      ctx.restore();
    }

    function drawBugs() {
      bugs.forEach((bug) => {
        const settings = bugTypes[bug.type] || bugTypes.standard;
        const scale = bug.r / bugTypes.standard.radius;
        const bodyWidth = 36 * scale;
        const bodyHeight = 30 * scale;

        ctx.save();
        ctx.translate(bug.x, bug.y);
        ctx.rotate(Math.atan2(bug.vy, bug.vx) + Math.sin(bug.spin) * 0.12);

        if (bug.type === "sprinter") {
          ctx.strokeStyle = "rgba(255, 213, 111, 0.72)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-bodyWidth / 2 - 8, -7);
          ctx.lineTo(-bodyWidth / 2 - 24, -7);
          ctx.moveTo(-bodyWidth / 2 - 8, 7);
          ctx.lineTo(-bodyWidth / 2 - 30, 7);
          ctx.stroke();
        }

        ctx.shadowColor = settings.glow;
        ctx.shadowBlur = 18;
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = settings.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, 32 * scale, 25 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 10;
        ctx.fillStyle = settings.color;
        ctx.fillRect(-bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight);
        ctx.shadowBlur = 0;

        if (bug.type === "hunter") {
          ctx.fillStyle = "#f7f1ff";
          ctx.beginPath();
          ctx.arc(4 * scale, 0, 7 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#30134f";
          ctx.beginPath();
          ctx.arc(7 * scale, 0, 3 * scale, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = bug.type === "sprinter" ? "#74300d" : "#68131f";
          ctx.fillRect(-12 * scale, -8 * scale, 24 * scale, 5 * scale);
          ctx.fillRect(-12 * scale, 3 * scale, 24 * scale, 5 * scale);
        }

        ctx.strokeStyle = bug.type === "hunter" ? "#e1c8ff" : "#ffcfb9";
        ctx.lineWidth = Math.max(2, 2 * scale);
        ctx.beginPath();
        ctx.moveTo(-12 * scale, -15 * scale);
        ctx.lineTo(-20 * scale, -25 * scale);
        ctx.moveTo(12 * scale, -15 * scale);
        ctx.lineTo(20 * scale, -25 * scale);
        ctx.moveTo(-16 * scale, 10 * scale);
        ctx.lineTo(-26 * scale, 18 * scale);
        ctx.moveTo(16 * scale, 10 * scale);
        ctx.lineTo(26 * scale, 18 * scale);
        ctx.stroke();
        ctx.restore();
      });
    }

    function drawParticles() {
      particles.forEach((particle) => {
        const alpha = Math.max(0, particle.life / particle.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    function drawScorePopups() {
      scorePopups.forEach((popup) => {
        const progress = 1 - popup.life / popup.maxLife;
        const alpha = Math.max(0, popup.life / popup.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = "900 24px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 5;
        ctx.strokeStyle = "rgba(11, 17, 31, 0.72)";
        ctx.fillStyle = progress < 0.2 ? "#fff7c9" : "#ffd56f";
        ctx.strokeText(`+${popup.value}`, popup.x, popup.y);
        ctx.fillText(`+${popup.value}`, popup.x, popup.y);
        ctx.restore();
      });
    }

    function drawSparkles() {
      ginaSparkles.forEach((sparkle) => {
        const alpha = Math.max(0, sparkle.life / sparkle.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = activePowerups.shield > 0 ? "#fff4a8" : "#b9f4ff";
        ctx.beginPath();
        ctx.arc(sparkle.x, sparkle.y, sparkle.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    function drawPausedTint() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }

    function createEmptyStats() {
      return {
        coffee: 0,
        cookies: 0,
        chips: 0,
        bugsAvoided: 0,
        survivalTime: 0,
        bestCombo: 0,
        nearMisses: 0
      };
    }

    function registerCombo(x, y) {
      comboCount = comboTimer > 0 ? comboCount + 1 : 1;
      comboTimer = COMBO_SECONDS;
      stats.bestCombo = Math.max(stats.bestCombo, comboCount);

      if (comboCount < 3) return 0;

      const bonus = comboCount * 5;
      showToast(`Combo x${comboCount}! +${bonus}`, false);
      burst(x, y, "#ffd56f", Math.min(18, comboCount + 8));
      return bonus;
    }

    function showScorePopup(x, y, value) {
      scorePopups.push({
        x,
        y: y - 18,
        value,
        life: 0.85,
        maxLife: 0.85
      });
    }

    function checkNewHighscore() {
      if (newHighscoreAnnounced || score <= highscore) return;

      newHighscoreAnnounced = true;
      showToast("Neuer Highscore!", true);
      playAchievementSound();
      ui.stage.classList.remove("new-highscore");
      void ui.stage.offsetWidth;
      ui.stage.classList.add("new-highscore");

      setTimeout(() => {
        ui.stage.classList.remove("new-highscore");
      }, 1600);
    }

    function loadHighscore() {
      const storedHighscore = parseStoredHighscore(localStorage.getItem(STORAGE_KEY));
      const legacyHighscore = Math.max(
        ...LEGACY_HIGHSCORE_KEYS.map((key) => parseStoredHighscore(localStorage.getItem(key)))
      );
      const bestHighscore = Math.max(storedHighscore, legacyHighscore);

      if (bestHighscore > storedHighscore) {
        localStorage.setItem(STORAGE_KEY, String(bestHighscore));
      }

      return bestHighscore;
    }

    function parseStoredHighscore(value) {
      if (value === null) return 0;
      const parsedValue = Number(value);
      return Number.isFinite(parsedValue) && parsedValue > 0 ? Math.floor(parsedValue) : 0;
    }

    function getMedalForScore(scoreValue) {
      const safeScore = Number.isFinite(scoreValue) ? Math.max(0, Math.floor(scoreValue)) : 0;
      return medals.reduce((best, medal) => safeScore >= medal.minScore ? medal : best, medals[0]);
    }

    function loadBestMedal() {
      const storedScore = parseStoredHighscore(localStorage.getItem(BEST_MEDAL_KEY));
      return getMedalForScore(storedScore);
    }

    function updateBestMedal(scoreValue) {
      const earnedMedal = getMedalForScore(scoreValue);

      if (earnedMedal.minScore > bestMedal.minScore) {
        bestMedal = earnedMedal;
        localStorage.setItem(BEST_MEDAL_KEY, String(earnedMedal.minScore));
      }

      renderBestMedal();
      return earnedMedal;
    }

    function renderBestMedal() {
      if (ui.sideBestMedalValue) ui.sideBestMedalValue.textContent = formatMedal(bestMedal);
    }

    function formatMedal(medal) {
      return `${medal.emoji} ${medal.title}`;
    }

    function saveHighscore() {
      if (score > highscore) {
        highscore = score;
        localStorage.setItem(STORAGE_KEY, String(highscore));
      }
      updateHighscoreDisplay();
    }

    function resetHighscore() {
      highscore = 0;
      localStorage.removeItem(STORAGE_KEY);
      LEGACY_HIGHSCORE_KEYS.forEach((key) => localStorage.removeItem(key));
      updateHighscoreDisplay();
      ui.finalHighscore.textContent = "Highscore: 0";
      showToast("Highscore gelöscht.", false);
    }

    function updateHighscoreDisplay() {
      if (ui.sideHighscoreValue) ui.sideHighscoreValue.textContent = `${highscore} Punkte`;
      renderBestMedal();
    }

    function loadAchievements() {
      try {
        return JSON.parse(localStorage.getItem(ACHIEVEMENT_KEY) || "{}");
      } catch (error) {
        return {};
      }
    }

    function saveAchievements() {
      localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(unlockedAchievements));
    }

    function resetAchievements() {
      unlockedAchievements = {};
      localStorage.removeItem(ACHIEVEMENT_KEY);
      renderAchievementOverview();
      showToast("Achievements zurückgesetzt.", false);
    }

    function checkAchievements() {
      Object.entries(achievements).forEach(([key, achievement]) => {
        if (!unlockedAchievements[key] && achievement.done()) {
          unlockedAchievements[key] = true;
          saveAchievements();
          renderAchievementOverview();
          showToast(`Achievement: ${achievement.title}`, true);
          playAchievementSound();
        }
      });
    }

    function showToast(text, achievement = false) {
      const toast = document.createElement("div");
      toast.className = achievement ? "toast achievement" : "toast";
      toast.textContent = text;
      ui.toastStack.appendChild(toast);

      setTimeout(() => {
        toast.remove();
      }, achievement ? 3600 : 2400);
    }

    function maybeShowFunnyMessage() {
      if (messageTimer > 0) return;
      messageTimer = random(6, 10);
      showToast(funnyMessages[Math.floor(Math.random() * funnyMessages.length)], false);
    }

    function toggleMusic() {
      ensureAudio();
      audio.musicOn = !audio.musicOn;
      if (audio.musicOn) {
        startMusic();
      } else {
        stopMusic();
      }
      updateMusicButtons();
    }

    function updateMusicButtons() {
      ui.musicButton.textContent = audio.musicOn ? "♪ An" : "♪ Aus";
      ui.startMusicButton.textContent = audio.musicOn ? "Musik aus" : "Musik an";
    }

    function ensureAudio() {
      if (!audio.context) {
        audio.context = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audio.context.state === "suspended") {
        audio.context.resume();
      }
    }

    function playTone(frequency, duration, type, volume, whenOffset = 0) {
      if (!audio.context) return;
      const now = audio.context.currentTime + whenOffset;
      const oscillator = audio.context.createOscillator();
      const gain = audio.context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain).connect(audio.context.destination);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.02);
    }

    function playCollectSound(type) {
      ensureAudio();
      const base = type === "chip" ? 720 : type === "cookie" ? 560 : 440;
      playTone(base, 0.11, "sine", 0.08);
      playTone(base * 1.5, 0.08, "triangle", 0.045, 0.055);
    }

    function playBugSound() {
      ensureAudio();
      playTone(160, 0.12, "square", 0.07);
      playTone(95, 0.18, "sawtooth", 0.045, 0.08);
    }

    function playAchievementSound() {
      ensureAudio();
      playTone(523, 0.11, "triangle", 0.055);
      playTone(659, 0.12, "triangle", 0.05, 0.1);
      playTone(784, 0.16, "sine", 0.045, 0.22);
    }

    function startMusic() {
      stopMusic();
      audio.beat = 0;
      audio.musicTimer = setInterval(() => {
        if (!audio.musicOn || !audio.context) return;
        const notes = [220, 277, 330, 277];
        const note = notes[audio.beat % notes.length];
        playTone(note, 0.16, "sine", 0.025);
        if (audio.beat % 2 === 0) playTone(note / 2, 0.2, "triangle", 0.018);
        audio.beat += 1;
      }, 420);
    }

    function stopMusic() {
      clearInterval(audio.musicTimer);
      audio.musicTimer = null;
    }

    function distance(a, b) {
      return Math.hypot(a.x - b.x, a.y - b.y);
    }

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function random(min, max) {
      return Math.random() * (max - min) + min;
    }

    requestAnimationFrame((now) => {
      lastFrame = now;
      gameLoop(now);
    });
