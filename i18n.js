/**
 * Yatra Sphere — Bilingual UI Engine (English & Hindi)
 * Pure Vanilla JavaScript (ES6+) — Persists language in localStorage ("yatraSphere_lang").
 */

(function (global) {
  'use strict';

  const LANG_STORAGE_KEY = 'yatraSphere_lang';

  const TRANSLATIONS = {
    en: {
      // Navigation & Global Chrome
      'nav.skip': 'Skip to main content',
      'nav.home': 'Home',
      'nav.explore': 'Explore',
      'nav.planner': 'Planner',
      'nav.tools': 'Tools',
      'nav.guides': 'Guides',
      'nav.assistant': 'Assistant',
      'nav.dashboard': 'My Dashboard',
      'nav.about': 'About',
      'nav.gems': 'Hidden Gems',
      'nav.safety': 'Travel Safety',
      'nav.sustainable': 'Sustainable Travel',
      'nav.reviews': 'Reviews & Ratings',
      'nav.routePlanner': 'Google Maps Route Planner',
      'auth.loginSignup': 'Login / Sign Up',
      'auth.account': 'Account',
      'auth.myAccount': 'My Account',

      // Footer
      'footer.tagline': 'Explore More. Experience Beyond.',
      'footer.about': 'Thoughtful travel discovery and intelligent itinerary planning across India’s mountains, coastlines, and heritage cities.',
      'footer.quickLinks': 'Quick Links',
      'footer.contact': 'Contact Information',
      'footer.connect': 'Connect & Legal',
      'footer.privacy': 'Privacy Policy',
      'footer.terms': 'Terms of Use',
      'footer.demo': 'Demo Data Notice',
      'footer.rights': 'Yatra Sphere. All rights reserved.',

      // Homepage
      'hero.tagline': 'Explore More. Experience Beyond.',
      'hero.title': 'Your Next Journey Begins Here.',
      'hero.subtitle': 'Discover India’s most unforgettable mountains, serene backwaters, coastal retreats, and living heritage—paired with intelligent itinerary planning and clear budget guidance.',
      'hero.searchPlaceholder': 'Search Manali, Goa, Kashmir, Kerala, Jaipur, Meghalaya...',
      'hero.searchBtn': 'Search',
      'hero.popular': 'Popular:',
      'hero.exploreCta': 'Explore Destinations',
      'hero.planCta': 'Plan My Trip',
      'home.curatedKicker': 'Curated Regions',
      'home.popularTitle': 'Popular Destinations',
      'home.popularLead': 'Six signature regions across India selected for seasonal clarity, scenic contrast, and memorable pacing.',
      'home.exploreAllBtn': 'Explore All 16 Indian Destinations →',
      'home.whyKicker': 'About Yatra Sphere',
      'home.whyTitle': 'Why Choose Yatra Sphere?',
      'home.howKicker': 'Simple Workflow',
      'home.howTitle': 'How It Works',
      'home.expKicker': 'Curated Styles',
      'home.expTitle': 'Featured Experiences',
      'home.plannerKicker': 'Intelligent Itinerary Foundation',
      'home.plannerTitle': 'Craft a Balanced Journey in Seconds with the Yatra Sphere Planner',
      'home.toolsKicker': 'Interactive Utilities',
      'home.toolsTitle': 'Travel Tools',
      'home.toolsCta': 'Open Travel Tools →',
      'home.guidesKicker': 'Offbeat, Safe & Responsible Travel',
      'home.guidesTitle': 'Guides, Hidden Gems & Community',
      'home.guidesLead': 'Go beyond headline circuits with budget-friendly hidden gems, verified Indian emergency helplines, responsible travel tips, and traveler reviews.',
      'home.guidesCta': 'Open Guides Hub →',
      'home.testimonialsTitle': 'How Travelers Shape Their Routes',

      // Google Maps & Smart Travel Route Planner
      'rp.kicker': 'Plan Your Journey',
      'rp.title': 'Your Journey, Your Way.',
      'rp.subtitle': 'Choose your starting point, destination and travel preferences. Let Google Maps guide your journey.',
      'rp.openMapsBtn': 'Show Route on Google Maps',
      'rp.openReturnBtn': 'Open Return Route in Google Maps',
      'rp.swapBtn': 'Swap Locations',
      'rp.resetBtn': 'Reset Form',
      'rp.copyBtn': 'Copy Journey Details',
      'rp.addStopBtn': '+ Add Stop',

      // Guides Hub (Hidden Gems, Safety, Sustainable, Reviews)
      'guides.bannerTitle': 'Guides, Safety & Community',
      'guides.bannerSub': 'Discover lesser-known Indian destinations, verify emergency helplines and document checklists, explore eco-friendly travel practices, and read or share destination reviews.',
      'guides.tabGems': 'Hidden Gems',
      'guides.tabSafety': 'Travel Safety',
      'guides.tabSustainable': 'Sustainable Travel',
      'guides.tabReviews': 'Reviews & Ratings',
      'guides.gemsKicker': 'Offbeat India',
      'guides.gemsTitle': 'Hidden Gems Explorer',
      'guides.gemsLead': 'Lesser-known Indian valleys, heritage towns, and coastal trails curated for authentic local experiences and gentle budgets.',
      'guides.safetyKicker': 'Emergency & Preparedness',
      'guides.safetyTitle': 'Travel Safety & Emergency Guide',
      'guides.safetyLead': 'Verified national helplines, interactive document checklists, weather precautions, and live OpenStreetMap hospital/police lookup.',
      'guides.ecoKicker': 'Low-Impact Journeys',
      'guides.ecoTitle': 'Sustainable & Community Tourism',
      'guides.ecoLead': 'Destinations, locally led stays, and practical habits that keep fragile ecosystems and artisan communities thriving.',
      'guides.revKicker': 'Community Feedback',
      'guides.revTitle': 'Destination Reviews & Ratings',
      'guides.revLead': 'Browse demonstration reviews or submit your own rating and notes—saved locally in your browser.',

      // Explore, Planner, Tools, Assistant, Account Banners
      'explore.title': 'Explore Indian Destinations',
      'explore.sub': 'Browse 16 curated destinations across mountains, coastlines, heritage cities, sacred ghats, adventure circuits, rainforests, and wildlife sanctuaries—complete with seasonal guides, local cuisine, and wishlist saving.',
      'planner.title': 'AI Smart Trip Planner',
      'planner.sub': 'Configure your route, travel dates, group size, INR budget, and interests in three simple steps to generate an editable, printable day-wise itinerary.',
      'tools.title': 'Travel Tools & Route Utilities',
      'tools.sub': 'Inspect destinations on an interactive OpenStreetMap view, check live 7-day weather forecasts, browse illustrative stay options, and compare train, bus, flight, and cab corridors.',
      'assistant.title': 'Yatra Sphere Travel Assistant',
      'assistant.sub': 'Ask for destination picks, INR budget guidance, seasonal timing, packing checklists, or solo and family travel advice across 16 Indian regions.',
      'dashboard.title': 'Your Travel Dashboard',
      'dashboard.sub': 'Organize upcoming routes, review saved itineraries, track your packing checklist, and manage your traveler profile.',
      'login.title': 'Welcome Back to Yatra Sphere',
      'signup.title': 'Create Your Yatra Sphere Account'
    },
    hi: {
      // Navigation & Global Chrome
      'nav.skip': 'मुख्य सामग्री पर जाएं',
      'nav.home': 'होम',
      'nav.explore': 'गंतव्य खोजें',
      'nav.planner': 'ट्रिप प्लानर',
      'nav.tools': 'यात्रा उपकरण',
      'nav.guides': 'गाइड और सुरक्षा',
      'nav.assistant': 'AI सहायक',
      'nav.dashboard': 'मेरा डैशबोर्ड',
      'nav.about': 'हमारे बारे में',
      'nav.gems': 'अनछुए रत्न',
      'nav.safety': 'यात्रा सुरक्षा',
      'nav.sustainable': 'सस्टेनेबल पर्यटन',
      'nav.reviews': 'समीक्षा और रेटिंग',
      'nav.routePlanner': 'गूगल मैप्स रूट प्लानर',
      'auth.loginSignup': 'लॉगिन / साइन अप',
      'auth.account': 'खाता',
      'auth.myAccount': 'मेरा खाता',

      // Footer
      'footer.tagline': 'अधिक खोजें। सीमाओं से परे अनुभव करें।',
      'footer.about': 'भारत के पर्वतों, समुद्री तटों और ऐतिहासिक शहरों के लिए सोच-समझकर बनाई गई यात्रा खोज और बजट योजना।',
      'footer.quickLinks': 'त्वरित लिंक',
      'footer.contact': 'संपर्क जानकारी',
      'footer.connect': 'जुड़ें और कानूनी जानकारी',
      'footer.privacy': 'गोपनीयता नीति',
      'footer.terms': 'उपयोग की शर्तें',
      'footer.demo': 'डेमो डेटा सूचना',
      'footer.rights': 'यात्रा स्फीयर। सर्वाधिकार सुरक्षित।',

      // Homepage
      'hero.tagline': 'अधिक खोजें। सीमाओं से परे अनुभव करें।',
      'hero.title': 'आपकी अगली यादगार यात्रा यहीं से शुरू होती है।',
      'hero.subtitle': 'भारत के शांत पहाड़ों, बैकवाटर्स, समुद्र तटों और जीवंत विरासत की खोज करें—सटीक यात्रा कार्यक्रम और स्पष्ट बजट मार्गदर्शन के साथ।',
      'hero.searchPlaceholder': 'मनाली, गोवा, कश्मीर, केरल, जयपुर, मेघालय खोजें...',
      'hero.searchBtn': 'खोजें',
      'hero.popular': 'लोकप्रिय:',
      'hero.exploreCta': 'गंतव्य देखें',
      'hero.planCta': 'यात्रा की योजना बनाएं',
      'home.curatedKicker': 'चुनिंदा क्षेत्र',
      'home.popularTitle': 'लोकप्रिय गंतव्य',
      'home.popularLead': 'सही मौसम, प्राकृतिक विविधता और संतुलित गति के लिए चुने गए भारत के छह प्रमुख क्षेत्र।',
      'home.exploreAllBtn': 'सभी 16 भारतीय गंतव्य देखें →',
      'home.whyKicker': 'यात्रा स्फीयर के बारे में',
      'home.whyTitle': 'यात्रा स्फीयर क्यों चुनें?',
      'home.howKicker': 'सरल कार्यप्रणाली',
      'home.howTitle': 'यह कैसे काम करता है',
      'home.expKicker': 'चुनिंदा शैलियाँ',
      'home.expTitle': 'प्रमुख यात्रा अनुभव',
      'home.plannerKicker': 'स्मार्ट यात्रा आधार',
      'home.plannerTitle': 'यात्रा स्फीयर प्लानर से कुछ सेकंड में संतुलित यात्रा बनाएं',
      'home.toolsKicker': 'इंटरैक्टिव उपयोगिताएँ',
      'home.toolsTitle': 'यात्रा उपकरण',
      'home.toolsCta': 'यात्रा उपकरण खोलें →',
      'home.guidesKicker': 'ऑफबीट, सुरक्षित और जिम्मेदार यात्रा',
      'home.guidesTitle': 'गाइड, अनछुए रत्न और समुदाय',
      'home.guidesLead': 'भीड़भाड़ से दूर बजट-अनुकूल अनछुए स्थान, सत्यापित भारतीय आपातकालीन नंबर, जिम्मेदार यात्रा सुझाव और यात्री समीक्षाएँ देखें।',
      'home.guidesCta': 'गाइड हब खोलें →',
      'home.testimonialsTitle': 'यात्री अपने मार्ग कैसे संवारते हैं',

      // Google Maps & Smart Travel Route Planner
      'rp.kicker': 'अपनी यात्रा की योजना बनाएं',
      'rp.title': 'आपकी यात्रा, आपका तरीका।',
      'rp.subtitle': 'अपना शुरुआती स्थान, गंतव्य और यात्रा प्राथमिकताएं चुनें। Google Maps को अपनी यात्रा का मार्गदर्शन करने दें।',
      'rp.openMapsBtn': 'Google Maps पर मार्ग दिखाएं',
      'rp.openReturnBtn': 'Google Maps में वापसी मार्ग खोलें',
      'rp.swapBtn': 'स्थान बदलें',
      'rp.resetBtn': 'फ़ॉर्म रीसेट करें',
      'rp.copyBtn': 'यात्रा विवरण कॉपी करें',
      'rp.addStopBtn': '+ स्टॉप जोड़ें',

      // Guides Hub
      'guides.bannerTitle': 'यात्रा गाइड, सुरक्षा और समुदाय',
      'guides.bannerSub': 'भारत के अनछुए पर्यटन स्थल खोजें, आपातकालीन हेल्पलाइन व दस्तावेज़ जांचें, इको-फ्रेंडली पर्यटन जानें और समीक्षाएँ पढ़ें या साझा करें।',
      'guides.tabGems': 'अनछुए रत्न',
      'guides.tabSafety': 'यात्रा सुरक्षा',
      'guides.tabSustainable': 'सस्टेनेबल पर्यटन',
      'guides.tabReviews': 'समीक्षा और रेटिंग',
      'guides.gemsKicker': 'ऑफबीट भारत',
      'guides.gemsTitle': 'हिडन जेम्स एक्सप्लोरर (अनछुए रत्न)',
      'guides.gemsLead': 'प्रामाणिक स्थानीय अनुभव और कम बजट के लिए चुनी गई कम-प्रचलित भारतीय घाटियाँ, विरासत कस्बे और तटीय मार्ग।',
      'guides.safetyKicker': 'आपातकालीन तैयारी',
      'guides.safetyTitle': 'यात्रा सुरक्षा और आपातकालीन गाइड',
      'guides.safetyLead': 'सत्यापित राष्ट्रीय हेल्पलाइन, दस्तावेज़ चेकलिस्ट, मौसम सावधानियाँ और OpenStreetMap आधारित नजदीकी अस्पताल/पुलिस खोज।',
      'guides.ecoKicker': 'कम-प्रभाव यात्राएं',
      'guides.ecoTitle': 'सस्टेनेबल और सामुदायिक पर्यटन',
      'guides.ecoLead': 'ऐसे इको-फ्रेंडली गंतव्य, स्थानीय होमस्टे और जिम्मेदार आदतें जो प्रकृति व स्थानीय कारीगरों को सशक्त बनाती हैं।',
      'guides.revKicker': 'समुदाय की प्रतिक्रिया',
      'guides.revTitle': 'गंतव्य समीक्षाएँ और रेटिंग',
      'guides.revLead': 'डेमो समीक्षाएँ पढ़ें या अपनी रेटिंग और अनुभव साझा करें—यह आपके ब्राउज़र में सुरक्षित रहता है।',

      // Other Pages
      'explore.title': 'भारतीय गंतव्य खोजें',
      'explore.sub': 'पहाड़ों, समुद्र तटों, ऐतिहासिक शहरों, पवित्र घाटों, एडवेंचर ट्रेल्स और वन्यजीव अभयारण्यों में 16 चुनिंदा गंतव्य ब्राउज़ करें।',
      'planner.title': 'AI स्मार्ट ट्रिप प्लानर',
      'planner.sub': 'तीन सरल चरणों में अपना मार्ग, तारीखें, समूह का आकार, INR बजट और रुचियां चुनें और प्रिंट करने योग्य दिन-वार योजना बनाएं।',
      'tools.title': 'यात्रा उपकरण और मार्ग उपयोगिताएँ',
      'tools.sub': 'इंटरैक्टिव OpenStreetMap मानचित्र, 7-दिन का लाइव मौसम पूर्वानुमान, ठहरने के विकल्प और ट्रेन/बस/फ्लाइट/कैब की तुलना देखें।',
      'assistant.title': 'यात्रा स्फीयर ट्रैवल असिस्टेंट',
      'assistant.sub': '16 भारतीय क्षेत्रों के लिए गंतव्य सुझाव, INR बजट मार्गदर्शन, पैकिंग सूची, सही मौसम और परिवार या सोलो यात्रा सलाह पूछें।',
      'dashboard.title': 'आपका यात्रा डैशबोर्ड',
      'dashboard.sub': 'आगामी यात्राएं, सहेजे गए कार्यक्रम, पैकिंग चेकलिस्ट और अपनी प्रोफ़ाइल एक ही स्थान पर प्रबंधित करें।',
      'login.title': 'यात्रा स्फीयर में पुनः स्वागत है',
      'signup.title': 'अपना यात्रा स्फीयर खाता बनाएं'
    }
  };

  function getLang() {
    try {
      const saved = global.localStorage.getItem(LANG_STORAGE_KEY);
      return saved === 'hi' ? 'hi' : 'en';
    } catch (_err) {
      return 'en';
    }
  }

  function t(key, langOverride) {
    const lang = langOverride || getLang();
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
  }

  function applyTranslations(lang) {
    const activeLang = lang === 'hi' ? 'hi' : 'en';
    document.documentElement.lang = activeLang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      const val = t(key, activeLang);
      if (val && val !== key) {
        el.textContent = val;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      const val = t(key, activeLang);
      if (val && val !== key) {
        el.setAttribute('placeholder', val);
      }
    });

    document.querySelectorAll('[data-lang-switch]').forEach((btn) => {
      const btnLang = btn.dataset.langSwitch;
      const isSelected = btnLang === activeLang;
      btn.classList.toggle('active', isSelected);
      btn.setAttribute('aria-pressed', String(isSelected));
    });
  }

  function setLang(lang) {
    const next = lang === 'hi' ? 'hi' : 'en';
    try {
      global.localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch (_err) {
      // Ignore storage errors
    }
    applyTranslations(next);
    document.dispatchEvent(new CustomEvent('yatra:langchange', { detail: { lang: next } }));
  }

  function init() {
    const current = getLang();
    applyTranslations(current);

    document.addEventListener('click', (event) => {
      const switchBtn = event.target.closest('[data-lang-switch]');
      if (!switchBtn) return;
      const targetLang = switchBtn.dataset.langSwitch;
      if (targetLang && targetLang !== getLang()) {
        setLang(targetLang);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.YatraI18n = {
    getLang,
    setLang,
    t,
    applyTranslations
  };
})(window);
