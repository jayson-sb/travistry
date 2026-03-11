export type PromptCategory =
  | "Itinerary"
  | "Stays"
  | "Food & Drink"
  | "Routes"
  | "Discovery"
  | "Smart Planning";

export type PromptVariable = {
  key: string;
  label: string;
  placeholder?: string;
  example?: string;
};

export type PromptEntry = {
  id: string;
  slug?: string;
  title: string;
  summary: string;
  category: PromptCategory;
  intent?: string;
  purpose?: string;
  tags: string[];
  promptTemplate: string;
  variables?: PromptVariable[];
  whenToUse?: string[];
};

const ROLE_BY_CATEGORY: Record<PromptCategory, string> = {
  Itinerary:
    "You are a world-class travel planner who designs realistic, minute-by-minute itineraries travelers can actually follow — with real place names, transit details, and smart timing.",
  Stays:
    "You are a local area expert who knows the character, tradeoffs, and hidden details of every district — the kind of advice a resident friend would give.",
  "Food & Drink":
    "You are a food-obsessed travel guide who knows the stalls, markets, and restaurants locals swear by — not the tourist-friendly places with menus in five languages.",
  Routes:
    "You are a route-planning specialist who builds transit-aware, walking-friendly itineraries that respect opening hours, crowd patterns, and real-world logistics.",
  Discovery:
    "You are a well-traveled insider who finds the hidden gems, local rituals, and off-guidebook experiences that turn a trip into a story worth telling.",
  "Smart Planning":
    "You are a sharp travel strategist who helps travelers make confident decisions — comparing options, building budgets, and handling logistics with clear tradeoffs.",
};

export const buildPreamble = (prompt: PromptEntry): string => {
  const role = ROLE_BY_CATEGORY[prompt.category];
  const isComparison = prompt.intent === "comparison";

  const outputInstruction = isComparison
    ? "Output format: Respond in plain, readable text with markdown headings and bullet points — not JSON, code blocks, or raw data. Lead with your #1 recommendation and why. Then a compact comparison table. Then the key decision thresholds (\"choose the other option if…\")."
    : prompt.intent === "checklist"
      ? "Output format: Respond in plain, readable text with markdown headings and bullet points — not JSON, code blocks, or raw data. Lead with the most important actions first. Then a structured, actionable checklist. Flag deadlines and sequence-dependent items."
      : "Output format: Respond in plain, readable text with markdown headings and bullet points — not JSON, code blocks, or raw data. Lead with the key recommendation or plan. Then the full detailed breakdown. Be specific — real names, times, costs, and directions.";

  return [
    role,
    "",
    "Before answering:",
    "- Draw on any memory or prior context you have about me — my travel style, home base, budget, or past trips — to personalize your response.",
    "- If critical details are missing, ask only your 3–5 most essential clarifying questions in a single message — prioritise the ones that would most change the output. Do not ask for information you can reasonably assume. Once I respond, generate the full plan without further questions.",
    "- Anything in square brackets in ALL CAPS (e.g. [DESTINATION]) is an unfilled placeholder — include it in your questions only if it's essential to the output.",
    "- If you reference prices, hours, or availability, note they may change and briefly suggest how I can verify.",
    "- Your training data has a cutoff date. For any specific business, price, or schedule you mention, flag it with [verify] and suggest how to check (e.g. Google Maps, official site, recent reviews).",
    "- Prefer specific, named places over generic descriptions. If you can't name a specific place with confidence, say so rather than inventing one.",
    "- Where costs or bookings are involved, naturally factor in practical ways to optimise for value — timing, platform comparisons, or common money-saving moves relevant to this trip.",
    "",
    outputInstruction,
  ].join("\n");
};

export const categories: PromptCategory[] = [
  "Itinerary",
  "Smart Planning",
  "Stays",
  "Food & Drink",
  "Routes",
  "Discovery",
];

export const promptLibrary: PromptEntry[] = [
  // ── Itinerary ─────────────────────────────────────────────────────────
  {
    id: "trip-itinerary-builder",
    slug: "trip-itinerary-builder",
    title: "Build a day-by-day trip itinerary",
    summary:
      "You already know where you're going — turn that into a detailed, hour-by-hour plan with transit, meal stops, and backup options.",
    category: "Itinerary",
    intent: "planning",
    purpose:
      "For travelers who've picked a destination and need the logistics nailed: realistic time blocks, walking/transit connections, neighborhood grouping, and backup options for closures or weather.",
    tags: ["itinerary", "day-by-day", "planning", "trip"],
    variables: [
      { key: "destination", label: "Destination city", placeholder: "e.g. Osaka", example: "Osaka" },
      { key: "days", label: "Number of days", placeholder: "e.g. 3 / 5 / 10", example: "5" },
      { key: "vibe", label: "Trip vibe", placeholder: "e.g. culture + street food / adventure / relaxed", example: "culture + street food" },
      { key: "travel_party", label: "Travel party", placeholder: "solo / couple / family / friends", example: "couple" },
      { key: "month", label: "Travel month", placeholder: "e.g. November", example: "November" },
    ],
    whenToUse: [
      "When you've already chosen your destination and need the detailed day-by-day logistics",
      "When you want a plan you can actually follow — timed slots, transit, and backup options",
      "When you've been before (or done your research) and just need the schedule built",
    ],
    promptTemplate: `I'm planning a trip to [DESTINATION] for [DAYS] days in [MONTH]. I'm traveling as a [TRAVEL_PARTY] and the vibe I want is: [VIBE].

If any detail above is missing, ask all your clarifying questions in one go before generating.

Build a day-by-day itinerary:

1. DAY-BY-DAY PLAN: For each day, create time-blocked slots (morning, midday, afternoon, evening). For each slot include:
   - What to do and why it's worth the time
   - Approximate duration at each stop
   - How to get to the next stop (walking time, transit line, or taxi estimate)
   - One backup option in case it's closed or too crowded
   - Flag any tricky opening hours, closure days, or ticket-only entry inline with the relevant stop

2. NEIGHBORHOOD FLOW: Group activities by neighborhood so I'm not zigzagging across the city. Explain the logical flow.

3. MEALS: Suggest specific meal spots (or street food areas) that fit naturally into the route. Include what they're known for.

4. EVENING OPTIONS: For each night, suggest 2 options (one low-key, one more active) based on energy levels after a full day.

Format the plan so I can screenshot each day and use it as a walking guide.

For every specific place you recommend, include one way I can verify it's still open/accurate (e.g. Google Maps search term, official website, or "search for [X] on [platform]").`,
  },
  {
    id: "first-time-city-plan",
    slug: "first-time-city-plan",
    title: "First-time visitor: complete city plan",
    summary:
      "Never been? Get the orientation a local friend would give you — what to prioritize, what to skip, and a plan that balances must-sees with real local life.",
    category: "Itinerary",
    intent: "planning",
    purpose:
      "Gives first-time visitors the cultural briefing, must-see vs skip assessment, and practical logistics that bridge the gap between 'I've never been' and 'I feel confident going.'",
    tags: ["first-time", "city plan", "must-see", "comprehensive"],
    variables: [
      { key: "destination", label: "Destination city", placeholder: "e.g. Tokyo", example: "Tokyo" },
      { key: "days", label: "Number of days", placeholder: "e.g. 5", example: "5" },
      { key: "travel_party", label: "Travel party", placeholder: "solo / couple / family / friends", example: "friends" },
      { key: "interests", label: "Top interests", placeholder: "e.g. food, temples, nightlife, shopping", example: "food, temples, nightlife" },
      { key: "month", label: "Travel month", placeholder: "e.g. March", example: "March" },
    ],
    whenToUse: [
      "When it's your first time visiting and you don't know what to expect",
      "When you need to understand the city layout, norms, and what's actually worth the hype",
      "When you want orientation + itinerary together (not just a schedule)",
    ],
    promptTemplate: `I'm visiting [DESTINATION] for the first time — [DAYS] days in [MONTH]. I'm traveling as a [TRAVEL_PARTY] and my top interests are: [INTERESTS].

Create a complete first-timer city plan:

1. ORIENTATION BRIEFING: In 4–5 bullet points, give me the local knowledge a friend who lives there would share — how the city is laid out, how to get around, cultural norms, tipping, and common first-timer mistakes.

2. DAY-BY-DAY ITINERARY: For each day, provide:
   - A theme (e.g. "Historic core + street food")
   - 3–4 main activities with time estimates
   - Transit/walking between stops
   - Meal recommendations that fit the route
   - One "local secret" that most tourists miss in that area

3. MUST-SEE vs SKIP: List the top attractions and honestly assess which are worth the hype and which are overrated tourist traps. Suggest what to do instead.

4. PRACTICAL LOGISTICS:
   - Best transit pass or card to buy
   - SIM/eSIM recommendation
   - Cash vs card norms
   - Key phrases in the local language
   - Safety notes specific to this city

5. WEATHER-ADJUSTED TIPS: For [MONTH], flag weather considerations and suggest indoor alternatives for rainy/hot days.

6. ONE FREE DAY TEMPLATE: Leave one day as a flexible "choose your own adventure" with 5 options ranked by vibe (relaxed, active, cultural, foodie, off-beat).

For every specific place you recommend, include one way I can verify it's still open/accurate (e.g. Google Maps search term, official website, or "search for [X] on [platform]").`,
  },
  {
    id: "multi-city-route-planner",
    slug: "multi-city-route-planner",
    title: "Multi-city trip: optimal route and timing",
    summary:
      "Plan the best order to visit multiple cities, with realistic transit, timing, and a clear tradeoff analysis.",
    category: "Itinerary",
    intent: "planning",
    purpose:
      "Eliminates backtracking and wasted transit time by finding the optimal city order and allocating the right number of days per stop.",
    tags: ["multi-city", "route", "transit", "optimization"],
    variables: [
      { key: "cities", label: "Cities to visit", placeholder: "e.g. Bangkok, Chiang Mai, Krabi", example: "Bangkok, Chiang Mai, Krabi" },
      { key: "days", label: "Total days available", placeholder: "e.g. 12", example: "12" },
      { key: "travel_party", label: "Travel party", placeholder: "solo / couple / family / friends", example: "couple" },
      { key: "pace", label: "Travel pace", placeholder: "packed / balanced / relaxed", example: "balanced" },
    ],
    whenToUse: [
      "When visiting 3+ cities and unsure of the best order",
      "When you want to minimize wasted transit time",
      "When you need help deciding how many days per city",
    ],
    promptTemplate: `I want to visit these cities: [CITIES]. I have [DAYS] total days, traveling as a [TRAVEL_PARTY], and prefer a [PACE] pace.

Design the optimal multi-city route:

1. RECOMMENDED ORDER: Suggest the best sequence and explain why (geography, flight routes, transit connections, day-of-week considerations).

2. DAYS PER CITY: Allocate days to each city based on what's there vs my pace preference. Explain your reasoning — what would I miss with fewer days, and what's diminishing returns with more?

3. CITY-TO-CITY TRANSIT: For each connection, compare options:
   - Best option (speed + comfort + cost balance)
   - Budget option
   - Approximate cost and travel time for each
   - Book-ahead requirements or tips

4. ARRIVAL/DEPARTURE STRATEGY: For each city, suggest what to do on arrival day (usually a half-day) and how to use the departure day efficiently.

5. ALTERNATIVE ROUTE: Provide one alternative ordering with a clear explanation of what's different (e.g. "if you want to end at a beach" or "if this flight is cheaper").

6. MASTER TIMELINE: A single visual timeline showing Day 1–[DAYS] with city, key activity, and transit legs.`,
  },
  {
    id: "vibes-to-itinerary",
    slug: "vibes-to-itinerary",
    title: "Turn vibes into an itinerary",
    summary:
      "Describe the feeling you want and get a concrete, bookable trip plan — no destination research needed.",
    category: "Itinerary",
    intent: "planning",
    purpose:
      "Bridges the gap between 'I want a trip that feels like…' and a real, actionable itinerary with specific places and timing.",
    tags: ["vibes", "creative", "inspiration", "personalized"],
    variables: [
      { key: "vibe", label: "Describe the vibe you want", placeholder: "e.g. 'cozy cafes, old streets, wine at sunset, no crowds'", example: "cozy cafes, old streets, wine at sunset, no crowds" },
      { key: "days", label: "Number of days", placeholder: "e.g. 5", example: "5" },
      { key: "region", label: "Region or constraints", placeholder: "e.g. Southeast Asia / Europe / anywhere under 6h flight from Singapore", example: "Europe" },
      { key: "budget", label: "Budget level", placeholder: "budget / mid-range / comfort / luxury", example: "mid-range" },
      { key: "month", label: "Travel month", placeholder: "e.g. September", example: "September" },
    ],
    whenToUse: [
      "When you know the feeling you want but not the destination",
      "When you're tired of 'top 10' lists and want something personal",
      "When you want AI to match your mood to a real trip",
    ],
    promptTemplate: `Here's the vibe I want for my next trip: "[VIBE]"

I have [DAYS] days, prefer [REGION], [BUDGET] budget, traveling in [MONTH].

Turn this vibe into a real, bookable itinerary:

1. DESTINATION MATCH: Suggest 3 destinations that match this vibe. For each, give a 2-sentence pitch explaining WHY it fits and one honest caveat.

2. TOP PICK — FULL ITINERARY: For your #1 recommendation, build a complete day-by-day plan:
   - Each day has a theme that feeds the vibe
   - Specific places, neighborhoods, and experiences (not generic "explore the old town")
   - Meal spots that match the mood
   - Best time of day for each activity
   - Transition between activities (walking routes, scenic connections)

3. VIBE PROTECTORS: Things that could kill the vibe (overcrowded spots, tourist traps, bad timing) and how to avoid them.

4. BOOKING ESSENTIALS: The 3–5 things I should book ahead vs what to leave spontaneous.

5. VIBE PLAYLIST: 5 moments that will feel exactly like what I described — the specific "you'll be sitting here, seeing this, feeling that" moments.`,
  },
  {
    id: "rain-proof-backup-plan",
    slug: "rain-proof-backup-plan",
    title: "Make your plan rain-proof",
    summary:
      "Generate a weather-contingency layer for any trip — indoor alternatives, timing shifts, and rainy-day routes.",
    category: "Itinerary",
    intent: "planning",
    purpose:
      "Prevents a rained-out day from ruining the trip by providing pre-planned indoor alternatives that are genuinely enjoyable, not just fallbacks.",
    tags: ["weather", "backup", "rain", "contingency"],
    variables: [
      { key: "destination", label: "Destination city", placeholder: "e.g. Bali", example: "Bali" },
      { key: "month", label: "Travel month", placeholder: "e.g. January", example: "January" },
      { key: "days", label: "Trip length (days)", placeholder: "e.g. 7", example: "7" },
      { key: "interests", label: "Interests", placeholder: "e.g. food, culture, photography", example: "food, culture, photography" },
    ],
    whenToUse: [
      "When traveling during rainy or unpredictable weather season",
      "When you want to avoid losing a full day to bad weather",
      "When you want indoor alternatives that are actually exciting, not filler",
    ],
    promptTemplate: `I'm going to [DESTINATION] for [DAYS] days in [MONTH]. My interests are: [INTERESTS].

Build a weather-contingency plan:

1. WEATHER BRIEFING: What should I realistically expect in [MONTH]? Break it down — how many rainy days, what time rain usually hits, how long it lasts, temperature range.

2. TIMING SHIFTS: Which outdoor activities are better moved to morning vs afternoon based on typical weather patterns? Create an "ideal weather schedule" vs "rainy day schedule."

3. INDOOR ALTERNATIVES MAP: For each major neighborhood I'll visit, list 3–4 genuinely good indoor options:
   - Not just museums — include markets, cooking classes, spas, workshops, cafes worth spending hours in
   - Include approximate cost and time needed
   - Flag which ones need advance booking

4. RAINY DAY FULL ITINERARY: Build one complete "perfect rainy day" plan that's so good I'd almost hope for rain. Include meals.

5. GEAR & LOGISTICS: What to pack and practical rain tips specific to this city (e.g. "taxis are impossible in rain — use this app instead").

6. DECISION RULES: Simple morning check — "If it's raining at 8am, swap Plan A for Plan B" type rules for each day of the trip.`,
  },

  // ── Neighborhoods ─────────────────────────────────────────────────────
  {
    id: "best-area-to-stay",
    slug: "best-area-to-stay",
    title: "Find the best area to stay",
    summary:
      "Compare neighborhoods head-to-head so you pick the area that matches your style, budget, and plans.",
    category: "Stays",
    intent: "comparison",
    purpose:
      "Replaces hours of Reddit/blog research with a structured comparison of neighborhoods based on what actually matters to your trip.",
    tags: ["neighborhoods", "where to stay", "comparison", "accommodation"],
    variables: [
      { key: "destination", label: "Destination city", placeholder: "e.g. Bangkok", example: "Bangkok" },
      { key: "travel_party", label: "Travel party", placeholder: "solo / couple / family / friends", example: "couple" },
      { key: "priorities", label: "What matters most", placeholder: "e.g. walkability, nightlife, food, quiet, central", example: "walkability, food, central" },
      { key: "budget", label: "Nightly accommodation budget", placeholder: "e.g. $80–120/night", example: "$80–120/night" },
      { key: "days", label: "Trip length (days)", placeholder: "e.g. 5", example: "5" },
    ],
    whenToUse: [
      "When you don't know which neighborhood to book in",
      "When Reddit threads give conflicting advice",
      "When you want a fast comparison based on your actual priorities",
    ],
    promptTemplate: `I'm spending [DAYS] days in [DESTINATION], traveling as a [TRAVEL_PARTY], with a nightly budget around [BUDGET]. What matters most to me: [PRIORITIES].

Help me pick the best neighborhood:

1. TOP 4–5 NEIGHBORHOODS: For each area, provide:
   - Personality in one sentence (the honest vibe, not marketing copy)
   - Best for (traveler type / trip style)
   - Walkability and transit access
   - Food & nightlife quality
   - Safety and comfort level
   - Typical accommodation price range
   - Honest downside

2. COMPARISON TABLE: Create a compact table scoring each area (1–5) on: Location, Food, Nightlife, Transit, Safety, Value, Quiet/Charm. Highlight the winner for MY priorities.

3. MY TOP PICK: Based on my priorities, recommend one area with a specific explanation of why it wins.

4. WHERE TO BOOK: Suggest the exact sub-area or streets within that neighborhood (e.g. "stay near Thonglor Soi 13–17 for the best mix of restaurants and quiet side streets").

5. RUNNER-UP: A second option that's better if I value a different priority — explain the tradeoff clearly.`,
  },
  {
    id: "neighborhood-walking-guide",
    slug: "neighborhood-walking-guide",
    title: "Neighborhood deep-dive walking guide",
    summary:
      "Explore one neighborhood like a local — a curated walking route with stops, timing, and insider tips.",
    category: "Stays",
    intent: "planning",
    purpose:
      "Turns a neighborhood name into a curated walking experience with specific stops, local context, and the kind of knowledge you'd only get from a resident.",
    tags: ["walking", "neighborhood", "local", "explore"],
    variables: [
      { key: "neighborhood", label: "Neighborhood name", placeholder: "e.g. Shimokitazawa, Tokyo", example: "Shimokitazawa, Tokyo" },
      { key: "hours", label: "Hours available", placeholder: "e.g. 3–4", example: "3–4" },
      { key: "interests", label: "Interests", placeholder: "e.g. vintage shops, coffee, street art", example: "vintage shops, coffee, street art" },
      { key: "month", label: "Travel month", placeholder: "e.g. April", example: "April" },
    ],
    whenToUse: [
      "When you want to really experience one neighborhood (not just pass through)",
      "When you have a half-day to fill and want a curated walk",
      "When you want the kind of tips a local friend would give you",
    ],
    promptTemplate: `I want to explore [NEIGHBORHOOD] in about [HOURS] hours, visiting in [MONTH]. My interests: [INTERESTS].

Create a neighborhood deep-dive walking guide:

1. NEIGHBORHOOD BRIEFING: In 3–4 sentences, explain the character of this area — who lives here, what it's known for, and the best time of day to visit.

2. WALKING ROUTE: Create a numbered route scaled to the time I have:
   - Each stop: what it is, why it matters, how long to spend
   - Walking time between stops
   - The route should flow logically (no backtracking)
   - Mix of "must-see" and "only locals know" spots

3. FOOD & DRINK STOPS: Weave in 2–3 specific places to eat or drink along the route. For each: what to order, price range, and why it's special.

4. PHOTO SPOTS: Flag 2–3 spots along the route with the best photo opportunities and the ideal time/angle.

5. LOCAL ETIQUETTE: Any neighborhood-specific norms (e.g. "this market doesn't allow photos" or "shops open late here").

6. MAP DIRECTIONS: Describe the route so clearly that I could follow it without GPS — use landmarks, turns, and street names.`,
  },
  {
    id: "area-comparison-by-type",
    slug: "area-comparison-by-type",
    title: "Compare areas for your traveler type",
    summary:
      "Get a personalized neighborhood ranking based on whether you're a foodie, nightlife lover, family, or culture seeker.",
    category: "Stays",
    intent: "comparison",
    purpose:
      "Cuts through generic 'best neighborhood' advice by ranking areas specifically for your traveler archetype and trip priorities.",
    tags: ["comparison", "personalized", "traveler type", "ranking"],
    variables: [
      { key: "destination", label: "Destination city", placeholder: "e.g. Lisbon", example: "Lisbon" },
      { key: "traveler_type", label: "Traveler type", placeholder: "e.g. foodie / nightlife / family / culture / digital nomad", example: "foodie" },
      { key: "budget", label: "Budget level", placeholder: "budget / mid-range / comfort", example: "mid-range" },
      { key: "days", label: "Trip length (days)", placeholder: "e.g. 5", example: "5" },
      { key: "month", label: "Travel month", placeholder: "e.g. October", example: "October" },
    ],
    whenToUse: [
      "When generic 'best neighborhood' lists don't match your style",
      "When you want areas ranked specifically for your interests",
      "When you want to understand the real tradeoffs between areas",
    ],
    promptTemplate: `I'm a [TRAVELER_TYPE] traveler heading to [DESTINATION] for [DAYS] days in [MONTH], on a [BUDGET] budget.

Rank the neighborhoods for my traveler type:

1. TOP 5 AREAS RANKED: Rank the best neighborhoods specifically for a [TRAVELER_TYPE] traveler. For each:
   - Why it's ranked here (specific to my type, not generic)
   - The single best thing about it for someone like me
   - The honest downside
   - One specific spot/experience I'd love in this area

2. HEAD-TO-HEAD: Take the top 2 areas and do a detailed comparison — what's the real difference in daily experience? Paint a picture of "a typical day staying here" for each.

3. AVOID LIST: 1–2 neighborhoods that look good online but would disappoint a [TRAVELER_TYPE] traveler, and why.

4. HYBRID STRATEGY: If I have 5+ days, should I split between 2 neighborhoods? Which combo works best and why?

5. INSIDER MOVE: One neighborhood that's not in most guides but is perfect for a [TRAVELER_TYPE] traveler — explain why it's underrated.`,
  },
  {
    id: "best-base-for-route",
    slug: "best-base-for-route",
    title: "Find the best base for your trip route",
    summary:
      "Visiting multiple spots in a city? Find the one area to stay that minimizes transit to everywhere you want to go — with amenities and trade-offs.",
    category: "Stays",
    intent: "comparison",
    purpose:
      "Solves the 'where should I stay if I want to reach A, B, and C easily?' problem by comparing base areas against actual transit times and neighborhood quality.",
    tags: ["base", "location", "transit", "hotel area", "strategic stay"],
    variables: [
      { key: "destination", label: "Destination city", placeholder: "e.g. Tokyo", example: "Tokyo" },
      { key: "key_places", label: "Key places you want to visit", placeholder: "e.g. Shibuya, Asakusa, Shinjuku, Tsukiji", example: "Shibuya, Asakusa, Shinjuku, Tsukiji" },
      { key: "travel_party", label: "Travel party", placeholder: "solo / couple / family / friends", example: "couple" },
      { key: "priorities", label: "What matters for your stay area", placeholder: "e.g. walkable, safe at night, good food nearby, quiet", example: "walkable, good food nearby" },
      { key: "budget", label: "Nightly accommodation budget", placeholder: "e.g. $80–150/night", example: "$80–150/night" },
    ],
    whenToUse: [
      "When you have a list of places to visit and need the most strategic area to stay",
      "When you want to minimize daily commute time across your itinerary",
      "When you want to understand the amenities and vibe around potential hotel areas",
    ],
    promptTemplate: `I'm staying in [DESTINATION], traveling as a [TRAVEL_PARTY], budget around [BUDGET]. The key places I want to visit: [KEY_PLACES]. What matters for my stay area: [PRIORITIES].

Find the best base for my trip:

1. TOP 3 BASE AREAS: For each candidate neighborhood, provide:
   - Why it works as a base for my specific list of places
   - Vibe and character in one sentence
   - What's within walking distance (food, convenience stores, transit)
   - Safety and comfort level
   - Typical accommodation price range
   - Honest downside of staying here

2. TRANSIT TIME MATRIX: A table showing travel time from each base area to each of my key places:
   Base area | [Place 1] | [Place 2] | [Place 3] | ... | Average
   Include transit method (walk / metro line / bus) for each.

3. MY TOP PICK: Based on my priorities and the transit matrix, recommend one area. Explain why the average transit time + neighborhood quality makes this the winner.

4. SPECIFIC STREETS: Narrow it down — suggest the exact sub-area or streets to search for accommodation (e.g. "Look for hotels within 5 minutes of [station name], between [street] and [street]").

5. RUNNER-UP: One alternative base that wins if I value a different priority — explain the trade-off clearly.

For every specific place you recommend, include one way I can verify it's still open/accurate (e.g. Google Maps search term, official website, or "search for [X] on [platform]").`,
  },

  // ── Food & Drink ──────────────────────────────────────────────────────
  {
    id: "food-crawl-route",
    slug: "food-crawl-route",
    title: "Create a food crawl route",
    summary:
      "A curated eating route through a city or neighborhood — paced so you can actually eat everything.",
    category: "Food & Drink",
    intent: "planning",
    purpose:
      "Produces a realistic food crawl with portion-aware pacing, neighborhood flow, and the kind of specific recommendations (what to order, how to order) that generic lists miss.",
    tags: ["food crawl", "street food", "route", "eating"],
    variables: [
      { key: "destination", label: "City or neighborhood", placeholder: "e.g. Penang, George Town", example: "Penang, George Town" },
      { key: "travel_party", label: "Travel party", placeholder: "solo / couple / friends", example: "friends" },
      { key: "duration", label: "Duration", placeholder: "e.g. half-day / full-day", example: "half-day" },
      { key: "dietary", label: "Dietary restrictions (if any)", placeholder: "e.g. none / vegetarian / halal / no shellfish", example: "none" },
    ],
    whenToUse: [
      "When food is a main reason you're visiting",
      "When you want a structured eating route (not just a list of restaurants)",
      "When you want to eat like a local, not a tourist",
    ],
    promptTemplate: `Build a [DURATION] food crawl through [DESTINATION] for a [TRAVEL_PARTY] group. Dietary restrictions: [DIETARY].

1. FOOD CRAWL ROUTE (6–10 stops): For each stop:
   - Name of the place (or stall/hawker description if unnamed)
   - What to order (specific dishes, not "try the local food")
   - Approximate cost per person
   - How much to eat (small taste / half portion / full meal) — pace it so I'm not full by stop 3
   - How to order (language tips, point-at-menu, queue etiquette)
   - Walk time to next stop

2. TIMING: Best time to start this crawl (some spots are morning-only, some are lunch peak, etc.). Flag any places that close early or have long queues.

3. FOOD CONTEXT: For 2–3 key dishes, briefly explain why they matter here — the cultural/historical context that makes this food special in this city.

4. DRINK PAIRINGS: Suggest local drinks to try between food stops (not just alcohol — local coffee, fresh juice, specialty drinks).

5. BUDGET TOTAL: Estimated total cost per person for the full crawl.

6. MUST-NOT-MISS: If I can only do 3 stops, which 3 and in what order?

For every specific place you recommend, include one way I can verify it's still open/accurate (e.g. Google Maps search term, official website, or "search for [X] on [platform]").`,
  },
  {
    id: "local-food-guide",
    slug: "local-food-guide",
    title: "Eat like a local (not a tourist)",
    summary:
      "Find the restaurants, stalls, and food experiences that locals actually eat at — organized by meal type and neighborhood.",
    category: "Food & Drink",
    intent: "planning",
    purpose:
      "Gets travelers out of TripAdvisor top-10 restaurants and into the places where locals go — with enough context to navigate confidently.",
    tags: ["local food", "restaurants", "authentic", "guide"],
    variables: [
      { key: "destination", label: "Destination city", placeholder: "e.g. Ho Chi Minh City", example: "Ho Chi Minh City" },
      { key: "days", label: "Trip length (days)", placeholder: "e.g. 4", example: "4" },
      { key: "food_style", label: "Food preferences", placeholder: "e.g. street food, seafood, vegetarian-friendly, fine dining", example: "street food, seafood" },
      { key: "budget", label: "Food budget level", placeholder: "cheap eats / mid-range / splurge-worthy", example: "cheap eats" },
    ],
    whenToUse: [
      "When you want to eat well without overpaying at tourist spots",
      "When you want a meal plan organized by neighborhood and day",
      "When you want to understand what and how locals eat",
    ],
    promptTemplate: `I'm in [DESTINATION] for [DAYS] days. I love: [FOOD_STYLE]. Budget level: [BUDGET].

Create a local food guide:

1. FOOD CULTURE BRIEFING: In 5 bullet points, explain how locals eat in this city — meal timing, ordering customs, tipping, where to find the best food (hint: it's usually not the pretty restaurant).

2. MUST-EAT DISHES: List the 8–10 dishes I absolutely must try, ranked by priority. For each: what it is, where to get the best version, and approximate cost.

3. MEAL MAP (by day): For each day, suggest:
   - Breakfast spot (with specific recommendation)
   - Lunch spot
   - Afternoon snack / cafe
   - Dinner spot
   - Late-night option (if the city has a late food culture)
   Group meals by neighborhood to minimize travel between eating.

4. TOURIST TRAPS TO SKIP: 3–5 popular restaurants that locals avoid and what to do instead.

5. ORDERING CHEAT SHEET: Key food vocabulary, how to order at stalls/markets, pointing protocol, and payment norms.

6. FOOD EXPERIENCES: 2–3 food experiences beyond restaurants (cooking class, market tour, farm visit, food-focused neighborhood walk).

For every specific place you recommend, include one way I can verify it's still open/accurate (e.g. Google Maps search term, official website, or "search for [X] on [platform]").`,
  },
  {
    id: "market-and-street-food-route",
    slug: "market-and-street-food-route",
    title: "Street food + market route builder",
    summary:
      "Plan a street food and market exploration route — with timing, best stalls, and practical navigation tips.",
    category: "Food & Drink",
    intent: "planning",
    purpose:
      "Makes street food and market exploration structured and confident — know exactly when to go, what to try, and how to navigate.",
    tags: ["street food", "markets", "route", "hawker"],
    variables: [
      { key: "destination", label: "City or area", placeholder: "e.g. Taipei", example: "Taipei" },
      { key: "market_type", label: "Market preference", placeholder: "e.g. night markets / morning markets / both", example: "night markets" },
      { key: "travel_party", label: "Travel party", placeholder: "solo / couple / friends", example: "couple" },
      { key: "dietary", label: "Dietary restrictions (if any)", placeholder: "e.g. none / vegetarian / halal / no shellfish", example: "none" },
    ],
    whenToUse: [
      "When markets and street food are a highlight of your trip",
      "When you don't want to wander aimlessly and miss the best stalls",
      "When you need practical tips for navigating markets confidently",
    ],
    promptTemplate: `I want to explore [MARKET_TYPE] in [DESTINATION], traveling as a [TRAVEL_PARTY]. Dietary restrictions: [DIETARY].

Build a market and street food route:

1. TOP 3 MARKETS/AREAS: Rank the best options for my preference. For each:
   - Operating hours and best time to arrive
   - What it's famous for
   - How long to spend there
   - How to get there

2. STALL-BY-STALL ROUTE: For the #1 market, create a walk-through route with 8–12 recommended stalls:
   - Stall name or landmark description
   - What to order and approximate price
   - Portion size guidance (taste / snack / meal)
   - Any queue tips or ordering tricks

3. MARKET NAVIGATION: Practical tips:
   - Layout overview (where the food section is vs goods/clothing)
   - Cash vs card
   - What to bring (bags, wet wipes, water)
   - Etiquette (tasting, bargaining, photos)

4. TIMING STRATEGY: When to go for the best experience (avoid peak crowds but don't arrive too early/late for the best stalls).

5. COMBINE WITH: What to pair the market visit with (nearby attractions, walking route, a good spot for drinks after).`,
  },

  // ── Routes ────────────────────────────────────────────────────────────
  {
    id: "sightseeing-route-builder",
    slug: "sightseeing-route-builder",
    title: "Build routes that actually work",
    summary:
      "A sightseeing route with transit, timing, and logical flow — no backtracking, no wasted time.",
    category: "Routes",
    intent: "planning",
    purpose:
      "Produces a route that respects geography, opening hours, crowd patterns, and energy levels — the kind of plan that feels effortless to follow.",
    tags: ["sightseeing", "route", "transit", "planning"],
    variables: [
      { key: "destination", label: "Destination city", placeholder: "e.g. Rome", example: "Rome" },
      { key: "interests", label: "Interests", placeholder: "e.g. history, architecture, food, photos", example: "history, architecture, food" },
      { key: "travel_party", label: "Travel party", placeholder: "solo / couple / family / friends", example: "couple" },
      { key: "pace", label: "Pace preference", placeholder: "packed / balanced / relaxed", example: "balanced" },
    ],
    whenToUse: [
      "When you want to see a lot without feeling rushed",
      "When you need a route that connects stops logically",
      "When you want transit figured out between every stop",
    ],
    promptTemplate: `Build a sightseeing route for [DESTINATION]. My interests: [INTERESTS]. Traveling as a [TRAVEL_PARTY] at a [PACE] pace.

1. THE ROUTE: Create a timed, numbered route from morning to evening:
   - Each stop: name, why it's worth it, how long to spend
   - Transit between stops: exact method (walk / metro line / bus #), time, and cost
   - Crowd strategy: best arrival time to avoid lines
   - No backtracking — the route should flow geographically

2. ENERGY MANAGEMENT: Build in 2–3 natural rest points (cafe breaks, park sits, quiet spots). Place them where energy typically dips.

3. MEALS ON-ROUTE: Breakfast, lunch, and dinner spots that fall naturally along the route. Specific names, what to order, and price range.

4. SKIP-THE-LINE TIPS: For any popular stop, suggest how to reduce wait time (pre-booking, early arrival, lesser-known entrance).

5. PHOTO TIMELINE: Flag the 3 best photo moments and the ideal time of day for each (golden hour, less crowded, best light angle).

6. FLEXIBILITY: Mark which stops are "cut first" if I'm running behind, and which are non-negotiable.

For every specific place you recommend, include one way I can verify it's still open/accurate (e.g. Google Maps search term, official website, or "search for [X] on [platform]").`,
  },
  {
    id: "day-trip-planner",
    slug: "day-trip-planner",
    title: "Plan a perfect day trip from the city",
    summary:
      "Find the best day trip from your base city — with realistic timing, transport, and a full itinerary for the destination.",
    category: "Routes",
    intent: "comparison",
    purpose:
      "Compares day trip options with realistic transit timing and provides a complete plan for the best one — so you don't waste half the day getting there.",
    tags: ["day trip", "excursion", "transit", "comparison"],
    variables: [
      { key: "base_city", label: "Base city", placeholder: "e.g. Barcelona", example: "Barcelona" },
      { key: "interests", label: "Interests for the day trip", placeholder: "e.g. nature, wine, small towns, beaches, history", example: "nature, small towns" },
      { key: "travel_party", label: "Travel party", placeholder: "solo / couple / family / friends", example: "friends" },
      { key: "transport", label: "Transport preference", placeholder: "e.g. train only / car ok / any", example: "train only" },
      { key: "month", label: "Travel month", placeholder: "e.g. June", example: "June" },
    ],
    whenToUse: [
      "When you have a free day and want to escape the city",
      "When you're not sure which day trip is worth the travel time",
      "When you want a complete plan, not just 'go to X'",
    ],
    promptTemplate: `I'm based in [BASE_CITY] and want to do a day trip in [MONTH]. Interests: [INTERESTS]. Traveling as a [TRAVEL_PARTY]. Transport: [TRANSPORT].

1. TOP 3 DAY TRIP OPTIONS: Compare them:
   - Travel time (each way) and method
   - What you'll actually see and do
   - Best for what kind of traveler
   - Cost (transport + activities + food)
   - Honest downside (is it actually worth the transit time?)

2. COMPARISON TABLE: Destination | Travel time | Cost | Highlight | Downside | Best for.

3. #1 PICK — FULL PLAN: For the recommended day trip, build a complete timeline:
   - What time to leave and which train/bus/route
   - Arrival plan (what to do first)
   - 3–5 hour itinerary on the ground
   - Where to eat (with specific recommendation)
   - Return timing (last comfortable departure)

4. BOOKING NEEDS: What to book ahead vs what to wing. Include transport ticket tips.

5. PLAN B: If the #1 pick doesn't work out (weather, closures), which alternative requires the least replanning?`,
  },
  {
    id: "transit-smart-itinerary",
    slug: "transit-smart-itinerary",
    title: "Plan around opening hours + transit",
    summary:
      "Build an itinerary that respects real-world constraints — opening hours, transit schedules, and reservation requirements.",
    category: "Routes",
    intent: "planning",
    purpose:
      "Prevents the classic mistake of arriving at a closed venue or spending 45 minutes on transit that could have been 10 with better sequencing.",
    tags: ["transit", "opening hours", "logistics", "timing"],
    variables: [
      { key: "destination", label: "Destination city", placeholder: "e.g. Kyoto", example: "Kyoto" },
      { key: "places", label: "Places I want to visit", placeholder: "e.g. Fushimi Inari, Arashiyama bamboo grove, Kinkaku-ji, Nishiki Market", example: "Fushimi Inari, Arashiyama bamboo grove, Kinkaku-ji, Nishiki Market" },
      { key: "day_of_week", label: "Day of the week", placeholder: "e.g. Tuesday", example: "Tuesday" },
    ],
    whenToUse: [
      "When you have a list of places but need help with the optimal order",
      "When opening hours, closures, and transit could ruin a bad plan",
      "When you want to minimize time on transit and maximize time at destinations",
    ],
    promptTemplate: `I want to visit these places in [DESTINATION]: [PLACES]. The day of the week will be [DAY_OF_WEEK].

Optimize my day around real-world constraints:

1. OPENING HOURS CHECK: For each place, list:
   - Opening and closing times
   - Whether it's closed or has reduced hours on certain days
   - Whether tickets/reservations are needed
   - Best time to arrive to avoid crowds

2. OPTIMAL SEQUENCE: Reorder my list for the best flow. Show:
   - The recommended order
   - Transit method between each stop (specific line/bus, walking time)
   - Total transit time vs "wasted" time if I went in my original order

3. TIMED SCHEDULE: Build a timeline from morning to evening:
   Time | Place | Duration | Transit to next stop
   Build in realistic buffer time (not a minute-to-minute fantasy).

4. WHAT TO DROP: If the day is too packed, which place should I cut and why? What's the 80/20 version of this day?

5. CONTINGENCY: If one place is unexpectedly closed or overcrowded, what should I do instead nearby?

For every specific place you recommend, include one way I can verify it's still open/accurate (e.g. Google Maps search term, official website, or "search for [X] on [platform]").`,
  },

  // ── Discovery ─────────────────────────────────────────────────────────
  {
    id: "hidden-gems-finder",
    slug: "hidden-gems-finder",
    title: "Find hidden gems (skip the tourist traps)",
    summary:
      "Discover the places locals love that don't appear in guidebooks — with specific names, directions, and context.",
    category: "Discovery",
    intent: "planning",
    purpose:
      "Goes beyond 'off the beaten path' clichés to surface genuinely interesting, lesser-known spots with the context needed to appreciate them.",
    tags: ["hidden gems", "off-beat", "local", "authentic"],
    variables: [
      { key: "destination", label: "Destination city", placeholder: "e.g. Seoul", example: "Seoul" },
      { key: "days", label: "Trip length (days)", placeholder: "e.g. 5", example: "5" },
      { key: "interests", label: "Interests", placeholder: "e.g. art, coffee, architecture, nature, vintage", example: "art, coffee, vintage" },
    ],
    whenToUse: [
      "When you've already seen the top-10 lists and want something different",
      "When you want the places a local friend would take you",
      "When you value authenticity over popularity",
    ],
    promptTemplate: `I'm spending [DAYS] days in [DESTINATION]. My interests: [INTERESTS]. I've already seen the standard tourist lists — give me the hidden gems.

1. 10 HIDDEN GEMS: For each:
   - Name and exact location (neighborhood + nearest landmark or transit stop)
   - What makes it special (be specific, not just "it's charming")
   - Best time to visit
   - How to find it (some great spots are literally down an alley)
   - Who would love it / who would be disappointed

2. TOURIST TRAP SWAPS: Take 3 famous attractions and suggest a lesser-known alternative that delivers a similar (or better) experience:
   - Famous spot → Hidden alternative → Why it's as good or better

3. LOCAL HANGOUTS: 3 places where locals actually spend their weekends — not "local" restaurants with menus in 5 languages.

4. SEASONAL SECRETS: 2–3 things happening during my visit that most tourists don't know about (markets, festivals, seasonal food, neighborhood events).

5. DISCOVERY WALK: One 2-hour walking route through a non-touristy area that captures the real spirit of the city.`,
  },
  {
    id: "local-experiences-planner",
    slug: "local-experiences-planner",
    title: "Plan local experiences (not in guidebooks)",
    summary:
      "Find unique, immersive experiences that connect you to local culture — workshops, community events, and real interactions.",
    category: "Discovery",
    intent: "planning",
    purpose:
      "Surfaces the kind of experiences that make a trip memorable — not just sights to see, but things to do that create real connection with a place.",
    tags: ["experiences", "immersive", "culture", "local"],
    variables: [
      { key: "destination", label: "Destination city", placeholder: "e.g. Chiang Mai", example: "Chiang Mai" },
      { key: "travel_party", label: "Travel party", placeholder: "solo / couple / family / friends", example: "solo" },
      { key: "interests", label: "Experience interests", placeholder: "e.g. craft, cooking, music, nature, spirituality", example: "craft, cooking, nature" },
      { key: "budget", label: "Budget level", placeholder: "budget / mid-range / comfort", example: "mid-range" },
    ],
    whenToUse: [
      "When you want more than sightseeing",
      "When you want to interact with local culture, not just observe it",
      "When you're looking for the experiences you'll tell stories about",
    ],
    promptTemplate: `I'm visiting [DESTINATION] as a [TRAVEL_PARTY] traveler. My interests: [INTERESTS]. Budget: [BUDGET].

Find unique local experiences:

1. TOP 8 EXPERIENCES: For each:
   - What it is and what you'll actually do
   - Why it's special (cultural context, not marketing copy)
   - Duration and approximate cost
   - How to book or arrange it
   - Skill/fitness level needed

2. CATEGORIES:
   - 2 hands-on craft/creative experiences (workshop, class, studio visit)
   - 2 food/drink experiences (beyond restaurants — think farm visits, fermentation, foraging)
   - 2 nature/outdoor experiences (not the obvious hike everyone does)
   - 2 cultural immersion experiences (community events, local ceremonies, neighborhood life)

3. ETHICAL CHECK: Flag any experiences that might be exploitative or culturally insensitive, and suggest respectful alternatives.

4. COMBINATION PLAN: Show how to fit 3–4 of these into a single day alongside regular sightseeing.

5. SPONTANEOUS OPTIONS: 2–3 experiences that don't need booking — things I can stumble into if the moment is right.`,
  },
  {
    id: "cultural-deep-dive",
    slug: "cultural-deep-dive",
    title: "Cultural deep-dive: understand before you visit",
    summary:
      "Get the cultural context that transforms a trip from 'seeing places' to 'understanding them' — history, customs, and social norms.",
    category: "Discovery",
    intent: "planning",
    purpose:
      "Gives travelers the background knowledge that makes every sight, meal, and interaction more meaningful — like having a knowledgeable local friend briefing you before the trip.",
    tags: ["culture", "history", "customs", "context"],
    variables: [
      { key: "destination", label: "Destination country or city", placeholder: "e.g. Japan", example: "Japan" },
      { key: "interests", label: "Cultural interests", placeholder: "e.g. religion, food history, architecture, social customs", example: "food history, social customs" },
      { key: "days", label: "Trip length (days)", placeholder: "e.g. 10", example: "10" },
    ],
    whenToUse: [
      "When you want to understand a place, not just photograph it",
      "When cultural context would make your trip more meaningful",
      "When you want to avoid unintentional cultural faux pas",
    ],
    promptTemplate: `I'm visiting [DESTINATION] for [DAYS] days. My cultural interests: [INTERESTS].

Give me a cultural deep-dive:

1. CULTURAL BRIEFING (the stuff guidebooks skip):
   - 5 things that will surprise a first-time visitor
   - The social norms that matter most (greetings, shoes, dining, public behavior)
   - Common tourist behaviors that locals find rude or awkward
   - The local relationship with tourism (welcomed? tolerated? complicated?)

2. HISTORY IN 5 MINUTES: The 5 historical events/periods that shaped what I'll see today. Keep it engaging, not textbook.

3. FOOD CULTURE: The story behind the food — why they eat what they eat, meal customs, and 3 dishes with fascinating backstories.

4. CULTURAL EXPERIENCES: 5 ways to engage with local culture respectfully:
   - What to do (temple visits, ceremonies, markets, community events)
   - How to participate without being intrusive
   - What to wear, bring, or know

5. CONVERSATION STARTERS: 3–5 topics that locals love talking about (and 2 topics to avoid).

6. MEDIA PREP: 1 film, 1 book, and 1 podcast/article to consume before the trip that will make everything click.`,
  },

  // ── Smart Planning ────────────────────────────────────────────────────
  {
    id: "choose-where-to-travel",
    slug: "choose-where-to-travel",
    title: "Help me choose where to travel next",
    summary:
      "Not sure where to go? Describe your dates, weather preferences, and dream activities — get 3 destination picks with honest trade-offs.",
    category: "Smart Planning",
    intent: "comparison",
    purpose:
      "For travelers stuck at step zero — turns vague preferences into a shortlist of destinations with clear reasoning, so you can commit and start planning.",
    tags: ["destination", "where to go", "discovery", "recommendation", "inspiration"],
    variables: [
      { key: "departure_city", label: "Where you're flying from", placeholder: "e.g. Singapore", example: "Singapore" },
      { key: "duration", label: "How long you have", placeholder: "e.g. 5 days / 2 weeks / a long weekend", example: "5 days" },
      { key: "travel_month", label: "When you're traveling", placeholder: "e.g. July / flexible", example: "July" },
      { key: "weather_pref", label: "Weather preference", placeholder: "e.g. warm & sunny / cool & crisp / don't mind rain", example: "warm & sunny" },
      { key: "activities", label: "Activities you want", placeholder: "e.g. beaches, hiking, street food, nightlife, temples", example: "beaches, street food, nightlife" },
      { key: "travel_party", label: "Travel party", placeholder: "solo / couple / family / friends", example: "friends" },
      { key: "budget", label: "Budget level", placeholder: "budget / mid-range / comfort / luxury", example: "mid-range" },
    ],
    whenToUse: [
      "When you have dates but no destination in mind",
      "When you want recommendations tailored to your weather, activity, and budget preferences",
      "When you're choosing between regions and need help narrowing down",
    ],
    promptTemplate: `I have [DURATION] free in [TRAVEL_MONTH] and I'm flying from [DEPARTURE_CITY]. I'm traveling as a [TRAVEL_PARTY] on a [BUDGET] budget. I want weather that's [WEATHER_PREF] and activities like: [ACTIVITIES].

Help me choose where to go:

1. TOP 3 DESTINATIONS: For each, give me:
   - A 2-sentence pitch — why this place fits what I described
   - Weather reality for [TRAVEL_MONTH] (temperature range, rain risk, any deal-breakers)
   - Top 3 activities that match my interests (specific, not generic)
   - Approximate flight time and cost range from [DEPARTURE_CITY]
   - Daily budget estimate (accommodation + food + transport + activities)
   - One honest caveat (crowds, visa hassle, weather risk, etc.)

2. COMPARISON TABLE:
   Destination | Flight time | Daily cost | Weather match | Activity match | Caveat
   Score weather and activity match as Strong / Good / Fair.

3. MY PICK: Recommend one destination and explain why it wins for my specific combo of preferences. Then: "Choose [alternative] instead if ___."

4. BOOKING WINDOW: For your top pick, when should I book flights and accommodation for the best price?

5. QUICK-START: If I go with your #1 pick, give me the 3 things to book or research first.`,
  },
  {
    id: "compare-two-destinations",
    slug: "compare-two-destinations",
    title: "Compare options with clear trade-offs",
    summary:
      "Can't decide between two destinations? Get a structured comparison based on your trip priorities.",
    category: "Smart Planning",
    intent: "comparison",
    purpose:
      "Ends destination paralysis by comparing two places across the dimensions that actually matter for YOUR trip, not generic rankings.",
    tags: ["comparison", "destinations", "decision", "trade-offs"],
    variables: [
      { key: "option_a", label: "Option A", placeholder: "e.g. Bali", example: "Bali" },
      { key: "option_b", label: "Option B", placeholder: "e.g. Phuket", example: "Phuket" },
      { key: "days", label: "Trip length (days)", placeholder: "e.g. 7", example: "7" },
      { key: "travel_party", label: "Travel party", placeholder: "solo / couple / family / friends", example: "couple" },
      { key: "priorities", label: "What matters most", placeholder: "e.g. food, beaches, culture, nightlife, budget", example: "food, beaches, budget" },
      { key: "month", label: "Travel month", placeholder: "e.g. August", example: "August" },
    ],
    whenToUse: [
      "When you're torn between two destinations",
      "When you want a comparison based on YOUR priorities, not generic rankings",
      "When you need a clear recommendation with honest trade-offs",
    ],
    promptTemplate: `I'm choosing between [OPTION_A] and [OPTION_B] for a [DAYS]-day trip in [MONTH]. Traveling as a [TRAVEL_PARTY]. What matters most to me: [PRIORITIES].

Compare them head-to-head:

1. COMPARISON TABLE: Score each destination (1–5) on the dimensions that matter for this type of trip (e.g. food, nature, culture, nightlife, value, safety, ease of travel, weather, uniqueness). Pick the most relevant dimensions for my priorities.

2. DEEP COMPARISON (by my priorities): For each priority I listed, give a 2–3 sentence comparison explaining which destination wins and why. Be specific, not generic.

3. DAILY COST COMPARISON:
   Budget | Mid-range | Comfortable
   Show estimated daily costs for accommodation, food, transport, and activities.

4. WEATHER REALITY: For [MONTH] specifically — what will the weather actually be like at each destination? Flag any dealbreakers (monsoon, extreme heat, etc.).

5. ITINERARY SNAPSHOT: For each destination, describe what a typical "best day" looks like — this often reveals which place you'd actually enjoy more.

6. MY PICK: Based on my priorities, make a clear recommendation. Then tell me: "Choose the other one if ___" (the one scenario where it flips).`,
  },
  {
    id: "trip-budget-planner",
    slug: "trip-budget-planner",
    title: "Get a trip budget in minutes",
    summary:
      "Build a realistic trip budget with clear estimates, savings levers, and a simple tracking template.",
    category: "Smart Planning",
    intent: "planning",
    purpose:
      "Turns vague budget anxiety into a clear, editable plan — with realistic estimates based on destination, style, and season.",
    tags: ["budget", "planning", "cost estimate", "savings"],
    variables: [
      { key: "destination", label: "Destination", placeholder: "e.g. Vietnam", example: "Vietnam" },
      { key: "days", label: "Trip length (days)", placeholder: "e.g. 10", example: "10" },
      { key: "travel_party", label: "Travel party", placeholder: "solo / couple / family / friends", example: "couple" },
      { key: "travel_style", label: "Travel style", placeholder: "budget / mid-range / comfort / luxury", example: "mid-range" },
      { key: "flying_from", label: "Flying from", placeholder: "e.g. Singapore", example: "Singapore" },
    ],
    whenToUse: [
      "When you need a realistic cost estimate before committing to a trip",
      "When you want to know where your money will actually go",
      "When you want clear strategies to save without downgrading the experience",
    ],
    promptTemplate: `Estimate the total cost for a [DAYS]-day trip to [DESTINATION] for a [TRAVEL_PARTY], [TRAVEL_STYLE] style, flying from [FLYING_FROM].

1. COST BREAKDOWN: Estimate realistic ranges for:
   - Flights (round-trip, economy)
   - Accommodation (per night and total)
   - Food (per day: budget / mid / nice meals)
   - Local transport (per day)
   - Activities & attractions
   - Travel insurance
   - SIM/connectivity
   - Miscellaneous (shopping, tips, unexpected)
   Total estimate: $LOW – $HIGH per person

2. BUDGET TABLE:
   Category | Budget option | Mid-range option | Comfort option | Notes
   Fill in realistic numbers for this specific destination.

3. TOP 5 SAVINGS LEVERS: The highest-impact ways to reduce cost without hurting the experience. Rank by savings potential.

4. HIDDEN COSTS: 5 costs that travelers to [DESTINATION] commonly forget (visa, departure tax, tipping norms, tourist pricing, scam buffer).

5. BOOKING TIMELINE: When to book each component for the best price.

6. SIMPLE TRACKER: A template I can copy to track actual spending vs budget day by day.`,
  },
  {
    id: "packing-logistics-checklist",
    slug: "packing-logistics-checklist",
    title: "Pre-trip logistics + packing checklist",
    summary:
      "A destination-specific checklist covering documents, packing, bookings, and the stuff most people forget.",
    category: "Smart Planning",
    intent: "checklist",
    purpose:
      "Prevents pre-trip stress and forgotten essentials by providing a prioritized, destination-aware checklist with real deadlines.",
    tags: ["packing", "checklist", "logistics", "preparation"],
    variables: [
      { key: "destination", label: "Destination", placeholder: "e.g. Japan", example: "Japan" },
      { key: "days", label: "Trip length (days)", placeholder: "e.g. 14", example: "14" },
      { key: "month", label: "Travel month", placeholder: "e.g. April", example: "April" },
      { key: "travel_party", label: "Travel party", placeholder: "solo / couple / family / friends", example: "couple" },
    ],
    whenToUse: [
      "When you're 1–4 weeks before departure and want to make sure nothing's missed",
      "When you want a packing list specific to your destination and season",
      "When you want a timeline for pre-trip tasks (visa, bookings, etc.)",
    ],
    promptTemplate: `Create a pre-trip checklist for [DAYS] days in [DESTINATION] in [MONTH], traveling as a [TRAVEL_PARTY].

1. DOCUMENTS & ADMIN (4 weeks before):
   - Visa requirements and processing time
   - Passport validity rules
   - Travel insurance recommendation
   - Important numbers/contacts to save
   - Digital copies of everything

2. BOOKINGS & RESERVATIONS (2–3 weeks before):
   - What MUST be booked ahead (restaurants, experiences, transit passes)
   - What can be left flexible
   - Apps to download before the trip

3. MONEY & CONNECTIVITY:
   - Cash vs card norms for this destination
   - Best way to get local currency
   - SIM/eSIM recommendation
   - Payment apps locals use

4. PACKING LIST (destination + season specific):
   - Weather-appropriate clothing (be specific for [MONTH])
   - Footwear (based on typical activities)
   - Destination-specific items most people forget
   - Tech & charging (adaptor type, power bank needs)
   - NOT worth packing (things to buy there cheaper)

5. DAY-BEFORE CHECKLIST: The 10 things to confirm/do the day before departure.

6. AIRPORT & ARRIVAL: First-hour game plan — what to do between landing and reaching your accommodation.`,
  },
  {
    id: "compare-travel-options",
    slug: "compare-travel-options",
    title: "Compare any two travel options side-by-side",
    summary:
      "A structured comparison framework for any travel decision — hotels, flights, neighborhoods, tours, or routes.",
    category: "Smart Planning",
    intent: "comparison",
    purpose:
      "Provides a reusable comparison framework that surfaces the real trade-offs in any travel decision, not just the price difference.",
    tags: ["comparison", "decision", "trade-offs", "framework"],
    variables: [
      { key: "decision", label: "What are you comparing?", placeholder: "e.g. Hotel A vs Hotel B / Train vs flight to X / AirBnB vs hotel", example: "Hotel A vs Hotel B" },
      { key: "option_a", label: "Option A details", placeholder: "Paste details, link, or describe", example: "Hotel near old town, $95/night, 4-star, no breakfast" },
      { key: "option_b", label: "Option B details", placeholder: "Paste details, link, or describe", example: "Airbnb in trendy area, $75/night, full kitchen, 15min from center" },
      { key: "priorities", label: "What matters most to you", placeholder: "e.g. location, price, flexibility, comfort, convenience", example: "location, flexibility, value" },
    ],
    whenToUse: [
      "When you have two options and can't decide",
      "When the price isn't the whole story and you need to see real trade-offs",
      "When you want a clear recommendation, not just a list of pros and cons",
    ],
    promptTemplate: `I need to decide: [DECISION]

Option A: [OPTION_A]
Option B: [OPTION_B]

My priorities: [PRIORITIES]

Compare them:

1. SIDE-BY-SIDE TABLE: Compare across all relevant dimensions:
   Factor | Option A | Option B | Winner
   Include: cost, location, convenience, flexibility, comfort, hidden costs, and any dimension specific to this type of decision.

2. TRUE COST: Go beyond sticker price. Factor in transport costs (is Option B cheap but far?), included amenities, cancellation risk, and time cost.

3. PRIORITY-WEIGHTED ANALYSIS: Score each option on MY stated priorities. Weight the scores — not everything matters equally.

4. SCENARIO TEST: "Choose A if ___" and "Choose B if ___" — give me the conditions where each option wins.

5. WHAT I'D MISS: For each option, what's the biggest thing I'd give up by choosing the other?

6. RECOMMENDATION: Make a clear call for my situation, with one caveat that would flip the decision.`,
  },
  {
    id: "trip-plan-in-minutes",
    slug: "trip-plan-in-minutes",
    title: "Get a trip plan in minutes",
    summary:
      "Don't want to use five prompts? Get an 80%-ready trip plan in one shot — where to stay, what to do, what to eat, and what it'll cost.",
    category: "Smart Planning",
    intent: "planning",
    purpose:
      "The fastest path from 'I want to go somewhere' to a bookable plan. Not the most detailed, but covers every angle — itinerary, accommodation, food, budget, logistics — in a single response you can start acting on immediately.",
    tags: ["quick plan", "comprehensive", "one-shot", "overview"],
    variables: [
      { key: "destination", label: "Destination", placeholder: "e.g. Portugal", example: "Portugal" },
      { key: "days", label: "Number of days", placeholder: "e.g. 7", example: "7" },
      { key: "travel_party", label: "Travel party", placeholder: "solo / couple / family / friends", example: "couple" },
      { key: "budget", label: "Budget level", placeholder: "budget / mid-range / comfort / luxury", example: "mid-range" },
      { key: "interests", label: "Top interests", placeholder: "e.g. food, history, beaches, wine", example: "food, history, beaches, wine" },
      { key: "month", label: "Travel month", placeholder: "e.g. May", example: "May" },
    ],
    whenToUse: [
      "When you want a complete plan in one prompt — not five separate ones",
      "When you need a solid 80% starting point you can refine later",
      "When you're short on planning time and want to go from zero to bookable fast",
    ],
    promptTemplate: `Plan my entire trip: [DAYS] days in [DESTINATION] in [MONTH]. Traveling as a [TRAVEL_PARTY], [BUDGET] budget. Interests: [INTERESTS].

Give me a complete trip plan in one response:

1. WHERE TO STAY: Recommend the best neighborhood and accommodation type for my style. Give a specific area suggestion.

2. DAY-BY-DAY ITINERARY: For each day:
   - Theme and main neighborhood
   - 2–3 key activities with timing
   - Lunch and dinner spots (specific names)
   - How to get around that day

3. FOOD PLAN: Top 10 dishes I must try and where to find them.

4. BUDGET ESTIMATE: Daily cost breakdown (accommodation, food, transport, activities). Total trip estimate per person.

5. BOOK AHEAD: What to reserve now vs what to leave flexible.

6. WEATHER & PACKING: What to expect in [MONTH] and the 5 most important items to pack.

7. LOCAL TIPS: 5 insider tips that will save me time, money, or frustration.

8. TRANSIT CHEAT SHEET: Best way to get from airport to city, daily transport method, and any passes to buy.

Keep it actionable — I want to be able to start booking after reading this.`,
  },
];
