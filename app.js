const form = document.querySelector("#planner-form");
const planTitle = document.querySelector("#plan-title");
const metrics = document.querySelector("#metrics");
const timeline = document.querySelector("#timeline");
const kit = document.querySelector("#kit");
const copyButton = document.querySelector("#copy-button");
const resetButton = document.querySelector("#reset-button");

const templates = {
  maintain: {
    trainingDays: 3,
    focus: "strength maintenance",
    note: "Keep intensity crisp, stop every main set with one or two reps in reserve.",
  },
  cut: {
    trainingDays: 4,
    focus: "lean travel rhythm",
    note: "Pair short circuits with long walks and keep meals simple around protein.",
  },
  recover: {
    trainingDays: 2,
    focus: "joint-friendly recovery",
    note: "Use mobility, sleep, and nasal-breathing walks as the main performance lever.",
  },
  explore: {
    trainingDays: 2,
    focus: "sightseeing endurance",
    note: "Protect legs early so the best city days do not feel like punishment.",
  },
};

const movements = {
  bodyweight: ["split squat", "push-up", "tempo squat", "side plank"],
  bands: ["band row", "band press", "face pull", "band good morning"],
  dumbbells: ["goblet squat", "one-arm row", "floor press", "suitcase carry"],
  hotel_gym: ["leg press", "lat pulldown", "incline press", "bike intervals"],
};

const recoveryBlocks = [
  "10-minute hip and ankle reset",
  "easy walk after breakfast",
  "calves, hamstrings, and thoracic mobility",
  "early bedtime target with phone parked away",
];

function getFormState() {
  const data = new FormData(form);
  const equipment = data.getAll("equipment");

  return {
    destination: String(data.get("destination") || "Your trip").trim(),
    days: Number(data.get("days") || 1),
    goal: String(data.get("goal") || "maintain"),
    walking: Number(data.get("walking") || 3),
    equipment: equipment.length ? equipment : ["bodyweight"],
  };
}

function clampDays(days) {
  return Math.min(Math.max(days, 1), 21);
}

function getTrainingDays(state) {
  const base = templates[state.goal].trainingDays;
  const walkingPenalty = state.walking >= 4 ? 1 : 0;
  const tripLimit = state.days <= 3 ? 1 : state.days <= 6 ? 3 : 5;
  return Math.max(1, Math.min(base - walkingPenalty, tripLimit));
}

function chooseMovements(equipment) {
  const pool = equipment.flatMap((item) => movements[item] || []);
  return [...new Set(pool)].slice(0, 6);
}

function buildPlan(state) {
  const days = clampDays(state.days);
  const profile = templates[state.goal];
  const trainingDays = getTrainingDays({ ...state, days });
  const movementPool = chooseMovements(state.equipment);
  const trainingSlots = new Set();

  for (let index = 0; index < trainingDays; index += 1) {
    const slot = Math.round(1 + (index * (days - 1)) / Math.max(trainingDays - 1, 1));
    trainingSlots.add(slot);
  }

  const schedule = Array.from({ length: days }, (_, index) => {
    const day = index + 1;
    const isTraining = trainingSlots.has(day);
    const movementStart = (index * 2) % movementPool.length;
    const selected = [
      movementPool[movementStart],
      movementPool[(movementStart + 1) % movementPool.length],
      movementPool[(movementStart + 2) % movementPool.length],
    ].filter(Boolean);

    if (isTraining) {
      return {
        day,
        title: `Compact ${profile.focus} session`,
        detail: "30 to 42 minutes. Warm up slowly, then keep the work clean and repeatable.",
        bullets: selected.map((move) => `${move}: 3 sets at controlled tempo`),
      };
    }

    return {
      day,
      title: "Explore and restore",
      detail: "Let walking carry the conditioning load. Keep recovery visible, not optional.",
      bullets: [
        recoveryBlocks[index % recoveryBlocks.length],
        state.walking >= 4 ? "feet-up reset before dinner" : "15-minute optional easy walk",
      ],
    };
  });

  return {
    title: `${state.destination} ${profile.focus} plan`,
    metrics: [
      ["sessions", String(trainingDays)],
      ["days", String(days)],
      ["walking load", `${state.walking}/5`],
    ],
    schedule,
    kit: [
      "flat resistance band",
      "one quick-dry training shirt",
      "small notebook or notes app for sets",
      state.walking >= 4 ? "extra socks for long walking days" : "light snack for post-session recovery",
    ],
    note: profile.note,
  };
}

function renderPlan(plan) {
  planTitle.textContent = plan.title;

  metrics.innerHTML = plan.metrics
    .map(
      ([label, value]) => `
        <article class="metric">
          <span>${label}</span>
          <strong>${value}</strong>
        </article>
      `,
    )
    .join("");

  timeline.innerHTML = plan.schedule
    .map(
      (day) => `
        <article class="day-card">
          <div class="day-card__stamp">${day.day}</div>
          <div>
            <h3>${day.title}</h3>
            <p>${day.detail}</p>
            <ul>
              ${day.bullets.map((item) => `<li>${item}</li>`).join("")}
            </ul>
          </div>
        </article>
      `,
    )
    .join("");

  kit.innerHTML = `
    <h3>Carry kit and guardrail</h3>
    <p>${plan.note}</p>
    <ul>
      ${plan.kit.map((item) => `<li>${item}</li>`).join("")}
    </ul>
  `;
}

function saveState(state) {
  localStorage.setItem("nomad-lift-planner", JSON.stringify(state));
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem("nomad-lift-planner"));
  } catch {
    return null;
  }
}

function applyState(state) {
  if (!state) return;

  form.destination.value = state.destination;
  form.days.value = state.days;
  form.goal.value = state.goal;
  form.walking.value = state.walking;
  form.querySelectorAll("[name='equipment']").forEach((input) => {
    input.checked = state.equipment.includes(input.value);
  });
}

function getSummaryText() {
  const cards = [...timeline.querySelectorAll(".day-card")].map((card) =>
    card.innerText.replace(/\n+/g, " ").trim(),
  );
  return `${planTitle.textContent}\n\n${cards.join("\n")}`;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const state = getFormState();
  saveState(state);
  renderPlan(buildPlan(state));
});

copyButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(getSummaryText());
  copyButton.textContent = "Copied";
  window.setTimeout(() => {
    copyButton.textContent = "Copy summary";
  }, 1300);
});

resetButton.addEventListener("click", () => {
  localStorage.removeItem("nomad-lift-planner");
  form.reset();
  const state = getFormState();
  renderPlan(buildPlan(state));
});

const initialState = loadState() || getFormState();
applyState(initialState);
renderPlan(buildPlan(initialState));
