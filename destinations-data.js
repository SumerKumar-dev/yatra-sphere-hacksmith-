/**
 * Yatra Sphere — Shared Indian Destinations Catalog (16 Destinations)
 * Pure Vanilla JavaScript data module attached to window.YATRA_DESTINATIONS
 * so it works both over file:// and HTTP servers without any build process.
 */

(function (global) {
  'use strict';

  const DESTINATIONS = [
    {
      id: 'manali',
      name: 'Manali',
      stateRegion: 'Himachal Pradesh',
      category: 'Mountains',
      secondaryCategories: ['Adventure', 'Nature'],
      image: 'src/assets/images/dest_manali_1795160234518.jpg',
      alt: 'Pine forests along the Beas river and snow-capped Himalayan peaks in Manali',
      summary: 'Cedar-lined river valleys, high-altitude passes, and crisp alpine air ideal for slow mountain retreats and scenic treks.',
      overview: 'Set at the northern end of the Kullu Valley, Manali pairs rushing glacial waters of the Beas River with fragrant deodar forests and dramatic Himalayan passes. From quiet wooden homestays in Old Manali to high-altitude crossings through the Atal Tunnel into Lahaul, it rewards both unhurried travelers and mountain trekkers.',
      estimatedBudget: 14500,
      budgetLabel: '₹14,500',
      budgetBreakdown: '4 nights mid-range stay, local cab transfers & sightseeing (indicative sample)',
      recommendedDuration: '4–5 Days',
      bestTimeToVisit: 'October – June',
      seasonalNote: 'March–June brings pleasant valley weather and clear mountain passes; December–February offers snowfall around Solang and Sethan.',
      touristAttractions: [
        { name: 'Hadimba Devi Temple', note: '16th-century cedar pagoda set inside peaceful Dhungri forest.' },
        { name: 'Solang Valley', note: 'Alpine meadow framed by glaciers, cable car viewpoints, and winter snow.' },
        { name: 'Atal Tunnel & Sissu', note: 'Engineering marvel opening directly into Lahaul’s stark waterfall valley.' },
        { name: 'Old Manali & Manu Temple', note: 'Walkable village lanes with timber architecture and riverside cafes.' }
      ],
      localFood: [
        { name: 'Himachali Siddu', note: 'Steamed wheat bun stuffed with spiced walnut and poppy seed paste, served with ghee.' },
        { name: 'Fresh River Trout', note: 'Locally farmed Kullu trout pan-seared with herbs and mountain garlic.' },
        { name: 'Dham Platter', note: 'Traditional festive slow-cooked rice, madra yogurt curry, and lentil dishes.' }
      ],
      nearbyAttractions: [
        { name: 'Naggar Castle & Roerich Gallery', distance: '21 km south' },
        { name: 'Vashisht Hot Water Springs', distance: '4 km north' },
        { name: 'Kasol & Parvati Valley', distance: '75 km southeast' }
      ],
      keywords: 'manali himachal mountains snow valley beas river trekking solang'
    },
    {
      id: 'goa',
      name: 'Goa',
      stateRegion: 'Konkan Coast',
      category: 'Beaches',
      secondaryCategories: ['Historical', 'Adventure'],
      image: 'src/assets/images/dest_goa_1795160234653.jpg',
      alt: 'Palm-fringed golden beach in South Goa beside calm Arabian Sea waves at sunset',
      summary: 'Sun-warmed coastal coves, palm groves, and quiet Latin quarters blending laid-back shore mornings with vibrant evening dining.',
      overview: 'Stretching along the Arabian Sea, Goa balances tranquil crescent bays in the south with centuries-old Indo-Portuguese architecture, red-laterite cliff forts, and spice-scented river islands. Morning swims give way to unhurried walks through pastel lanes in Fontainhas.',
      estimatedBudget: 13000,
      budgetLabel: '₹13,000',
      budgetBreakdown: '4 days coastal guesthouse, scooter/cab transit & meals (indicative sample)',
      recommendedDuration: '3–4 Days',
      bestTimeToVisit: 'November – March',
      seasonalNote: 'Cool sea breezes and clear sunsets peak from November to February; June–September brings lush monsoon greenery inland.',
      touristAttractions: [
        { name: 'Palolem & Agonda Beaches', note: 'Calm crescent shorelines ideal for sunset walks and gentle kayaking.' },
        { name: 'Fontainhas Latin Quarter', note: 'Ochre and indigo heritage houses along quiet cobbled Panjim streets.' },
        { name: 'Chapora & Aguada Forts', note: 'Coastal laterite battlements with sweeping views over river estuaries.' },
        { name: 'Basilica of Bom Jesus', note: 'UNESCO-listed 17th-century red-laterite church in Old Goa.' }
      ],
      localFood: [
        { name: 'Goan Fish Curry & Rice', note: 'Tangy coconut, kokum, and Kashmiri chili curry with local red rice.' },
        { name: 'Bebinca', note: 'Traditional seven-layered coconut milk and cardamom dessert.' },
        { name: 'Poi with Cafreal', note: 'Wood-fired local bread paired with fresh green herb and spice marinade.' }
      ],
      nearbyAttractions: [
        { name: 'Divar Island Ferry Trail', distance: '12 km from Panjim' },
        { name: 'Dudhsagar Waterfalls', distance: '60 km inland' },
        { name: 'Gokarna Coastal Cliffs', distance: '140 km south' }
      ],
      keywords: 'goa beach coast arabian sea sunset palms konkan palolem panjim'
    },
    {
      id: 'jaipur',
      name: 'Jaipur',
      stateRegion: 'Rajasthan',
      category: 'Historical',
      secondaryCategories: ['Religious'],
      image: 'src/assets/images/dest_jaipur_1795160234828.jpg',
      alt: 'Amber Fort sandstone palace walls illuminated above calm Maota Lake in Jaipur',
      summary: 'Hilltop sandstone citadels, astronomical monuments, and living artisan courtyards painted in warm terracotta and twilight gold.',
      overview: 'Planned in 1727 with geometric precision, Jaipur unites Rajput military engineering and refined courtyard palaces. Amber Fort crowns the Aravalli ridge above Maota Lake, while the walled Pink City hums with block-printers, jewelers, and centuries-old astronomical instruments.',
      estimatedBudget: 12000,
      budgetLabel: '₹12,000',
      budgetBreakdown: '3–4 days heritage haveli stay, monument entries & city transit (indicative sample)',
      recommendedDuration: '3–4 Days',
      bestTimeToVisit: 'October – March',
      seasonalNote: 'Crisp winter mornings make hilltop fort climbs comfortable; avoid peak afternoon sun between April and June.',
      touristAttractions: [
        { name: 'Amber Fort & Maota Lake', note: 'Sweeping sandstone ramparts, Sheesh Mahal mirror work, and lakeside reflections.' },
        { name: 'Hawa Mahal', note: 'Five-story honeycomb sandstone facade engineered for cooling street breezes.' },
        { name: 'Jantar Mantar', note: 'UNESCO astronomical observatory housing the world’s largest stone sundial.' },
        { name: 'City Palace Courtyards', note: 'Ornate Peacock Gate and textile museum in the heart of the walled city.' }
      ],
      localFood: [
        { name: 'Dal Baati Churma', note: 'Baked wheat spheres dipped in ghee with spiced lentils and sweet crushed wheat.' },
        { name: 'Pyaaz Kachori', note: 'Flaky spiced onion pastry served hot in morning bazaars.' },
        { name: 'Ghevar', note: 'Crisp honeycomb disc sweet soaked in saffron syrup and topped with rabri.' }
      ],
      nearbyAttractions: [
        { name: 'Panna Meena ka Kund Stepwell', distance: '11 km north' },
        { name: 'Nahargarh Fort Sunset Ridge', distance: '15 km northwest' },
        { name: 'Abhaneri Chand Baori Stepwell', distance: '95 km east' }
      ],
      keywords: 'jaipur rajasthan heritage history fort palace amber architecture pink city'
    },
    {
      id: 'kashmir',
      name: 'Kashmir',
      stateRegion: 'Srinagar & Gulmarg',
      category: 'Mountains',
      secondaryCategories: ['Nature'],
      image: 'src/assets/images/dest_kashmir_1795160234553.jpg',
      alt: 'Traditional wooden shikara boat resting on serene Dal Lake with misty Zabarwan mountains in Kashmir',
      summary: 'Mirror-calm lakes framed by misty Zabarwan ridges, walnut groves, and alpine meadows crafted for unhurried exploration.',
      overview: 'From dawn shikara glides past floating vegetable gardens on Dal Lake to pine-scented pastures in Pahalgam and high alpine ridges in Gulmarg, the Kashmir Valley shifts effortlessly between serene water culture and dramatic Himalayan elevation.',
      estimatedBudget: 21500,
      budgetLabel: '₹21,500',
      budgetBreakdown: '5 nights houseboat/hotel stay, valley cab circuit & gondola guide (indicative sample)',
      recommendedDuration: '5–6 Days',
      bestTimeToVisit: 'April – October',
      seasonalNote: 'April brings tulip blooms; May–September offers emerald meadows; January–February transforms Gulmarg into deep winter snow.',
      touristAttractions: [
        { name: 'Dal & Nigeen Lakes', note: 'Hand-carved cedar houseboats and quiet sunrise shikara rides.' },
        { name: 'Gulmarg Gondola Ridge', note: 'High-altitude cable ascent overlooking Apharwat snow peaks.' },
        { name: 'Mughal Gardens (Nishat & Shalimar)', note: 'Terraced chinar-shaded lawns cascading toward Dal Lake.' },
        { name: 'Pahalgam & Betaab Valley', note: 'Clear Lidder river rapids framed by towering pine slopes.' }
      ],
      localFood: [
        { name: 'Kashmiri Kahwa', note: 'Fragrant green tea brewed with saffron strands, cardamom, and slivered almonds.' },
        { name: 'Rogan Josh & Yakhni', note: 'Aromatic slow-simmered valley curries infused with fennel and dry ginger.' },
        { name: 'Nadroo Yakhni', note: 'Crisp lotus stem simmered in velvety yogurt and whole mountain spices.' }
      ],
      nearbyAttractions: [
        { name: 'Sonamarg Thajiwas Glacier', distance: '80 km northeast' },
        { name: 'Doodhpathri Meadows', distance: '42 km southwest' },
        { name: 'Pampore Saffron Fields', distance: '16 km southeast' }
      ],
      keywords: 'kashmir srinagar dal lake shikara gulmarg pahalgam mountains alpine snow'
    },
    {
      id: 'kerala',
      name: 'Kerala',
      stateRegion: 'Alleppey & Munnar',
      category: 'Nature',
      secondaryCategories: ['Beaches', 'Wildlife'],
      image: 'src/assets/images/dest_kerala_1795160234548.jpg',
      alt: 'Traditional wooden houseboat gliding across emerald Kerala backwaters lined with coconut palms',
      summary: 'Emerald palm-fringed lagoons, mist-draped Western Ghats tea hills, and calm coastal towns rich in maritime heritage.',
      overview: 'Kerala compresses extraordinary ecological variety into gentle drives: mornings begin among cloud-kissed tea ridges in Munnar, descend through spice sanctuaries in Thekkady, and settle onto still coconut-lined canals aboard a traditional kettuvallam houseboat in Alleppey.',
      estimatedBudget: 18000,
      budgetLabel: '₹18,000',
      budgetBreakdown: '5 days hill stay, 1 night houseboat & intercity transfers (indicative sample)',
      recommendedDuration: '5 Days',
      bestTimeToVisit: 'September – March',
      seasonalNote: 'Post-monsoon months from September to February bring bright green hills, low humidity, and calm backwater cruises.',
      touristAttractions: [
        { name: 'Alleppey Backwater Canals', note: 'Slow lagoon drifting past village shorelines and emerald paddy fields.' },
        { name: 'Munnar Tea Estates', note: 'Rolling terraced tea slopes and cool Western Ghats viewpoints.' },
        { name: 'Fort Kochi Promenade', note: 'Cantilevered Chinese fishing nets and quiet spice-merchant streets.' },
        { name: 'Eravikulam National Park', note: 'High-altitude shola grasslands home to the endemic Nilgiri Tahr.' }
      ],
      localFood: [
        { name: 'Appam with Vegetable or Coconut Stew', note: 'Lacy fermented rice hoppers with mild spiced coconut milk curry.' },
        { name: 'Karimeen Pollichathu', note: 'Pearl spot fish marinated in shallots and wrapped in roasted banana leaf.' },
        { name: 'Sadya Feast', note: 'Traditional banana-leaf meal featuring avial, sambar, and sweet payasam.' }
      ],
      nearbyAttractions: [
        { name: 'Kumarakom Bird Sanctuary', distance: '33 km from Alleppey' },
        { name: 'Periyar Tiger Reserve, Thekkady', distance: '90 km from Munnar' },
        { name: 'Varkala Laterite Cliff Beach', distance: '115 km south' }
      ],
      keywords: 'kerala backwaters houseboat alleppey munnar tea gardens nature lagoons emerald'
    },
    {
      id: 'meghalaya',
      name: 'Meghalaya',
      stateRegion: 'Shillong & Cherrapunji',
      category: 'Nature',
      secondaryCategories: ['Adventure'],
      image: 'src/assets/images/dest_meghalaya_1795160234524.jpg',
      alt: 'Cascading turquoise waterfall surrounded by misty emerald rainforest cliffs in Meghalaya',
      summary: 'Living root bridges, emerald rainforest canyons, and glass-clear rivers nestled beneath drifting highland clouds.',
      overview: 'Known as the abode of clouds, Meghalaya’s Khasi and Jaintia Hills reveal limestone caves, multi-tiered turquoise plunge pools, and centuries-old living bridges woven by hand from banyan roots across forested gorges.',
      estimatedBudget: 19500,
      budgetLabel: '₹19,500',
      budgetBreakdown: '5 nights homestay/eco-lodge circuit, cab from Guwahati & trail guides (indicative sample)',
      recommendedDuration: '5–6 Days',
      bestTimeToVisit: 'October – May',
      seasonalNote: 'October–November blends full post-monsoon waterfalls with crisp clear skies; winter keeps canyon trails dry and walkable.',
      touristAttractions: [
        { name: 'Nongriat Double-Decker Root Bridge', note: 'Bio-engineered ficus root bridges reached via forested stone steps.' },
        { name: 'Nohkalikai Falls', note: 'India’s tallest plunge waterfall dropping into an emerald canyon pool.' },
        { name: 'Dawki & Umngot River', note: 'Glass-clear turquoise river where boats appear suspended above stones.' },
        { name: 'Laitlum Canyons', note: 'Sweeping green plateau ridge looking down onto misty cloud valleys.' }
      ],
      localFood: [
        { name: 'Jadoh', note: 'Fragrant Khasi short-grain rice cooked with turmeric, ginger, and local herbs.' },
        { name: 'Dohneiiong', note: 'Rich slow-cooked specialty flavored with toasted black sesame paste.' },
        { name: 'Pukhlein & Bamboo Shoot Pickles', note: 'Crisp rice-flour jaggery cakes and fermented highland sides.' }
      ],
      nearbyAttractions: [
        { name: 'Mawlynnong Cleanest Village', distance: '30 km from Dawki' },
        { name: 'Krang Suri Waterfalls', distance: '90 km from Shillong' },
        { name: 'Mawphlang Sacred Grove', distance: '25 km from Shillong' }
      ],
      keywords: 'meghalaya shillong cherrapunji waterfalls living root bridge canyons adventure nature'
    },
    {
      id: 'varanasi',
      name: 'Varanasi',
      stateRegion: 'Uttar Pradesh',
      category: 'Religious',
      secondaryCategories: ['Historical'],
      image: 'src/assets/images/dest_varanasi_1795160767426.jpg',
      alt: 'Varanasi stone ghats along the calm Ganges river at golden sunrise with moored rowboats',
      summary: 'Timeless stone ghats, dawn river crossings, and resonant evening aarti ceremonies along one of the world’s oldest living cities.',
      overview: 'Curving along a sacred crescent bend of the Ganga, Varanasi reveals centuries of spiritual devotion, classical music, and silk-weaving guilds. A quiet wooden rowboat at sunrise traces eighty-four stone ghats waking in golden mist.',
      estimatedBudget: 10500,
      budgetLabel: '₹10,500',
      budgetBreakdown: '3 nights ghat-side guesthouse, sunrise boat & heritage walk (indicative sample)',
      recommendedDuration: '3 Days',
      bestTimeToVisit: 'November – March',
      seasonalNote: 'Cool winter mornings and clear river mist from November to February make dawn ghat walks deeply atmospheric.',
      touristAttractions: [
        { name: 'Dashashwamedh Ghat Evening Aarti', note: 'Synchronized brass-lamp ritual illuminated along the riverfront steps.' },
        { name: 'Kashi Vishwanath Corridor', note: 'Sacred temple precinct connecting ancient alleys directly to the Ganga.' },
        { name: 'Assi Ghat Sunrise & Subah-e-Banaras', note: 'Dawn classical ragas beside moored wooden rowboats.' },
        { name: 'Sarnath Buddhist Complex', note: 'Ashokan pillar and Dhamek Stupa where the first sermon was delivered.' }
      ],
      localFood: [
        { name: 'Kachori Sabzi & Jalebi', note: 'Traditional Banarasi morning breakfast crisp out of neighborhood lanes.' },
        { name: 'Malaiyyo (Winter)', note: 'Airy saffron-infused milk foam prepared under cool night dew.' },
        { name: 'Banarasi Tamatar Chaat', note: 'Spiced mashed tomato street delicacy topped with crisp namakpara.' }
      ],
      nearbyAttractions: [
        { name: 'Sarnath Archaeological Park', distance: '10 km northeast' },
        { name: 'Ramnagar Fort & Museum', distance: '14 km across river' },
        { name: 'Chunar Sandstone Fort', distance: '40 km southwest' }
      ],
      keywords: 'varanasi banaras kashi ghats ganges religious spiritual temple sunrise sarnath'
    },
    {
      id: 'rishikesh',
      name: 'Rishikesh',
      stateRegion: 'Uttarakhand',
      category: 'Adventure',
      secondaryCategories: ['Religious', 'Nature'],
      image: 'src/assets/images/dest_rishikesh_1795160767098.jpg',
      alt: 'Emerald Ganga river flowing past forested foothills and suspension footbridge in Rishikesh',
      summary: 'Emerald Himalayan river rapids, forested yoga retreats, and peaceful evening riverfront rituals where the Ganga enters the plains.',
      overview: 'Tucked in the forested Shivalik foothills, Rishikesh bridges exhilarating white-water rafting stretches with serene ashram courtyards, suspension footbridges, and quiet sandy coves along the crystal-green Ganga.',
      estimatedBudget: 11500,
      budgetLabel: '₹11,500',
      budgetBreakdown: '3–4 days riverside camp/hotel, rafting stretch & local stays (indicative sample)',
      recommendedDuration: '3–4 Days',
      bestTimeToVisit: 'September – November & February – May',
      seasonalNote: 'Clear emerald river levels are ideal for rafting and trekking outside peak July–August monsoon rains.',
      touristAttractions: [
        { name: 'Shivpuri to Rishikesh Rafting', note: '16 km Grade II–III white-water rapids framed by forested canyons.' },
        { name: 'Triveni Ghat Evening Aarti', note: 'Calm devotional hymns and floating leaf lamps at dusk.' },
        { name: 'Ram Jhula & Laxman Jhula Area', note: 'Pedestrian river crossings linking riverside cafes, temples, and trails.' },
        { name: 'Beatles Ashram (Chaurasi Kutia)', note: 'Forest-covered meditation domes tucked inside Rajaji buffer woods.' }
      ],
      localFood: [
        { name: 'Garhwali Aloo Gutke & Kafuli', note: 'Earthy mountain spinach gravy and cumin-tempered hill potatoes.' },
        { name: 'Herbal Tulsi & Ginger Chai', note: 'Warm spiced tea served along riverfront terraces.' },
        { name: 'Sattvic Thali', note: 'Wholesome millet rotis, lentil dal, and seasonal mountain vegetables.' }
      ],
      nearbyAttractions: [
        { name: 'Neer Garh Forest Waterfall', distance: '6 km north' },
        { name: 'Kunjapuri Devi Sunrise Ridge', distance: '26 km uphill' },
        { name: 'Haridwar Har Ki Pauri', distance: '24 km south' }
      ],
      keywords: 'rishikesh uttarakhand rafting adventure ganga yoga suspension bridge himalayas'
    },
    {
      id: 'ladakh',
      name: 'Ladakh',
      stateRegion: 'Leh & Pangong',
      category: 'Adventure',
      secondaryCategories: ['Mountains', 'Religious'],
      image: 'src/assets/images/dest_ladakh_1795160767317.jpg',
      alt: 'Cobalt Pangong alpine lake framed by barren ochre Himalayan mountains in Ladakh',
      summary: 'High-altitude desert plateaus, cobalt glacial lakes, and whitewashed cliffside monasteries beneath luminous Himalayan skies.',
      overview: 'Above 3,500 meters, Ladakh’s trans-Himalayan landscape trades lush greenery for sculptural ochre ridges, turquoise rivers, and serene Buddhist gompas. Careful acclimation in Leh unlocks unforgettable crossings over Khardung La to Nubra Valley and Pangong Tso.',
      estimatedBudget: 26000,
      budgetLabel: '₹26,000',
      budgetBreakdown: '6 days Leh & Nubra/Pangong circuit, SUV transit & permits (indicative sample)',
      recommendedDuration: '6–7 Days',
      bestTimeToVisit: 'May – September',
      seasonalNote: 'High mountain passes remain snow-free from late May through September; spend the first 48 hours resting in Leh to acclimatize.',
      touristAttractions: [
        { name: 'Pangong Tso Lake', note: 'High-altitude saline lake shifting from sapphire to deep turquoise.' },
        { name: 'Thiksey & Hemis Monasteries', note: 'Hilltop Tibetan Buddhist complexes echoing with morning horns.' },
        { name: 'Nubra Valley & Hunder Dunes', note: 'Silver sand dunes flanked by snow peaks and Bactrian camels.' },
        { name: 'Shanti Stupa', note: 'Sunset white dome overlooking Leh town and the Stok range.' }
      ],
      localFood: [
        { name: 'Thukpa & Skyu', note: 'Hearty hand-rolled pasta and root-vegetable broth made for crisp evenings.' },
        { name: 'Tingmo with Chhurpi', note: 'Steamed spiral bread served with mild mountain-cheese stews.' },
        { name: 'Sea Buckthorn Juice', note: 'Tart, vitamin-rich golden Himalayan berry nectar.' }
      ],
      nearbyAttractions: [
        { name: 'Magnetic Hill & Sangam Confluence', distance: '35 km west of Leh' },
        { name: 'Turtuk Balti Heritage Village', distance: '85 km beyond Diskit' },
        { name: 'Tso Moriri High-Altitude Wetland', distance: '220 km southeast' }
      ],
      keywords: 'ladakh leh pangong nubra adventure mountains monasteries high altitude bike trek'
    },
    {
      id: 'hampi',
      name: 'Hampi',
      stateRegion: 'Karnataka',
      category: 'Historical',
      secondaryCategories: ['Adventure', 'Religious'],
      image: 'src/assets/images/dest_hampi_1795160767561.jpg',
      alt: 'Ancient carved granite temple pillars in Hampi surrounded by boulder hills at sunset',
      summary: 'Monumental 14th-century Vijayanagara stone temples scattered amid surreal granite boulder hills and emerald banana groves.',
      overview: 'Once one of the medieval world’s grandest capitals, Hampi spans a dramatic boulder-strewn landscape along the Tungabhadra River. Cycling between carved musical pillars, royal elephant stables, and sunrise ridges feels like stepping through an open-air stone gallery.',
      estimatedBudget: 10800,
      budgetLabel: '₹10,800',
      budgetBreakdown: '3 nights heritage guesthouse, bicycle/auto rental & monument pass (indicative sample)',
      recommendedDuration: '3 Days',
      bestTimeToVisit: 'October – February',
      seasonalNote: 'Cool dry winter months make cycling across the boulder ruins effortless; carry sun protection from March onward.',
      touristAttractions: [
        { name: 'Vittala Temple & Stone Chariot', note: 'Iconic carved granite chariot and resonating musical colonnades.' },
        { name: 'Virupaksha Temple & Hampi Bazaar', note: 'Living 7th-century sanctuary rising at the edge of the Tungabhadra.' },
        { name: 'Matanga Hill Sunrise Ridge', note: '360-degree dawn panorama over golden boulder valleys and temple spires.' },
        { name: 'Lotus Mahal & Elephant Stables', note: 'Graceful Indo-Islamic royal enclosures inside the Zenana precinct.' }
      ],
      localFood: [
        { name: 'Jolada Rotti Meal', note: 'North Karnataka sorghum flatbread with brinjal ennegayi and spiced chutneys.' },
        { name: 'Crisp Masala Dosa & Filter Coffee', note: 'Fresh morning tiffin served near the Virupaksha bazaar.' },
        { name: 'Banana & Sesame Sheera', note: 'Warm local sweet made from river-valley bananas.' }
      ],
      nearbyAttractions: [
        { name: 'Anegundi Heritage Village', distance: '5 km across river' },
        { name: 'Sanapur Lake Coracle Ride', distance: '8 km north' },
        { name: 'Badami & Pattadakal Rock Caves', distance: '140 km northwest' }
      ],
      keywords: 'hampi karnataka unesco historical ruins vijayanagara temples boulders heritage'
    },
    {
      id: 'andaman',
      name: 'Andaman Islands',
      stateRegion: 'Havelock & Neil',
      category: 'Beaches',
      secondaryCategories: ['Adventure', 'Nature'],
      image: 'src/assets/images/dest_andaman_1795160767697.jpg',
      alt: 'Powdery white sand beach and crystal turquoise coral water on Havelock Island in Andaman',
      summary: 'Glass-clear coral lagoons, powdery white-sand shores, and untouched tropical rainforests across the Bay of Bengal.',
      overview: 'Far out in the Bay of Bengal, Swaraj Dweep (Havelock) and Shaheed Dweep (Neil) preserve some of Asia’s clearest snorkeling reefs and uncrowded white-sand crescents framed by towering tropical evergreens.',
      estimatedBudget: 24500,
      budgetLabel: '₹24,500',
      budgetBreakdown: '5 nights island stay, inter-island ferry & snorkeling guide (indicative sample)',
      recommendedDuration: '5–6 Days',
      bestTimeToVisit: 'November – April',
      seasonalNote: 'Calm seas and high underwater visibility peak between December and April; avoid southwest monsoon months (June–August).',
      touristAttractions: [
        { name: 'Radhanagar Beach (Beach No. 7)', note: 'Sweeping white sand shore backed by lush rainforest canopy.' },
        { name: 'Elephant Beach Coral Reefs', note: 'Shallow turquoise waters suited for beginner snorkeling and glass boats.' },
        { name: 'Neil Island Natural Bridge', note: 'Sculpted coastal coral arch exposed during low-tide reef walks.' },
        { name: 'Cellular Jail, Port Blair', note: 'Historic colonial-era memorial illuminating India’s freedom struggle.' }
      ],
      localFood: [
        { name: 'Grilled Red Snapper & Coconut Curry', note: 'Fresh day-catch seafood seasoned with island curry leaves and lime.' },
        { name: 'Andaman Crab Masala', note: 'Coastal pepper-and-tamarind delicacy served with steamed rice.' },
        { name: 'Tropical Tender Coconut & Passionfruit', note: 'Chilled island refreshments along coastal cafes.' }
      ],
      nearbyAttractions: [
        { name: 'Ross Island (Netaji Subhash Chandra Bose Island)', distance: '3 km ferry from Port Blair' },
        { name: 'Kalapathar Limestone Shore', distance: '11 km on Havelock' },
        { name: 'Baratang Mangrove Creeks', distance: '100 km north of Port Blair' }
      ],
      keywords: 'andaman islands havelock neil beach coral snorkeling turquoise lagoon tropical'
    },
    {
      id: 'amritsar',
      name: 'Amritsar',
      stateRegion: 'Punjab',
      category: 'Religious',
      secondaryCategories: ['Historical'],
      image: 'src/assets/images/dest_amritsar_1795160770881.jpg',
      alt: 'Golden Temple Harmandir Sahib glowing across the tranquil Amrit Sarovar pool at twilight in Amritsar',
      summary: 'Luminous marble walkways, the serene Harmandir Sahib reflecting in still sacred waters, and generous culinary traditions.',
      overview: 'Centered around the radiant Sri Harmandir Sahib (Golden Temple), Amritsar moves to a rhythm of continuous kirtan hymns, serene marble parikrama walks at twilight, and deeply welcoming community hospitality at Guru Ka Langar.',
      estimatedBudget: 9500,
      budgetLabel: '₹9,500',
      budgetBreakdown: '3 days boutique stay, heritage walks & local transport (indicative sample)',
      recommendedDuration: '2–3 Days',
      bestTimeToVisit: 'October – March',
      seasonalNote: 'Crisp autumn and winter evenings create clear twilight reflections over the Amrit Sarovar.',
      touristAttractions: [
        { name: 'Sri Harmandir Sahib (Golden Temple)', note: 'Gold-clad sanctum surrounded by the sacred Amrit Sarovar pool.' },
        { name: 'Guru Ka Langar Community Kitchen', note: 'World’s largest free community kitchen serving tens of thousands daily.' },
        { name: 'Partition Museum (Town Hall)', note: 'Moving archival galleries preserving personal histories of 1947.' },
        { name: 'Gobindgarh Fort', note: 'Restored 18th-century brick citadel showcasing Sikh martial heritage.' }
      ],
      localFood: [
        { name: 'Amritsari Kulcha & Chole', note: 'Crisp tandoor-baked stuffed flatbread served with tangy spiced chickpeas.' },
        { name: 'Sarson da Saag & Makki di Roti', note: 'Winter mustard greens slow-cooked with white butter and cornmeal flatbread.' },
        { name: 'Pedha Lassi', note: 'Thick churned yogurt topped with rich malai in clay kulhads.' }
      ],
      nearbyAttractions: [
        { name: 'Jallianwala Bagh Memorial', distance: '400 m walk' },
        { name: 'Attari-Wagah Border Ceremony', distance: '30 km west' },
        { name: 'Pul Kanjari Heritage Reservoir', distance: '35 km west' }
      ],
      keywords: 'amritsar punjab golden temple harmandir sahib religious sikh heritage food'
    },
    {
      id: 'jim-corbett',
      name: 'Jim Corbett',
      stateRegion: 'Uttarakhand',
      category: 'Wildlife',
      secondaryCategories: ['Nature'],
      image: 'src/assets/images/dest_corbett_1795160769727.jpg',
      alt: 'Royal Bengal tiger walking along a sunlit misty sal forest trail in Jim Corbett National Park',
      summary: 'Misty sal forests, sweeping riverine grasslands, and India’s oldest national park sheltering Bengal tigers and wild elephants.',
      overview: 'Named after naturalist Jim Corbett, this 520-square-kilometer reserve along the Ramganga River spans dense sal woodlands, rolling foothills, and wide chaurs (grasslands) alive with spotted deer, hornbills, wild Asian elephants, and Bengal tigers.',
      estimatedBudget: 16500,
      budgetLabel: '₹16,500',
      budgetBreakdown: '3 nights forest lodge, 2 permitted jeep safaris & transfers (indicative sample)',
      recommendedDuration: '3 Days',
      bestTimeToVisit: 'November – June',
      seasonalNote: 'Core zones like Dhikala open mid-November to mid-June; March–May offers highest wildlife visibility near waterholes.',
      touristAttractions: [
        { name: 'Dhikala Grasslands Safari Zone', note: 'Expansive Ramganga valley flats known for wild elephant herds and tigers.' },
        { name: 'Bijrani Sal Forest Zone', note: 'Open meadows and shaded woodland trails rich in birdlife.' },
        { name: 'Garjiya Devi River Shrine', note: 'Hilltop temple perched above a large rock island in the Kosi River.' },
        { name: 'Corbett Museum, Kaladhungi', note: 'Preserved winter bungalow chronicling early Indian conservation.' }
      ],
      localFood: [
        { name: 'Kumaoni Bhatt ki Churkani', note: 'Roasted black soybean curry cooked in iron kadhai with steamed rice.' },
        { name: 'Aloo ke Gutke & Raita', note: 'Spiced hill potatoes paired with cucumber-mustard yogurt.' },
        { name: 'Bal Mithai', note: 'Roasted khoya fudge coated with crisp sugar pearls from Kumaon.' }
      ],
      nearbyAttractions: [
        { name: 'Corbett Falls Woodland Walk', distance: '25 km east' },
        { name: 'Nainital Lake Town', distance: '65 km uphill' },
        { name: 'Pangot Himalayan Birding Reserve', distance: '78 km northeast' }
      ],
      keywords: 'jim corbett wildlife safari tiger elephant forest uttarakhand national park'
    },
    {
      id: 'kaziranga',
      name: 'Kaziranga',
      stateRegion: 'Assam',
      category: 'Wildlife',
      secondaryCategories: ['Nature'],
      image: 'src/assets/images/dest_kaziranga_1795160770089.jpg',
      alt: 'Indian one-horned rhinoceros wading through emerald wetlands and tall elephant grass in Kaziranga',
      summary: 'UNESCO Brahmaputra floodplains, towering elephant grass, and the world’s largest sanctuary for the Indian one-horned rhinoceros.',
      overview: 'Stretching across the fertile Brahmaputra river basin, Kaziranga blends emerald wetlands, tall reed marshes, and tropical semi-evergreen groves. Dawn safaris uncover thriving populations of greater one-horned rhinos, wild water buffalo, and migratory waterfowl.',
      estimatedBudget: 18500,
      budgetLabel: '₹18,500',
      budgetBreakdown: '3 nights eco-resort, 2 range safaris & Guwahati transfer (indicative sample)',
      recommendedDuration: '3–4 Days',
      bestTimeToVisit: 'November – April',
      seasonalNote: 'Park ranges open November through April after monsoon floodwaters recede; crisp misty mornings peak December–February.',
      touristAttractions: [
        { name: 'Kohora (Central) Safari Range', note: 'Iconic tall elephant-grass wetlands frequented by one-horned rhinos.' },
        { name: 'Bagori (Western) Marsh Range', note: 'Broad beels (lakes) attracting wild buffalo, swamp deer, and pelicans.' },
        { name: 'Agoratoli (Eastern) Birding Zone', note: 'Riverine forest trails ideal for spotting hornbills and eagles.' },
        { name: 'Kaziranga National Orchid Park', note: 'Living conservatory showcasing over 500 wild Northeast orchid varieties.' }
      ],
      localFood: [
        { name: 'Assamese Khar & Masor Tenga', note: 'Light tangy river-fish curry soured with elephant apple or tomato.' },
        { name: 'Joha Rice & Pitika', note: 'Aromatic short-grain Assamese rice with roasted vegetable mash and mustard oil.' },
        { name: 'Assam Orthodox Tea', note: 'Single-estate malty black tea brewed fresh from surrounding gardens.' }
      ],
      nearbyAttractions: [
        { name: 'Kakochang Waterfall & Coffee Estate', distance: '15 km south' },
        { name: 'Majuli River Island', distance: '115 km northeast' },
        { name: 'Karbi Anglong Forest Hills', distance: '25 km south' }
      ],
      keywords: 'kaziranga assam wildlife rhino national park safari wetlands northeast brahmaputra'
    },
    {
      id: 'udaipur',
      name: 'Udaipur',
      stateRegion: 'Rajasthan',
      category: 'Historical',
      secondaryCategories: ['Nature'],
      image: 'src/assets/images/dest_udaipur_1795160769864.jpg',
      alt: 'White marble palaces reflecting in calm Lake Pichola surrounded by Aravalli hills at dusk in Udaipur',
      summary: 'Marble lake palaces, quiet Aravalli hill overlooks, and twilight boat crossings across interconnected emerald lakes.',
      overview: 'Cradled by the forested Aravalli range, Udaipur unfolds around Lake Pichola and Fateh Sagar. Ornate Mewar courtyards, miniature painting workshops, and sunset ridges along Monsoon Palace make it Rajasthan’s most poetic architectural retreat.',
      estimatedBudget: 14000,
      budgetLabel: '₹14,000',
      budgetBreakdown: '3–4 days lake-quarter haveli stay, boat cruise & palace entries (indicative sample)',
      recommendedDuration: '3–4 Days',
      bestTimeToVisit: 'September – March',
      seasonalNote: 'Late monsoon (September) fills the lakes while October–March brings mild sunny afternoons and cool lakeside evenings.',
      touristAttractions: [
        { name: 'City Palace & Crystal Gallery', note: 'Sprawling sandstone-and-marble palace complex rising directly from Lake Pichola.' },
        { name: 'Lake Pichola & Jag Mandir', note: 'Golden-hour boat crossing toward carved marble island pavilions.' },
        { name: 'Saheliyon-ki-Bari', note: '18th-century lotus pools and marble fountains built for royal attendants.' },
        { name: 'Sajjangarh (Monsoon Palace)', note: 'Hilltop fortress overlooking the entire Aravalli lake basin at sunset.' }
      ],
      localFood: [
        { name: 'Mewari Dal Baati & Gatte ki Sabzi', note: 'Gram-flour dumplings simmered in spiced curd gravy.' },
        { name: 'Khaman & Mirchi Bada', note: 'Savory morning street bites from Old City alleys.' },
        { name: 'Malpua Rabri', note: 'Crisp saffron-scented pancakes served warm with reduced sweet milk.' }
      ],
      nearbyAttractions: [
        { name: 'Kumbhalgarh Fort Great Wall', distance: '84 km north' },
        { name: 'Eklingji Marble Temple Complex', distance: '22 km north' },
        { name: 'Ranakpur Carved Jain Temple', distance: '93 km northwest' }
      ],
      keywords: 'udaipur rajasthan historical palace lake pichola aravalli heritage romantic'
    },
    {
      id: 'coorg',
      name: 'Coorg',
      stateRegion: 'Kodagu, Karnataka',
      category: 'Nature',
      secondaryCategories: ['Wildlife', 'Adventure'],
      image: 'src/assets/images/dest_coorg_1795160769915.jpg',
      alt: 'Misty emerald coffee plantations and silver oak trees in Coorg Western Ghats at sunrise',
      summary: 'Misty Western Ghats coffee estates, cardamom-scented forest trails, and roaring monsoon-fed cascades.',
      overview: 'Tucked across the cool slopes of Kodagu in southern Karnataka, Coorg invites travelers to wake inside shade-grown Arabica coffee estates, hike misty shola ridge trails like Tadiandamol, and visit quiet Tibetan monasteries in nearby Bylakuppe.',
      estimatedBudget: 13500,
      budgetLabel: '₹13,500',
      budgetBreakdown: '3–4 days coffee estate homestay, estate walks & local cab (indicative sample)',
      recommendedDuration: '3–4 Days',
      bestTimeToVisit: 'October – May',
      seasonalNote: 'October–March offers crisp morning mist and coffee-harvest season; March–April brings fragrant white coffee blossoms.',
      touristAttractions: [
        { name: 'Abbey Falls', note: 'Cascade tumbling between private spice and coffee estates near Madikeri.' },
        { name: 'Raja’s Seat Overlook', note: 'Hilltop garden pavilion gazing over layered Western Ghats valleys at sunrise.' },
        { name: 'Tadiandamol Peak Trail', note: 'Kodagu’s highest summit hike weaving through shola forests and grasslands.' },
        { name: 'Dubare Elephant Camp & Riverfront', note: 'Forest-lined Cauvery river crossing with quiet riverside trails.' }
      ],
      localFood: [
        { name: 'Kadambuttu & Pandi/Mushroom Curry', note: 'Steamed rice dumplings paired with dark Kodagu black-vinegar spice gravies.' },
        { name: 'Akki Otti', note: 'Crisp griddle-roasted rice flatbread served with fresh wild honey.' },
        { name: 'Single-Estate Coorg Filter Coffee', note: 'Aromatic shade-grown roast brewed fresh in estate kitchens.' }
      ],
      nearbyAttractions: [
        { name: 'Namdroling Monastery, Bylakuppe', distance: '34 km east' },
        { name: 'Mandalpatti Cloud Ridge', distance: '18 km north' },
        { name: 'Nagarhole Tiger Reserve', distance: '90 km southeast' }
      ],
      keywords: 'coorg kodagu karnataka coffee plantations nature mist western ghats waterfalls'
    }
  ];

  const HIDDEN_GEMS = [
    {
      id: 'ziro-valley',
      name: 'Ziro Valley',
      stateRegion: 'Arunachal Pradesh',
      zone: 'Northeast',
      category: 'Eco & Tribal Heritage',
      image: 'src/assets/images/gem_ziro_valley_1795167627729.jpg',
      alt: 'Lush emerald terraced rice paddies and misty Eastern Himalayan pine hills in Ziro Valley',
      bestTime: 'March – May, Sept – Nov',
      duration: '4 Days',
      budgetMin: 9500,
      budgetMax: 13500,
      budgetTier: 'mid',
      budgetNote: 'Bamboo homestays, shared sumo from Naharlagun & local Apatani meals (illustrative estimate)',
      summary: 'High-altitude pine-rimmed plateau home to sustainable wet-rice pisciculture and quiet Apatani bamboo villages.',
      offbeatAttractions: [
        'Hong & Hari Bamboo Villages (walkable earthen lanes and granary clusters)',
        'Talley Valley Wildlife Sanctuary (clouded leopard habitat & silver fir forest trail)',
        'Meghna Cave Temple & Tarin High-Altitude Fish Farm'
      ],
      localExperiences: [
        'Stay in a wood-heated Apatani family homestay and learn integrated paddy-fish farming',
        'Sample bamboo-steamed rice, smoked local greens, and millet apong at evening hearths',
        'Cycle across mist-covered pine roads between Old Ziro and Hapoli'
      ],
      budgetTip: 'Take the overnight Donyi Polo Express from Guwahati to Naharlagun (~₹450 Sleeper / ₹1,150 3A) and a shared Tata Sumo to Ziro (~₹400) instead of a private cab.',
      permitNote: 'Indian citizens require an Inner Line Permit (ILP), obtainable online via Arunachal e-ILP.'
    },
    {
      id: 'spiti-kaza',
      name: 'Spiti Valley (Kaza & Kibber)',
      stateRegion: 'Himachal Pradesh',
      zone: 'Himalayas',
      category: 'High-Altitude Desert',
      image: 'src/assets/images/gem_spiti_kaza_1795167627867.jpg',
      alt: 'Whitewashed Key Monastery overlooking the turquoise Spiti River and snow-capped Himalayas',
      bestTime: 'May – October',
      duration: '6 Days',
      budgetMin: 11000,
      budgetMax: 16000,
      budgetTier: 'mid',
      budgetNote: 'Solar-heated village homestays, HRTC buses & shared cabs (illustrative estimate)',
      summary: 'Cold-desert Himalayan gorge dotted with thousand-year cliff monasteries, fossil plateaus, and solar-heated homestays.',
      offbeatAttractions: [
        'Key Monastery & Gete Panorama Ridge above the Spiti riverbed',
        'Langza Marine Fossil Plateau & Hikkim (world’s highest post office)',
        'Dhankar Cliff Monastery & Chandratal glacial crescent lake'
      ],
      localExperiences: [
        'Stay in mud-brick solar-heated homestays in Langza or Komic rather than concrete hotels',
        'Sip salted butter tea and barley tsampa while learning monastic mural history',
        'Stargaze under ultra-low Bortle skies along the Pin Valley spur'
      ],
      budgetTip: 'Enter via Shimla–Kinnaur using HRTC public mountain buses for gradual altitude acclimatization and fares under ₹1,200 total.',
      permitNote: 'No permit needed for domestic travelers; check BRO road advisories for Kunzum Pass.'
    },
    {
      id: 'majuli-island',
      name: 'Majuli River Island',
      stateRegion: 'Assam',
      zone: 'Northeast',
      category: 'Living Craft & River Island',
      image: 'src/assets/images/gem_majuli_island_1795167628311.jpg',
      alt: 'Golden sunset over the Brahmaputra River with a traditional wooden boat at Majuli Island',
      bestTime: 'October – March',
      duration: '3 Days',
      budgetMin: 6500,
      budgetMax: 9500,
      budgetTier: 'low',
      budgetNote: 'Bamboo chang-ghar cottages, public ferry & bicycle rentals (illustrative estimate)',
      summary: 'Lush Brahmaputra river island celebrated for Neo-Vaishnavite satras, bamboo mask-making, and tranquil wetlands.',
      offbeatAttractions: [
        'Samaguri Satra (centuries-old hand-painted clay and bamboo Bhaona mask workshop)',
        'Kamalabari & Auniati Satras for classical Sattriya dance & manuscript heritage',
        'Mishing stilt-village embankments & migratory bird wetlands near Dakhinpat'
      ],
      localExperiences: [
        'Cross the Brahmaputra at dawn on the Nimati Ghat public passenger ferry',
        'Rent a bicycle (₹150/day) to explore dirt tracks linking pottery kilns and weaving looms',
        'Watch a sunset mask-making demonstration by third-generation satra artisans'
      ],
      budgetTip: 'Stay in community-run Mishing chang-ghar bamboo cottages near Garamur (₹900–₹1,500/night) and ride the state ferry from Jorhat.',
      permitNote: 'No special permit required; verify daytime ferry timings during winter fog.'
    },
    {
      id: 'chettinad',
      name: 'Chettinad (Karaikudi)',
      stateRegion: 'Tamil Nadu',
      zone: 'Heritage & Stepwells',
      category: 'Architectural Heritage',
      image: 'src/assets/images/gem_chettinad_heritage_1795167629124.jpg',
      alt: 'Chettinad courtyard mansion with geometric Athangudi tiles and carved Burma teak pillars',
      bestTime: 'November – February',
      duration: '2–3 Days',
      budgetMin: 7000,
      budgetMax: 11500,
      budgetTier: 'low',
      budgetNote: 'Restored heritage guesthouses, local rail & village walking tours (illustrative estimate)',
      summary: 'Quiet heritage towns lined with palatial 19th-century courtyard mansions, handmade Athangudi tiles, and spice-rich cuisine.',
      offbeatAttractions: [
        'Kanadukathan Mansion Streets & Chettinad Palace colonnades',
        'Athangudi Village Tile Workshops (hand-pressed glass-finish cement tiles)',
        'Thirumayam Hill Fort & Karaikudi Antique Market lanes'
      ],
      localExperiences: [
        'Watch artisans hand-pour mineral oxides into brass frames to cast Athangudi tiles',
        'Dine on a traditional banana-leaf Chettinad meal cooked with roasted kalpasi and star anise',
        'Visit handloom cotton sari weavers in Kandanur crafting bold checked Kandangi weaves'
      ],
      budgetTip: 'Take an overnight train from Chennai to Karaikudi Junction (~₹450–₹950) and explore mansion clusters on foot or rented cycle.',
      permitNote: 'Ask mansion caretakers permission before entering private courtyard interiors.'
    },
    {
      id: 'bundi',
      name: 'Bundi',
      stateRegion: 'Rajasthan',
      zone: 'Heritage & Stepwells',
      category: 'Stepwells & Frescoes',
      image: 'src/assets/images/gem_bundi_stepwell_1795167628290.jpg',
      alt: 'Carved stone stairs of Raniji ki Baori stepwell beneath Garh Palace in Bundi',
      bestTime: 'October – March',
      duration: '2–3 Days',
      budgetMin: 6000,
      budgetMax: 9000,
      budgetTier: 'low',
      budgetNote: 'Blue-lane havelis, heritage monument pass & train from Kota (illustrative estimate)',
      summary: 'Unhurried Hadoti town of 50+ carved stone stepwells, blue-washed Brahmin lanes, and intricate miniature frescoes.',
      offbeatAttractions: [
        'Raniji ki Baori & Nagar Sagar twin stepwells in the old bazaar',
        'Garh Palace & Chitrashala (preserved turquoise-and-gold Bundi school murals)',
        'Taragarh Fort hilltop cisterns & Nawal Sagar Lake evening reflections'
      ],
      localExperiences: [
        'Join a dawn heritage walk mapping hidden neighbourhood stepwells without tour crowds',
        'Watch local miniature artists mix natural mineral pigments on handmade wasli paper',
        'Enjoy lakeside masala chai and hot mirchi vada beside Sukh Mahal'
      ],
      budgetTip: 'Kota Junction is just 38 km away on major Delhi–Mumbai rail lines; stay in family-run havelis inside the old town (₹800–₹1,800/night).',
      permitNote: 'Wear sturdy closed shoes for uneven stone steps inside Garh Palace and Taragarh Fort.'
    },
    {
      id: 'gokarna-ridge',
      name: 'Gokarna & Kudle Headlands',
      stateRegion: 'Karnataka',
      zone: 'Coast & Forests',
      category: 'Coastal Trail',
      image: 'src/assets/images/exp_beaches_1795160234495.jpg',
      alt: 'Quiet turquoise coastal cove framed by green headlands along the Konkan coast',
      bestTime: 'October – March',
      duration: '3 Days',
      budgetMin: 6800,
      budgetMax: 10500,
      budgetTier: 'low',
      budgetNote: 'Cliffside eco-huts, coastal footpaths & Konkan rail transit (illustrative estimate)',
      summary: 'Contemplative temple town linked by scenic rocky cliff trails to crescent coves like Half Moon and Paradise Beach.',
      offbeatAttractions: [
        'Five-Beach Coastal Ridge Trek (Belekan to Paradise, Half Moon, Om & Kudle)',
        'Yana Limestone Karst Rocks in nearby Sahyadri rainforest',
        'Mirjan 16th-century laterite fort covered in emerald monsoon moss'
      ],
      localExperiences: [
        'Hike the marked cliff path between coves at sunrise instead of hiring motorized boats',
        'Sample authentic Uttara Kannada neer dosa, kokum sherbet, and jackfruit sweets in Car Street',
        'Visit Kumta weekly farmers market for wild forest honey and red rice'
      ],
      budgetTip: 'Arrive via Konkan Railway to Gokarna Road or Kumta station and walk or share an auto-rickshaw (~₹150) to town.',
      permitNote: 'Carry drinking water on headland trails and avoid swimming near rocky cliff points during high tide.'
    },
    {
      id: 'mawlynnong-nongjrong',
      name: 'Nongjrong & Mawlynnong Ridge',
      stateRegion: 'Meghalaya',
      zone: 'Northeast',
      category: 'Cloud Highlands',
      image: 'src/assets/images/dest_meghalaya_1795160234524.jpg',
      alt: 'Misty emerald valley ridges and cascading mountain waters in Meghalaya',
      bestTime: 'October – April',
      duration: '3 Days',
      budgetMin: 8200,
      budgetMax: 12000,
      budgetTier: 'low',
      budgetNote: 'Community homestays, local village guides & shared Shillong sumos (illustrative estimate)',
      summary: 'Community-stewarded Khasi hill hamlets famous for dawn sea-of-clouds vistas, bamboo walkways, and zero-litter ethics.',
      offbeatAttractions: [
        'Nongjrong Sunrise Ridge overlooking clouds drifting beneath jagged valleys',
        'Riwai Living Root Bridge & Mawphlang Sacred Forest Grove',
        'Kongthong Whistling Village (where each resident has a unique melodic tune)'
      ],
      localExperiences: [
        'Wake at 4:30 AM with a village host in Nongjrong to watch sunrise above a sea of valley clouds',
        'Walk Mawphlang Sacred Grove with a Khasi elder explaining traditional forest conservation',
        'Enjoy Khasi red rice, black sesame pork/lentils, and wild Sohiong fruit preserves'
      ],
      budgetTip: 'Stay overnight inside Nongjrong or Kongthong village homestays (~₹1,000–₹1,400 with dinner) instead of pricey 3 AM taxis from Shillong.',
      permitNote: 'Never pluck plants or remove stones inside Mawphlang Sacred Grove per village custom.'
    },
    {
      id: 'tirthan-valley',
      name: 'Tirthan Valley & Jibhi',
      stateRegion: 'Himachal Pradesh',
      zone: 'Himalayas',
      category: 'Forest & River Valley',
      image: 'src/assets/images/dest_manali_1795160234518.jpg',
      alt: 'Clear Himalayan river winding through pine forests in Himachal Pradesh',
      bestTime: 'March – June, Sept – Nov',
      duration: '4 Days',
      budgetMin: 7800,
      budgetMax: 12200,
      budgetTier: 'low',
      budgetNote: 'Riverside wood homestays, HRTC Volvo to Aut & Great Himalayan park passes (illustrative estimate)',
      summary: 'Unhurried glacial trout-river valley bordering the Great Himalayan National Park—built for slow walks over traffic.',
      offbeatAttractions: [
        'Great Himalayan National Park (GHNP) Ecozone Trail from Gushaini to Rolla',
        'Chehni Kothi (centuries-old stone-and-deodar tower) & Shringa Rishi Temple',
        'Serolsar Lake & Jalori Pass oak-and-rhododendron ridge walk'
      ],
      localExperiences: [
        'Cross the Tirthan River on traditional wooden puliyas and listen to Himalayan whistling thrushes',
        'Stay in slate-roofed kath-kuni wooden homestays run by local apple-orchard families',
        'Learn catch-and-release river stewardship principles along the ecozone boundary'
      ],
      budgetTip: 'Board any Manali-bound overnight HRTC bus from Delhi, alight right at Aut Tunnel (~₹950), and take a local bus into Banjar/Gushaini (~₹60).',
      permitNote: 'Day treks inside core GHNP gates require a small forest entry permit at Sai Ropa.'
    }
  ];

  const DEMO_REVIEWS = [
    {
      id: 'demo-rev-1',
      destination: 'Kashmir',
      author: 'Aarav Mehta (Sample Profile)',
      tripType: 'Friends',
      rating: 5,
      title: 'Balanced Dal Lake mornings and Gulmarg pine trails',
      comment: 'Spending two unhurried mornings on Nigeen Lake before heading to Gulmarg and Pahalgam kept drive fatigue low. Pre-booking Gondola slots early in the morning saved three hours.',
      ecoTip: 'Booked a solar-water-heated wooden houseboat and carried a steel bottle.',
      date: '2026-09-14',
      source: 'demo'
    },
    {
      id: 'demo-rev-2',
      destination: 'Meghalaya',
      author: 'Nandini Rao (Sample Profile)',
      tripType: 'Solo',
      rating: 5,
      title: 'Nongriat root bridges and Nongjrong cloud sunrise',
      comment: 'Descending the 3,500 stone steps to Nongriat early at 6:30 AM meant walking the double-decker root bridge in complete peace. Village homestays were warm and spotlessly clean.',
      ecoTip: 'Used a bamboo bottle refill station in Mawlynnong and hired a certified Khasi trail guide.',
      date: '2026-10-02',
      source: 'demo'
    },
    {
      id: 'demo-rev-3',
      destination: 'Jaipur',
      author: 'Rohan Kulkarni (Sample Profile)',
      tripType: 'Family',
      rating: 4,
      title: 'Sunrise at Amber Fort beats the midday heat',
      comment: 'Starting Amber Fort right at 8 AM opening and pairing City Palace with Jantar Mantar made the route effortless for parents. Old city traffic is busy after 5 PM, so walk whenever possible.',
      ecoTip: 'Explored Johari and Bapu Bazaar on foot with cloth bags for block-printed textiles.',
      date: '2026-08-22',
      source: 'demo'
    },
    {
      id: 'demo-rev-4',
      destination: 'Kerala',
      author: 'Meera Nair (Sample Profile)',
      tripType: 'Family',
      rating: 5,
      title: 'Munnar tea ridges paired with serene Alleppey canals',
      comment: 'Choosing a smaller 2-bedroom wooden kettuvallam along quieter Kainakary canals gave us calm birdwatching at dawn instead of crowded main-channel traffic.',
      ecoTip: 'Picked a homestay sourcing ingredients locally and stayed in plastic-free Munnar cottages.',
      date: '2026-09-29',
      source: 'demo'
    },
    {
      id: 'demo-rev-5',
      destination: 'Ziro Valley',
      author: 'Kabir Sen (Sample Profile)',
      tripType: 'Solo',
      rating: 5,
      title: 'Slow cycling through Apatani rice terraces',
      comment: 'Ziro moves at a completely different pace. Renting a bicycle in Hapoli and staying with an Apatani family in Hong village was easily the highlight of my Northeast trip.',
      ecoTip: 'Applied for Arunachal e-ILP 10 days ahead and supported local handloom weavers directly.',
      date: '2026-10-18',
      source: 'demo'
    },
    {
      id: 'demo-rev-6',
      destination: 'Ladakh',
      author: 'Vikramaditya Joshi (Sample Profile)',
      tripType: 'Friends',
      rating: 4,
      title: 'Two full rest days in Leh made Pangong effortless',
      comment: 'Giving ourselves 48 hours of quiet hydration in Leh before crossing Chang La prevented altitude headaches. Carrying offline maps and BSNL SIM helped beyond Nubra.',
      ecoTip: 'Refilled water at Dzomsa Leh refill points instead of buying disposable plastic bottles.',
      date: '2026-07-19',
      source: 'demo'
    }
  ];

  global.YATRA_DESTINATIONS = DESTINATIONS;
  global.YATRA_HIDDEN_GEMS = HIDDEN_GEMS;
  global.YATRA_DEMO_REVIEWS = DEMO_REVIEWS;
})(window);
