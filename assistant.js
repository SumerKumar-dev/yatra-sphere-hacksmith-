/**
 * Yatra Sphere — Intelligent AI Travel Assistant (Rule-Based Demo Engine)
 * Pure Vanilla JavaScript (ES6+) — No frameworks, external libraries, or exposed API keys.
 * Powers both the dedicated assistant.html workspace and the quick drawer on other pages.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'yatraSphere_assistantHistory_v1';
  const MAX_INPUT_CHARS = 600;
  const CATALOG = Array.isArray(window.YATRA_DESTINATIONS) ? window.YATRA_DESTINATIONS : [];

  // =========================================================================
  // 1. Domain Knowledge Extensions (Landmarks, Seasons, Solo/Family, Packing)
  // =========================================================================
  const DEST_ALIASES = {
    manali: ['manali', 'solang', 'atal tunnel', 'sissu', 'hadimba', 'beas', 'kullu', 'old manali', 'himachal'],
    goa: ['goa', 'palolem', 'agonda', 'fontainhas', 'panjim', 'panaji', 'chapora', 'aguada', 'konkan'],
    jaipur: ['jaipur', 'pink city', 'amber fort', 'amer', 'hawa mahal', 'jantar mantar', 'city palace', 'rajasthan'],
    kashmir: ['kashmir', 'srinagar', 'dal lake', 'shikara', 'gulmarg', 'pahalgam', 'betaab', 'zabarwan'],
    kerala: ['kerala', 'alleppey', 'alappuzha', 'munnar', 'backwaters', 'houseboat', 'kochi', 'fort kochi', 'periyar'],
    meghalaya: ['meghalaya', 'shillong', 'cherrapunji', 'sohra', 'nongriat', 'root bridge', 'dawki', 'umngot', 'nohkalikai'],
    ladakh: ['ladakh', 'leh', 'pangong', 'nubra', 'khardung', 'shanti stupa', 'zanskar', 'turtuk'],
    udaipur: ['udaipur', 'pichola', 'lake palace', 'sajjangarh', 'jagmandir', 'fateh sagar', 'mewar'],
    varanasi: ['varanasi', 'kashi', 'banaras', 'dashashwamedh', 'assi ghat', 'sarnath', 'ganga aarti'],
    rishikesh: ['rishikesh', 'lakshman jhula', 'ram jhula', 'triveni', 'parmarth', 'rafting', 'yoga', 'uttarakhand'],
    andaman: ['andaman', 'havelock', 'swaraj dweep', 'radhanagar', 'neil island', 'port blair', 'cellular jail', 'snorkeling', 'scuba'],
    hampi: ['hampi', 'virupaksha', 'vittala', 'tungabhadra', 'matanga', 'vijayanagara', 'karnataka'],
    coorg: ['coorg', 'kodagu', 'madikeri', 'abbey falls', 'raja seat', 'dubare', 'coffee'],
    amritsar: ['amritsar', 'golden temple', 'harmandir', 'wagah', 'jallianwala', 'punjab'],
    corbett: ['corbett', 'jim corbett', 'dhikala', 'bijrani', 'ramnagar', 'safari', 'tiger'],
    kaziranga: ['kaziranga', 'rhino', 'assam', 'kohora', 'brahmaputra', 'one-horned']
  };

  const SOLO_FRIENDLY_IDS = ['rishikesh', 'manali', 'udaipur', 'hampi', 'goa', 'coorg', 'jaipur'];
  const FAMILY_FRIENDLY_IDS = ['kerala', 'jaipur', 'udaipur', 'andaman', 'kashmir', 'amritsar', 'corbett', 'coorg'];
  const FRIENDS_FRIENDLY_IDS = ['ladakh', 'meghalaya', 'manali', 'goa', 'rishikesh', 'hampi'];

  const DEST_PACKING_PROFILES = {
    alpine: {
      ids: ['ladakh', 'kashmir', 'manali'],
      label: 'Himalayan & High-Altitude Regions',
      groups: [
        {
          title: 'Layered Clothing',
          items: [
            'Moisture-wicking thermal base layers and 2 fleece or wool mid-layers',
            'Windproof, insulated outer jacket for passes and early mornings',
            'Warm beanie, gloves, wool socks, and UV-blocking sunglasses'
          ]
        },
        {
          title: 'Footwear & Trail Gear',
          items: [
            'Broken-in, high-grip trekking or waterproof walking shoes',
            'Daypack (20–30L) with rain cover and insulated water bottle'
          ]
        },
        {
          title: 'Health & Documents',
          items: [
            'SPF 50+ sunscreen, lip balm, moisturizer, and basic altitude/motion meds',
            'Original photo ID (required for Ladakh inner-line & tunnel checkpoints) plus offline maps'
          ]
        }
      ]
    },
    coastal: {
      ids: ['goa', 'andaman', 'kerala'],
      label: 'Coastal, Island & Backwater Regions',
      groups: [
        {
          title: 'Breathable Apparel',
          items: [
            'Lightweight cotton or linen shirts, airy dresses, and quick-dry swimwear',
            'Light rain shell or compact umbrella (especially for Kerala & island showers)',
            'Wide-brim hat and polarized sunglasses'
          ]
        },
        {
          title: 'Footwear & Water Gear',
          items: [
            'Waterproof sandals or reef shoes plus comfortable walking sneakers',
            'Dry pouch for phone/documents during ferry, shikara, or kayak rides'
          ]
        },
        {
          title: 'Skin & Essentials',
          items: [
            'Reef-safe SPF 50 sunscreen, insect repellent for dusk backwaters, and hydration salts',
            'Motion-sickness tablets for Andaman inter-island catamarans'
          ]
        }
      ]
    },
    rainforest: {
      ids: ['meghalaya', 'coorg', 'kaziranga'],
      label: 'Misty Hills, Waterfalls & Rainforests',
      groups: [
        {
          title: 'Weather-Ready Layers',
          items: [
            'Breathable waterproof rain jacket or poncho (avoid bulky non-breathable plastic)',
            'Quick-dry synthetic trekking trousers and extra pairs of dry socks',
            'Light fleece pullover for cool plateau evenings in Shillong or Madikeri'
          ]
        },
        {
          title: 'Footwear & Protection',
          items: [
            'Non-slip trail shoes with deep lugs for wet stone steps (vital for Nongriat root bridges)',
            'Waterproof backpack cover and zip-lock pouches for electronics'
          ]
        },
        {
          title: 'Trail Care',
          items: [
            'Insect repellent, personal first-aid kit with blister plasters, and torch/headlamp',
            'Cash in small denominations for village trail parking and local tea stalls'
          ]
        }
      ]
    },
    heritage: {
      ids: ['jaipur', 'udaipur', 'hampi', 'varanasi', 'amritsar'],
      label: 'Heritage Cities, Forts & Sacred Ghats',
      groups: [
        {
          title: 'Comfortable & Modest Clothing',
          items: [
            'Breathable cotton kurtas/shirts, relaxed trousers, and a light scarf or stole for temple/gurudwara visits',
            'Light sweater or shawl for crisp winter mornings and evening boat rides (Nov–Feb)'
          ]
        },
        {
          title: 'Walking Comfort',
          items: [
            'Cushioned slip-on walking shoes (easy to remove at temples, palaces, and ghats)',
            'Extra pair of socks for warm stone courtyards'
          ]
        },
        {
          title: 'Sun & City Essentials',
          items: [
            'Sunglasses, sun hat, refillable water bottle, and sunscreen',
            'Power bank and small crossbody day bag for bustling bazaar walks'
          ]
        }
      ]
    },
    wildlife: {
      ids: ['corbett', 'kaziranga'],
      label: 'National Parks & Jeep Safaris',
      groups: [
        {
          title: 'Safari Attire',
          items: [
            'Muted, earth-toned layers (olive, khaki, beige, brown) — avoid bright neon colors',
            'Warm fleece, scarf, and windbreaker for 5:30 AM open-jeep morning safaris'
          ]
        },
        {
          title: 'Optics & Gear',
          items: [
            'Binoculars (8x42 recommended) and dust-protective scarf or buff',
            'Closed-toe sturdy walking shoes'
          ]
        },
        {
          title: 'Permits & Care',
          items: [
            'Exact original government photo ID used to book safari zone permits',
            'Insect repellent and fragrance-free sunscreen'
          ]
        }
      ]
    },
    river: {
      ids: ['rishikesh'],
      label: 'River Valleys & Adventure Retreats',
      groups: [
        {
          title: 'Active & Evening Wear',
          items: [
            'Quick-dry athletic wear for rafting/kayaking plus modest layers for evening Ganga Aarti',
            'Light jacket for cool Himalayan river breezes after sunset'
          ]
        },
        {
          title: 'Footwear & Accessories',
          items: [
            'Strapped river sandals (with heel strap) for rafting + walking sneakers for temple trails',
            'Waterproof phone lanyard and reusable water bottle'
          ]
        }
      ]
    }
  };

  const MONTH_MAP = [
    { num: 1, names: ['january', 'jan'], season: 'winter' },
    { num: 2, names: ['february', 'feb'], season: 'winter' },
    { num: 3, names: ['march', 'mar'], season: 'summer' },
    { num: 4, names: ['april', 'apr'], season: 'summer' },
    { num: 5, names: ['may'], season: 'summer' },
    { num: 6, names: ['june', 'jun'], season: 'summer' },
    { num: 7, names: ['july', 'jul'], season: 'monsoon' },
    { num: 8, names: ['august', 'aug'], season: 'monsoon' },
    { num: 9, names: ['september', 'sep', 'sept'], season: 'monsoon' },
    { num: 10, names: ['october', 'oct'], season: 'autumn' },
    { num: 11, names: ['november', 'nov'], season: 'winter' },
    { num: 12, names: ['december', 'dec'], season: 'winter' }
  ];

  const DEST_IDEAL_MONTHS = {
    manali: [3, 4, 5, 6, 10, 11, 12, 1, 2],
    goa: [11, 12, 1, 2, 3],
    jaipur: [10, 11, 12, 1, 2, 3],
    kashmir: [4, 5, 6, 7, 8, 9, 10],
    kerala: [9, 10, 11, 12, 1, 2, 3],
    meghalaya: [10, 11, 12, 1, 2, 3, 4, 5],
    ladakh: [5, 6, 7, 8, 9],
    udaipur: [9, 10, 11, 12, 1, 2, 3],
    varanasi: [10, 11, 12, 1, 2, 3],
    rishikesh: [9, 10, 11, 2, 3, 4, 5],
    andaman: [10, 11, 12, 1, 2, 3, 4, 5],
    hampi: [10, 11, 12, 1, 2],
    coorg: [10, 11, 12, 1, 2, 3, 4, 5],
    amritsar: [10, 11, 12, 1, 2, 3],
    corbett: [11, 12, 1, 2, 3, 4, 5, 6],
    kaziranga: [11, 12, 1, 2, 3, 4]
  };

  // =========================================================================
  // 2. State & Persistence
  // =========================================================================
  const state = {
    messages: [],
    context: {
      travelStyle: 'any', // 'any' | 'solo' | 'family' | 'friends'
      budgetMax: 'any', // 'any' | '12000' | '18000' | '25000'
      season: 'any', // 'any' | 'winter' | 'summer' | 'monsoon' | 'autumn'
      lastDestinationIds: []
    },
    isGenerating: false,
    lastFailedPrompt: ''
  };

  function loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.messages)) {
        state.messages = parsed.messages;
      }
      if (parsed && parsed.context) {
        state.context = {
          ...state.context,
          ...parsed.context,
          lastDestinationIds: Array.isArray(parsed.context.lastDestinationIds)
            ? parsed.context.lastDestinationIds
            : []
        };
      }
    } catch (_err) {
      state.messages = [];
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          messages: state.messages.slice(-40),
          context: state.context
        })
      );
    } catch (_err) {
      // Ignore storage quota errors gracefully
    }
  }

  // =========================================================================
  // 3. Utility Helpers
  // =========================================================================
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatINR(amount) {
    return '₹' + Math.round(Number(amount) || 0).toLocaleString('en-IN');
  }

  function formatTime(isoStr) {
    try {
      const d = isoStr ? new Date(isoStr) : new Date();
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch (_err) {
      return '';
    }
  }

  function showPageToast(message) {
    const toastEl = document.getElementById('toast');
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(showPageToast._timer);
    showPageToast._timer = setTimeout(() => {
      toastEl.hidden = true;
    }, 3400);
  }

  // =========================================================================
  // 4. NLP / Rule-Based Query Parser & Travel Intelligence Engine
  // =========================================================================
  function findMentionedDestinations(queryLower) {
    const matches = [];
    CATALOG.forEach((dest) => {
      const aliases = DEST_ALIASES[dest.id] || [dest.name.toLowerCase()];
      const hit = aliases.some((alias) => {
        const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`\\b${escaped}\\b`, 'i').test(queryLower);
      });
      if (hit) matches.push(dest);
    });
    return matches;
  }

  function parseBudgetFromQuery(queryLower) {
    // Match "15k", "15 k"
    const kMatch = queryLower.match(/(\d+(?:\.\d+)?)\s*k\b/);
    if (kMatch) {
      const val = Math.round(Number(kMatch[1]) * 1000);
      if (val >= 2000 && val <= 500000) return val;
    }

    // Match "₹15,000", "15000", "rs 12000", "inr 18,000"
    const numMatch = queryLower.match(/(?:₹|rs\.?|inr|under|below|within|budget\s*(?:of|is)?|around)?\s*(\d{1,3}(?:,\d{3})+|\d{4,6})/);
    if (numMatch) {
      const raw = Number(numMatch[1].replace(/,/g, ''));
      if (raw >= 3000 && raw <= 500000) return raw;
    }

    if (/\b(cheap|cheapest|budget-friendly|low budget|affordable|economical|shoestring)\b/.test(queryLower)) {
      return 12500;
    }
    if (/\b(mid-range|moderate|balanced)\b/.test(queryLower)) {
      return 18000;
    }
    if (/\b(luxury|premium|comfort|splurge)\b/.test(queryLower)) {
      return 30000;
    }
    return null;
  }

  function parseMonthsOrSeason(queryLower) {
    const matchedMonths = [];
    MONTH_MAP.forEach((m) => {
      const hit = m.names.some((name) => new RegExp(`\\b${name}\\b`, 'i').test(queryLower));
      if (hit) matchedMonths.push(m);
    });

    let season = null;
    if (/\b(winter|cold|snow|december|january|february)\b/.test(queryLower)) season = 'winter';
    else if (/\b(summer|hot|heat|escape heat|april|may|june)\b/.test(queryLower)) season = 'summer';
    else if (/\b(monsoon|rain|rainy|july|august|september)\b/.test(queryLower)) season = 'monsoon';
    else if (/\b(autumn|fall|october|post-monsoon)\b/.test(queryLower)) season = 'autumn';

    return { matchedMonths, season };
  }

  function parseTravelType(queryLower) {
    if (/\b(solo|alone|myself|single traveler|backpacker)\b/.test(queryLower)) return 'solo';
    if (/\b(family|kids|children|parents|elderly|senior|toddler)\b/.test(queryLower)) return 'family';
    if (/\b(friends|group|college|squad|bachelor|buddies)\b/.test(queryLower)) return 'friends';
    return null;
  }

  function parseCategories(queryLower) {
    const cats = [];
    if (/\b(mountain|mountains|hill|hills|himalaya|alpine|snow|valley|trek|trekking)\b/.test(queryLower)) cats.push('Mountains');
    if (/\b(beach|beaches|island|islands|coast|coastal|sea|ocean|snorkeling|scuba)\b/.test(queryLower)) cats.push('Beaches');
    if (/\b(history|historical|heritage|fort|forts|palace|monument|ruins|architecture|museum)\b/.test(queryLower)) cats.push('Historical');
    if (/\b(religious|spiritual|temple|pilgrimage|ghat|ghats|aarti|gurudwara|yoga|meditation)\b/.test(queryLower)) cats.push('Religious');
    if (/\b(adventure|rafting|kayak|expedition|biking|road trip|pass|thrill)\b/.test(queryLower)) cats.push('Adventure');
    if (/\b(nature|waterfall|waterfalls|backwater|tea|coffee|forest|greenery|scenic|peaceful|calm|relax)\b/.test(queryLower)) cats.push('Nature');
    if (/\b(wildlife|safari|tiger|rhino|national park|jungle|bird)\b/.test(queryLower)) cats.push('Wildlife');
    return cats;
  }

  function isPackingQuery(queryLower) {
    return /\b(pack|packing|luggage|carry|clothes|clothing|wear|jacket|shoes|gear|essentials|suitcase|backpack|checklist)\b/.test(queryLower);
  }

  function isBestTimeQuery(queryLower) {
    return /\b(best time|when to visit|when should|weather|season|climate|month|months|monsoon|snowfall|crowd)\b/.test(queryLower);
  }

  function isFoodQuery(queryLower) {
    return /\b(food|eat|dish|dishes|cuisine|restaurant|breakfast|lunch|dinner|street food|try eating)\b/.test(queryLower);
  }

  function isItineraryQuery(queryLower) {
    return /\b(itinerary|day-wise|day by day|days|schedule|plan a|plan trip|weekend|route)\b/.test(queryLower);
  }

  function isGreeting(queryLower) {
    return /^(hi|hello|hey|namaste|good morning|good afternoon|good evening|hola|help|what can you do)[\s!?.]*$/i.test(queryLower.trim());
  }

  function isLikelyOffTopic(queryLower) {
    const travelSignals = /\b(travel|trip|destination|place|visit|india|tour|holiday|vacation|pack|packing|budget|cost|inr|rupee|₹|hotel|stay|train|flight|bus|cab|food|eat|best time|season|month|weather|solo|family|friends|mountain|beach|heritage|wildlife|safari|temple|river|waterfall|island|fort|palace|itinerary|plan|recommend|suggest|where|go|manali|goa|jaipur|kashmir|kerala|meghalaya|ladakh|udaipur|varanasi|rishikesh|andaman|hampi|coorg|amritsar|corbett|kaziranga)\b/i;
    if (travelSignals.test(queryLower)) return false;
    if (queryLower.length < 4) return false;
    const offTopicSignals = /\b(code|python|javascript|react|bitcoin|crypto|stock market|homework|equation|algebra|diagnose|medicine|legal advice)\b/i;
    return offTopicSignals.test(queryLower);
  }

  function filterCatalogByContext(list, effectiveStyle, effectiveBudget, effectiveSeason) {
    let pool = [...list];

    if (effectiveBudget) {
      const under = pool.filter((d) => d.estimatedBudget <= effectiveBudget);
      if (under.length > 0) pool = under;
    }

    if (effectiveStyle === 'solo') {
      const soloMatched = pool.filter((d) => SOLO_FRIENDLY_IDS.includes(d.id));
      if (soloMatched.length > 0) pool = soloMatched;
    } else if (effectiveStyle === 'family') {
      const famMatched = pool.filter((d) => FAMILY_FRIENDLY_IDS.includes(d.id));
      if (famMatched.length > 0) pool = famMatched;
    } else if (effectiveStyle === 'friends') {
      const frMatched = pool.filter((d) => FRIENDS_FRIENDLY_IDS.includes(d.id));
      if (frMatched.length > 0) pool = frMatched;
    }

    if (effectiveSeason && effectiveSeason !== 'any') {
      const seasonMonths = {
        winter: [11, 12, 1, 2],
        summer: [3, 4, 5, 6],
        monsoon: [7, 8, 9],
        autumn: [10]
      }[effectiveSeason] || [];

      if (seasonMonths.length > 0) {
        const seasonal = pool.filter((d) => {
          const ideal = DEST_IDEAL_MONTHS[d.id] || [];
          return seasonMonths.some((m) => ideal.includes(m));
        });
        if (seasonal.length > 0) pool = seasonal;
      }
    }

    return pool;
  }

  function getPackingProfileForDestinations(dests, queryLower) {
    if (dests.length > 0) {
      const id = dests[0].id;
      for (const key of Object.keys(DEST_PACKING_PROFILES)) {
        if (DEST_PACKING_PROFILES[key].ids.includes(id)) {
          return DEST_PACKING_PROFILES[key];
        }
      }
    }
    if (/\b(ladakh|kashmir|manali|cold|snow|winter|mountain|trek)\b/.test(queryLower)) {
      return DEST_PACKING_PROFILES.alpine;
    }
    if (/\b(beach|island|goa|andaman|kerala|swim|tropical)\b/.test(queryLower)) {
      return DEST_PACKING_PROFILES.coastal;
    }
    if (/\b(monsoon|rain|meghalaya|coorg|waterfall)\b/.test(queryLower)) {
      return DEST_PACKING_PROFILES.rainforest;
    }
    if (/\b(safari|wildlife|corbett|kaziranga|jungle)\b/.test(queryLower)) {
      return DEST_PACKING_PROFILES.wildlife;
    }
    if (/\b(jaipur|udaipur|hampi|varanasi|amritsar|temple|fort|heritage)\b/.test(queryLower)) {
      return DEST_PACKING_PROFILES.heritage;
    }
    return null;
  }

  function generateAssistantResponse(rawPrompt) {
    if (!CATALOG.length) {
      throw new Error('Destination catalog is unavailable right now.');
    }

    const query = rawPrompt.trim();
    const queryLower = query.toLowerCase();

    // 1. Greeting
    if (isGreeting(queryLower)) {
      return {
        paragraphs: [
          'Namaste! I am the Yatra Sphere Demo Travel Assistant. I can help you choose among 16 curated Indian destinations, estimate realistic INR budgets, build packing checklists, find the best months to visit, and tailor plans for solo or family travel.'
        ],
        recommendations: CATALOG.slice(0, 3),
        followUps: [
          'Recommend mountains under ₹15,000',
          'Best destinations for a family trip',
          'What should I pack for Kashmir?',
          'Best time to visit Goa & Andaman'
        ]
      };
    }

    // 2. Off-topic polite boundary
    if (isLikelyOffTopic(queryLower)) {
      return {
        paragraphs: [
          'I am focused specifically on travel guidance across India—such as destination ideas, INR budgets, seasonal timing, packing lists, and solo or family route planning.',
          'Try asking one of the travel prompts below to explore routes and estimates.'
        ],
        followUps: [
          'Where can I travel under ₹14,000?',
          'Best solo travel destinations in India',
          'Packing checklist for Ladakh',
          'Best places to visit in December'
        ]
      };
    }

    // Extract signals from query + sidebar context
    const mentionedDests = findMentionedDestinations(queryLower);
    const contextDests =
      mentionedDests.length > 0
        ? mentionedDests
        : state.context.lastDestinationIds
            .map((id) => CATALOG.find((d) => d.id === id))
            .filter(Boolean);

    const queryBudget = parseBudgetFromQuery(queryLower);
    const contextBudgetNum =
      state.context.budgetMax !== 'any' ? Number(state.context.budgetMax) : null;
    const effectiveBudget = queryBudget || contextBudgetNum;

    const queryTravelType = parseTravelType(queryLower);
    const effectiveStyle =
      queryTravelType || (state.context.travelStyle !== 'any' ? state.context.travelStyle : null);

    const { matchedMonths, season: querySeason } = parseMonthsOrSeason(queryLower);
    const effectiveSeason =
      querySeason || (state.context.season !== 'any' ? state.context.season : null);

    const matchedCategories = parseCategories(queryLower);
    const wantsPacking = isPackingQuery(queryLower);
    const wantsBestTime = isBestTimeQuery(queryLower) || matchedMonths.length > 0 || Boolean(querySeason);
    const wantsFood = isFoodQuery(queryLower);
    const wantsItinerary = isItineraryQuery(queryLower);

    // Update remembered destination context if user named one explicitly
    if (mentionedDests.length > 0) {
      state.context.lastDestinationIds = mentionedDests.map((d) => d.id);
    }

    // -----------------------------------------------------------------------
    // Case A: Packing Recommendations
    // -----------------------------------------------------------------------
    if (wantsPacking) {
      const targetDests = mentionedDests.length > 0 ? mentionedDests : contextDests;
      const profile = getPackingProfileForDestinations(targetDests, queryLower);

      if (profile) {
        const destNames = targetDests.length
          ? targetDests.map((d) => d.name).join(' & ')
          : profile.label;

        const seasonAddendum =
          effectiveSeason === 'monsoon'
            ? 'Since you are considering monsoon months, add waterproof zip-pouches for electronics and an extra pair of quick-dry footwear.'
            : effectiveSeason === 'winter'
            ? 'For winter evenings (Nov–Feb), pack thermal socks and an extra windproof mid-layer even in heritage or valley towns.'
            : 'Keep medicines and one change of clothes in your carry-on bag during transit days.';

        return {
          paragraphs: [
            `Here is a tailored packing checklist for ${destNames} (${profile.label}):`,
            seasonAddendum
          ],
          checklists: profile.groups,
          recommendations: targetDests.slice(0, 2),
          followUps: targetDests.length
            ? [
                `Best time to visit ${targetDests[0].name}`,
                `Estimated budget for ${targetDests[0].name}`,
                `Is ${targetDests[0].name} good for ${effectiveStyle || 'solo'} travel?`
              ]
            : [
                'Packing list for coastal Goa or Andaman',
                'Recommend destinations under ₹15,000',
                'Best family vacation spots'
              ]
        };
      }

      // General India packing checklist
      return {
        paragraphs: [
          'For a multi-region trip across India, pack modular layers that adapt easily between warm afternoons, air-conditioned transit, and cooler evenings:'
        ],
        checklists: [
          {
            title: 'Core Apparel & Layers',
            items: [
              '3–4 breathable cotton or linen tops plus 1 light cardigan or fleece',
              '1 compact packable rain jacket or umbrella',
              'A light scarf or shawl for sun, temple etiquette, and cool evening breezes'
            ]
          },
          {
            title: 'Footwear & Daypack',
            items: [
              '1 pair of cushioned walking shoes + 1 pair of slip-on sandals for temples/beaches',
              '20L daypack with refillable water bottle and power bank'
            ]
          },
          {
            title: 'Health & Documents',
            items: [
              'Government photo ID (digital + 1 physical copy), sunscreen, sunglasses, and personal meds',
              'Small cash notes for local markets, auto-rickshaws, and rural cafes'
            ]
          }
        ],
        followUps: [
          'What to pack for Ladakh & Kashmir',
          'Packing list for Meghalaya monsoon',
          'Packing tips for Goa & Andaman'
        ]
      };
    }

    // -----------------------------------------------------------------------
    // Case B: Best Time to Visit (Specific Destination or Specific Month/Season)
    // -----------------------------------------------------------------------
    if (wantsBestTime && (mentionedDests.length > 0 || matchedMonths.length > 0 || querySeason)) {
      if (mentionedDests.length > 0) {
        const dest = mentionedDests[0];
        const paragraphs = mentionedDests.map(
          (d) =>
            `${d.name} (${d.stateRegion}): The best time to visit is ${d.bestTimeToVisit}. ${d.seasonalNote}`
        );

        return {
          paragraphs,
          recommendations: mentionedDests.slice(0, 3),
          followUps: [
            `What should I pack for ${dest.name}?`,
            `Plan a ${dest.recommendedDuration} trip to ${dest.name}`,
            `Local food to try in ${dest.name}`
          ]
        };
      }

      // Month or Season query (e.g., "Best places to visit in December" or "Where to go in monsoon")
      const targetMonthNums =
        matchedMonths.length > 0
          ? matchedMonths.map((m) => m.num)
          : {
              winter: [11, 12, 1, 2],
              summer: [3, 4, 5, 6],
              monsoon: [7, 8, 9],
              autumn: [10]
            }[querySeason] || [10, 11, 12];

      let matching = CATALOG.filter((d) => {
        const ideal = DEST_IDEAL_MONTHS[d.id] || [];
        return targetMonthNums.some((m) => ideal.includes(m));
      });

      if (matchedCategories.length > 0) {
        const catFiltered = matching.filter(
          (d) =>
            matchedCategories.includes(d.category) ||
            (Array.isArray(d.secondaryCategories) &&
              d.secondaryCategories.some((c) => matchedCategories.includes(c)))
        );
        if (catFiltered.length > 0) matching = catFiltered;
      }

      if (effectiveBudget) {
        const budgetFiltered = matching.filter((d) => d.estimatedBudget <= effectiveBudget);
        if (budgetFiltered.length > 0) matching = budgetFiltered;
      }

      const seasonLabel =
        matchedMonths.length > 0
          ? matchedMonths.map((m) => m.names[0].replace(/^\w/, (c) => c.toUpperCase())).join(' & ')
          : (querySeason || 'this season').replace(/^\w/, (c) => c.toUpperCase());

      const picks = matching.slice(0, 4);
      state.context.lastDestinationIds = picks.map((d) => d.id);

      const detailLines = picks.map(
        (d) => `• ${d.name} (${d.bestTimeToVisit}): ${d.seasonalNote}`
      );

      return {
        paragraphs: [
          `For ${seasonLabel}, these curated Indian destinations offer the clearest weather and road access:`,
          ...detailLines
        ],
        recommendations: picks,
        followUps: [
          `Packing list for ${picks[0] ? picks[0].name : 'this trip'}`,
          `Show options under ₹15,000 for ${seasonLabel}`,
          'Compare family vs solo options'
        ]
      };
    }

    // -----------------------------------------------------------------------
    // Case C: Local Food Query
    // -----------------------------------------------------------------------
    if (wantsFood && (mentionedDests.length > 0 || contextDests.length > 0)) {
      const target = mentionedDests[0] || contextDests[0];
      const foodLines = target.localFood.map((f) => `• ${f.name}: ${f.note}`);
      return {
        paragraphs: [
          `Must-try regional dishes in ${target.name} (${target.stateRegion}):`,
          ...foodLines,
          `Best paired with ${target.touristAttractions[0].name} or an unhurried evening walk in the local market.`
        ],
        recommendations: [target],
        followUps: [
          `Best time to visit ${target.name}`,
          `What to pack for ${target.name}`,
          `Estimate budget for ${target.name}`
        ]
      };
    }

    // -----------------------------------------------------------------------
    // Case D: Explicit Destination Deep Dive (and optional Itinerary Outline)
    // -----------------------------------------------------------------------
    if (mentionedDests.length > 0 && !queryBudget && !queryTravelType && matchedCategories.length === 0) {
      const dest = mentionedDests[0];
      const attractionsSummary = dest.touristAttractions
        .slice(0, 3)
        .map((a) => `${a.name} (${a.note})`)
        .join(' · ');

      const paragraphs = [
        `${dest.name}, ${dest.stateRegion} — ${dest.overview}`,
        `Key highlights: ${attractionsSummary}`,
        `Indicative Budget: ${dest.budgetLabel} per traveler for ${dest.recommendedDuration} (${dest.budgetBreakdown}). Best visited during ${dest.bestTimeToVisit}.`
      ];

      if (wantsItinerary) {
        paragraphs.push(
          `Suggested flow: Start Day 1 with ${dest.touristAttractions[0].name} and ${dest.localFood[0].name}; dedicate Day 2 to ${dest.touristAttractions[1].name}; and pair Day 3 with ${dest.nearbyAttractions[0].name} (${dest.nearbyAttractions[0].distance}). Click "Plan Trip" on the card below to customize a full day-by-day schedule.`
        );
      }

      if (effectiveStyle === 'solo') {
        const isSoloTop = SOLO_FRIENDLY_IDS.includes(dest.id);
        paragraphs.push(
          isSoloTop
            ? `Solo travel note: ${dest.name} is very welcoming for solo travelers—stay in a central walkable neighborhood and book daytime shared transfers.`
            : `Solo travel note: ${dest.name} is rewarding solo if you pre-book reputable central stays and daytime local transport.`
        );
      } else if (effectiveStyle === 'family') {
        paragraphs.push(
          `Family travel note: Plan 1–2 major stops per day in ${dest.name} with a dedicated cab and midday rest breaks so everyone travels comfortably.`
        );
      }

      return {
        paragraphs,
        recommendations: mentionedDests.slice(0, 3),
        followUps: [
          `What should I pack for ${dest.name}?`,
          `Best time to visit ${dest.name}`,
          `Local food in ${dest.name}`,
          `Alternatives under ${formatINR(dest.estimatedBudget)}`
        ]
      };
    }

    // -----------------------------------------------------------------------
    // Case E: Family / Solo / Friends Travel Recommendations
    // -----------------------------------------------------------------------
    if (queryTravelType && matchedCategories.length === 0 && !queryBudget) {
      const filtered = filterCatalogByContext(CATALOG, queryTravelType, effectiveBudget, effectiveSeason);
      const picks = filtered.slice(0, 4);
      state.context.lastDestinationIds = picks.map((d) => d.id);

      if (queryTravelType === 'solo') {
        return {
          paragraphs: [
            'For solo travel in India, look for walkable neighborhoods, reliable daytime connectivity, and welcoming boutique stays or hostels.',
            'Top solo-friendly recommendations from our catalog (paired with your current filters):',
            ...picks.map((d) => `• ${d.name} (${d.stateRegion}): ${d.summary} Indicative budget: ${d.budgetLabel} (${d.recommendedDuration}).`)
          ],
          recommendations: picks,
          followUps: [
            'Solo trips under ₹12,000',
            `Packing list for ${picks[0] ? picks[0].name : 'Manali'}`,
            'Compare solo vs family pacing'
          ]
        };
      }

      if (queryTravelType === 'family') {
        return {
          paragraphs: [
            'For comfortable family vacations, prioritize smooth road/flight access, unhurried 2-stop days, and multi-generational appeal (boat rides, palaces, beaches, or gentle nature trails).',
            'Top family-friendly recommendations:',
            ...picks.map((d) => `• ${d.name} (${d.stateRegion}): ${d.recommendedDuration}, est. ${d.budgetLabel}/person. Best time: ${d.bestTimeToVisit}.`)
          ],
          recommendations: picks,
          followUps: [
            'Family trips under ₹15,000 per person',
            `Best time to visit ${picks[0] ? picks[0].name : 'Kerala'}`,
            `What to pack for ${picks[0] ? picks[0].name : 'Kerala'}`
          ]
        };
      }

      return {
        paragraphs: [
          'For traveling with friends, shared cab routes, scenic adventure circuits, and lively evening food districts stretch your budget furthest.',
          'Top picks for a friends trip:',
          ...picks.map((d) => `• ${d.name} (${d.stateRegion}): ${d.recommendedDuration} · est. ${d.budgetLabel}/person.`)
        ],
        recommendations: picks,
        followUps: [
          'Group mountain trips under ₹16,000',
          'Packing checklist for Ladakh',
          'Best time for Goa & Rishikesh'
        ]
      };
    }

    // -----------------------------------------------------------------------
    // Case F: Budget-Based & Category / Multi-Filter Discovery
    // -----------------------------------------------------------------------
    let pool = [...CATALOG];

    if (matchedCategories.length > 0) {
      const catPool = pool.filter(
        (d) =>
          matchedCategories.includes(d.category) ||
          (Array.isArray(d.secondaryCategories) &&
            d.secondaryCategories.some((c) => matchedCategories.includes(c)))
      );
      if (catPool.length > 0) pool = catPool;
    }

    if (effectiveBudget) {
      const budgetPool = pool
        .filter((d) => d.estimatedBudget <= effectiveBudget)
        .sort((a, b) => a.estimatedBudget - b.estimatedBudget);

      if (budgetPool.length > 0) {
        pool = filterCatalogByContext(budgetPool, effectiveStyle, null, effectiveSeason);
        const picks = pool.slice(0, 4);
        state.context.lastDestinationIds = picks.map((d) => d.id);

        return {
          paragraphs: [
            `Here are the best-matching destinations within ${formatINR(effectiveBudget)} per traveler${effectiveStyle ? ` for ${effectiveStyle} travel` : ''}:`,
            ...picks.map(
              (d) => `• ${d.name} (${d.stateRegion}) — Est. ${d.budgetLabel} for ${d.recommendedDuration} (${d.budgetBreakdown}).`
            ),
            'Budget tip: Travel in shoulder months, book overnight trains or early buses, and choose central guesthouses near major sights to reduce daily cab spend.'
          ],
          recommendations: picks,
          followUps: [
            `What to pack for ${picks[0].name}`,
            `Best time to visit ${picks[0].name}`,
            'Show destinations under ₹11,000'
          ]
        };
      }

      // If budget is very tight (< lowest catalog entry)
      const lowest = [...CATALOG].sort((a, b) => a.estimatedBudget - b.estimatedBudget).slice(0, 3);
      state.context.lastDestinationIds = lowest.map((d) => d.id);
      return {
        paragraphs: [
          `A ${formatINR(effectiveBudget)} budget is tight for a full 4–5 day multi-stop itinerary, but you can easily enjoy a 2–3 day getaway to our lowest-cost destinations using overnight trains and budget homestays:`,
          ...lowest.map(
            (d) => `• ${d.name} (${d.stateRegion}) — Standard 3–4 day guide is ${d.budgetLabel}, or ~${formatINR(Math.round(d.estimatedBudget * 0.72))} for a shorter 2-night trip.`
          )
        ],
        recommendations: lowest,
        followUps: [
          `Best time to visit ${lowest[0].name}`,
          `Packing tips for ${lowest[0].name}`,
          'Compare trips under ₹12,000'
        ]
      };
    }

    // Category or general travel recommendation
    pool = filterCatalogByContext(pool, effectiveStyle, effectiveBudget, effectiveSeason);
    const picks = pool.slice(0, 4);
    state.context.lastDestinationIds = picks.map((d) => d.id);

    const catText = matchedCategories.length > 0 ? matchedCategories.join(' & ') : 'curated';
    const styleText = effectiveStyle ? ` tailored for ${effectiveStyle} travelers` : '';

    return {
      paragraphs: [
        `Based on your interest in ${catText.toLowerCase()} travel${styleText}, here are top regions from Yatra Sphere’s catalog:`,
        ...picks.map(
          (d) => `• ${d.name} (${d.stateRegion}) — ${d.recommendedDuration}, est. ${d.budgetLabel}/person. Best time: ${d.bestTimeToVisit}.`
        ),
        'You can ask me for a packing checklist, seasonal breakdown, or open any destination directly in the Trip Planner.'
      ],
      recommendations: picks,
      followUps: [
        `What to pack for ${picks[0] ? picks[0].name : 'this trip'}`,
        `Best time to visit ${picks[0] ? picks[0].name : 'Kashmir'}`,
        'Compare options under ₹14,000'
      ]
    };
  }

  // =========================================================================
  // 5. Render Rich Message Bubbles
  // =========================================================================
  function renderRecommendationCardsHtml(destinations) {
    if (!Array.isArray(destinations) || destinations.length === 0) return '';
    return `
      <div class="chat-rec-grid">
        ${destinations
          .map(
            (dest) => `
            <article class="chat-rec-card">
              <div class="chat-rec-media">
                <div class="media-fallback" aria-hidden="true"><span>${escapeHtml(dest.name)}</span></div>
                <img src="${escapeHtml(dest.image)}" alt="${escapeHtml(dest.alt)}" loading="lazy" referrerpolicy="no-referrer" />
              </div>
              <div class="chat-rec-body">
                <p class="chat-rec-meta">${escapeHtml(dest.stateRegion)} &middot; ${escapeHtml(dest.bestTimeToVisit)}</p>
                <h4 class="chat-rec-title">${escapeHtml(dest.name)}</h4>
                <p class="chat-rec-stat">${escapeHtml(dest.recommendedDuration)} &middot; Est. ${escapeHtml(dest.budgetLabel)}</p>
                <div class="chat-rec-links">
                  <a href="explore.html?dest=${encodeURIComponent(dest.id)}" class="chat-rec-link">View Guide</a>
                  <a href="planner.html?dest=${encodeURIComponent(dest.name)}" class="chat-rec-link primary">Plan Trip &rarr;</a>
                </div>
              </div>
            </article>
          `
          )
          .join('')}
      </div>
    `;
  }

  function renderChecklistHtml(groups) {
    if (!Array.isArray(groups) || groups.length === 0) return '';
    return `
      <div class="chat-checklist-grid">
        ${groups
          .map(
            (group) => `
            <div class="chat-checklist-group">
              <h4 class="chat-checklist-title">${escapeHtml(group.title)}</h4>
              <ul class="chat-checklist-items">
                ${group.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
              </ul>
            </div>
          `
          )
          .join('')}
      </div>
    `;
  }

  function renderFollowUpsHtml(followUps) {
    if (!Array.isArray(followUps) || followUps.length === 0) return '';
    return `
      <div class="chat-followups" aria-label="Suggested follow-up questions">
        ${followUps
          .map(
            (q) =>
              `<button type="button" class="chat-followup-btn" data-suggested-prompt="${escapeHtml(q)}">${escapeHtml(q)}</button>`
          )
          .join('')}
      </div>
    `;
  }

  function buildMessageBubbleHtml(msg) {
    const timeLabel = formatTime(msg.timestamp);
    if (msg.role === 'user') {
      return `
        <div class="chat-bubble-row user">
          <div class="chat-bubble user">
            <div class="chat-bubble-header">
              <span>You</span>
              ${timeLabel ? `<span aria-hidden="true">&middot;</span><span>${escapeHtml(timeLabel)}</span>` : ''}
            </div>
            <p class="chat-bubble-text">${escapeHtml(msg.text)}</p>
          </div>
        </div>
      `;
    }

    if (msg.isError) {
      return `
        <div class="chat-bubble-row assistant">
          <div class="chat-bubble assistant error-state">
            <div class="chat-bubble-header">
              <span>Yatra Sphere Assistant</span>
              <span aria-hidden="true">&middot;</span>
              <span>Error</span>
            </div>
            <p class="chat-bubble-text">${escapeHtml(msg.text)}</p>
            ${
              msg.retryPrompt
                ? `<div class="chat-followups"><button type="button" class="chat-followup-btn" data-retry-prompt="${escapeHtml(msg.retryPrompt)}">Retry Request</button></div>`
                : ''
            }
          </div>
        </div>
      `;
    }

    const payload = msg.payload || {};
    const paragraphsHtml = (payload.paragraphs || [msg.text || ''])
      .map((p) => `<p class="chat-bubble-text">${escapeHtml(p)}</p>`)
      .join('');

    return `
      <div class="chat-bubble-row assistant">
        <div class="chat-bubble assistant">
          <div class="chat-bubble-header">
            <span>Yatra Sphere Assistant</span>
            <span aria-hidden="true">&middot;</span>
            <span>Demo Guide</span>
            ${timeLabel ? `<span aria-hidden="true">&middot;</span><span>${escapeHtml(timeLabel)}</span>` : ''}
          </div>
          ${paragraphsHtml}
          ${renderChecklistHtml(payload.checklists)}
          ${renderRecommendationCardsHtml(payload.recommendations)}
          ${renderFollowUpsHtml(payload.followUps)}
        </div>
      </div>
    `;
  }

  function createWelcomeMessage() {
    return {
      id: `msg_welcome_${Date.now()}`,
      role: 'assistant',
      timestamp: new Date().toISOString(),
      payload: {
        paragraphs: [
          'Namaste! Welcome to the Yatra Sphere AI Travel Assistant (Rule-Based Demo Mode). Ask me for destination recommendations, INR budget options, packing checklists, best months to visit, or solo and family travel ideas across India.'
        ],
        followUps: [
          'Recommend mountains under ₹15,000',
          'Best destinations for a family trip',
          'Safe solo travel ideas in India',
          'What should I pack for Ladakh?'
        ]
      }
    };
  }

  // =========================================================================
  // 6. Initialize Controller (Full Page OR Floating Drawer)
  // =========================================================================
  loadHistory();
  if (state.messages.length === 0) {
    state.messages.push(createWelcomeMessage());
  }

  const isDedicatedPage = document.body.classList.contains('page-assistant');

  // If on index.html, explore.html, or planner.html, inject floating quick assistant
  if (!isDedicatedPage) {
    const widgetHost = document.createElement('div');
    widgetHost.className = 'assistant-floating-root no-print';
    widgetHost.innerHTML = `
      <button
        type="button"
        class="assistant-fab"
        id="assistant-fab-btn"
        aria-expanded="false"
        aria-controls="assistant-drawer"
        aria-label="Open Yatra Sphere Travel Assistant"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span>Travel Assistant</span>
      </button>

      <section
        class="assistant-drawer"
        id="assistant-drawer"
        role="dialog"
        aria-label="Yatra Sphere Travel Assistant"
        hidden
      >
        <header class="assistant-drawer-header">
          <div>
            <h2 class="assistant-drawer-title">Yatra Sphere Assistant</h2>
            <p class="assistant-drawer-sub">Demo Mode &middot; 16 Indian Regions</p>
          </div>
          <div class="assistant-drawer-actions">
            <a href="assistant.html" class="assistant-drawer-link">Full View</a>
            <button type="button" class="assistant-drawer-clear" id="clear-chat-btn">Clear</button>
            <button type="button" class="assistant-drawer-close" id="assistant-drawer-close" aria-label="Close assistant">&times;</button>
          </div>
        </header>

        <div class="chat-messages assistant-drawer-messages" id="chat-messages" role="log" aria-live="polite"></div>

        <div class="chat-composer-area assistant-drawer-composer">
          <div class="chat-error-banner" id="chat-error-banner" role="alert" hidden>
            <span id="chat-error-text"></span>
            <button type="button" class="btn-link chat-error-retry" id="chat-retry-btn" hidden>Retry</button>
          </div>
          <form class="chat-composer-form" id="chat-composer-form" novalidate>
            <label for="chat-input" class="sr-only">Ask the Travel Assistant</label>
            <textarea
              id="chat-input"
              class="chat-input"
              rows="1"
              maxlength="600"
              placeholder="Ask about destinations, INR budgets, packing..."
              autocomplete="off"
            ></textarea>
            <button type="submit" class="btn btn-primary chat-send-btn" id="chat-send-btn">Send</button>
          </form>
        </div>
      </section>
    `;
    document.body.appendChild(widgetHost);

    const fabBtn = document.getElementById('assistant-fab-btn');
    const drawerEl = document.getElementById('assistant-drawer');
    const drawerCloseBtn = document.getElementById('assistant-drawer-close');

    function setDrawerOpen(open) {
      if (!drawerEl || !fabBtn) return;
      drawerEl.hidden = !open;
      fabBtn.setAttribute('aria-expanded', String(open));
      if (open) {
        scrollMessagesToBottom();
        const inputEl = document.getElementById('chat-input');
        if (inputEl) inputEl.focus();
      }
    }

    if (fabBtn) {
      fabBtn.addEventListener('click', () => {
        const isOpen = fabBtn.getAttribute('aria-expanded') === 'true';
        setDrawerOpen(!isOpen);
      });
    }

    if (drawerCloseBtn) {
      drawerCloseBtn.addEventListener('click', () => setDrawerOpen(false));
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && drawerEl && !drawerEl.hidden) {
        setDrawerOpen(false);
        if (fabBtn) fabBtn.focus();
      }
    });
  }

  // Bind shared DOM elements (present in either assistant.html or injected drawer)
  const messagesEl = document.getElementById('chat-messages');
  const formEl = document.getElementById('chat-composer-form');
  const inputEl = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send-btn');
  const clearBtn = document.getElementById('clear-chat-btn');
  const errorBanner = document.getElementById('chat-error-banner');
  const errorText = document.getElementById('chat-error-text');
  const retryBtn = document.getElementById('chat-retry-btn');

  // Dedicated page context controls
  const styleButtons = document.querySelectorAll('[data-context-style]');
  const budgetSelect = document.getElementById('context-budget-select');
  const seasonSelect = document.getElementById('context-season-select');

  function syncContextControls() {
    styleButtons.forEach((btn) => {
      const active = btn.dataset.contextStyle === state.context.travelStyle;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    if (budgetSelect) budgetSelect.value = state.context.budgetMax || 'any';
    if (seasonSelect) seasonSelect.value = state.context.season || 'any';
  }

  styleButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      state.context.travelStyle = btn.dataset.contextStyle || 'any';
      syncContextControls();
      saveHistory();
      showPageToast(`Assistant travel style set to ${state.context.travelStyle === 'any' ? 'Any' : state.context.travelStyle}.`);
    });
  });

  if (budgetSelect) {
    budgetSelect.addEventListener('change', () => {
      state.context.budgetMax = budgetSelect.value;
      saveHistory();
    });
  }

  if (seasonSelect) {
    seasonSelect.addEventListener('change', () => {
      state.context.season = seasonSelect.value;
      saveHistory();
    });
  }

  syncContextControls();

  function showChatError(message, canRetry = false) {
    if (!errorBanner || !errorText) return;
    errorText.textContent = message;
    errorBanner.hidden = false;
    if (retryBtn) retryBtn.hidden = !canRetry;
  }

  function clearChatError() {
    if (!errorBanner) return;
    errorBanner.hidden = true;
    if (errorText) errorText.textContent = '';
    if (retryBtn) retryBtn.hidden = true;
  }

  function scrollMessagesToBottom() {
    if (!messagesEl) return;
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function renderAllMessages() {
    if (!messagesEl) return;
    const bubblesHtml = state.messages.map(buildMessageBubbleHtml).join('');
    const loadingHtml = state.isGenerating
      ? `
        <div class="chat-bubble-row assistant" id="chat-loading-row">
          <div class="chat-bubble assistant loading">
            <div class="chat-bubble-header">
              <span>Yatra Sphere Assistant</span>
              <span aria-hidden="true">&middot;</span>
              <span>Preparing guide</span>
            </div>
            <div class="typing-indicator" role="status" aria-label="Assistant is typing">
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-label">Checking destinations, seasons, and INR budgets...</span>
            </div>
          </div>
        </div>
      `
      : '';

    messagesEl.innerHTML = bubblesHtml + loadingHtml;
    scrollMessagesToBottom();
  }

  async function submitUserMessage(rawText) {
    if (state.isGenerating) return;
    clearChatError();

    const trimmed = String(rawText || '').trim();
    if (!trimmed) {
      showChatError('Please enter a travel question before sending.');
      if (inputEl) inputEl.focus();
      return;
    }

    if (trimmed.length > MAX_INPUT_CHARS) {
      showChatError(`Please keep questions under ${MAX_INPUT_CHARS} characters.`);
      if (inputEl) inputEl.focus();
      return;
    }

    const userMsg = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      timestamp: new Date().toISOString(),
      text: trimmed
    };

    state.messages.push(userMsg);
    state.isGenerating = true;
    state.lastFailedPrompt = '';
    if (inputEl) {
      inputEl.value = '';
      inputEl.style.height = 'auto';
    }
    if (sendBtn) sendBtn.disabled = true;

    renderAllMessages();
    saveHistory();

    try {
      // Simulate brief async processing for smooth loading feedback
      await new Promise((resolve) => setTimeout(resolve, 480));
      const payload = generateAssistantResponse(trimmed);
      state.messages.push({
        id: `msg_bot_${Date.now()}`,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        payload
      });

      const supa = window.YatraSupabase;
      if (supa && supa.isAuthenticated() && supa.rest) {
        const sess = supa.auth.getSession();
        const responseSummary = Array.isArray(payload.paragraphs) ? payload.paragraphs.join(' ') : 'Travel guidance provided.';
        supa.rest
          .insert('chat_history', [
            {
              user_id: sess.user.id,
              message: trimmed,
              response: responseSummary
            }
          ])
          .catch(() => {});
      }
    } catch (err) {
      state.lastFailedPrompt = trimmed;
      const errMsg = err && err.message ? err.message : 'Unable to generate a travel response right now.';
      showChatError(errMsg, true);
      state.messages.push({
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        isError: true,
        text: `${errMsg} Please try again or choose a suggested travel question.`,
        retryPrompt: trimmed
      });
    } finally {
      state.isGenerating = false;
      if (sendBtn) sendBtn.disabled = false;
      renderAllMessages();
      saveHistory();
      if (inputEl) inputEl.focus();
    }
  }

  function clearConversation() {
    if (state.isGenerating) return;
    clearChatError();
    state.context.lastDestinationIds = [];
    state.messages = [createWelcomeMessage()];
    saveHistory();
    renderAllMessages();
    const supa = window.YatraSupabase;
    if (supa && supa.isAuthenticated() && supa.rest) {
      const sess = supa.auth.getSession();
      if (sess && sess.user) {
        supa.rest.remove('chat_history', `user_id=eq.${encodeURIComponent(sess.user.id)}`).catch(() => {});
      }
    }
    showPageToast('Cleared chat history.');
    if (inputEl) inputEl.focus();
  }

  if (formEl) {
    formEl.addEventListener('submit', (event) => {
      event.preventDefault();
      submitUserMessage(inputEl ? inputEl.value : '');
    });
  }

  if (inputEl) {
    inputEl.addEventListener('input', () => {
      clearChatError();
      inputEl.style.height = 'auto';
      inputEl.style.height = `${Math.min(inputEl.scrollHeight, 132)}px`;
    });

    inputEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        submitUserMessage(inputEl.value);
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', clearConversation);
  }

  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      if (state.lastFailedPrompt) {
        submitUserMessage(state.lastFailedPrompt);
      }
    });
  }

  // Delegate clicks on suggested prompts (sidebar, mobile strip, inline follow-ups) and retry buttons
  document.addEventListener('click', (event) => {
    const promptBtn = event.target.closest('[data-suggested-prompt]');
    if (promptBtn) {
      const prompt = promptBtn.dataset.suggestedPrompt;
      if (prompt) submitUserMessage(prompt);
      return;
    }

    const bubbleRetryBtn = event.target.closest('[data-retry-prompt]');
    if (bubbleRetryBtn) {
      const prompt = bubbleRetryBtn.dataset.retryPrompt;
      if (prompt) submitUserMessage(prompt);
    }
  });

  // Initial render
  renderAllMessages();

  // Support optional ?ask=... query parameter on assistant.html
  if (isDedicatedPage) {
    const params = new URLSearchParams(window.location.search);
    const initialAsk = params.get('ask');
    if (initialAsk && initialAsk.trim()) {
      submitUserMessage(initialAsk.trim());
    }
  }
});
