/* ==========================================================================
   شبكة البوصلة الإخبارية (networkbawsala.rawi-ye.com)
   المحرك البرمجي الكلاسيكي المستقر — مؤسسة RAWI-YE.COM الإعلامية الرقمية
   ========================================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ==================== 1. إعدادات الاتصال الثابتة بقاعدة البيانات ====================
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyD-RAWI-01-DEFAULT-KEY-REPLACE-IF-NEEDED",
  authDomain: "rawi-01.firebaseapp.com",
  projectId: "rawi-01",
  storageBucket: "rawi-01.appspot.com",
  messagingSenderId: "100000000000",
  appId: "1:100000000000:web:rawi01bawsala"
};

function resolveFirebaseConfig() {
  try {
    const saved = localStorage.getItem("bawsala_firebase_config") || localStorage.getItem("firebaseConfig");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.projectId) return parsed;
    }
  } catch (_) {}
  return DEFAULT_FIREBASE_CONFIG;
}

const app = initializeApp(resolveFirebaseConfig());
const db = getFirestore(app);
const SITE_BASE_URL = "https://networkbawsala.rawi-ye.com";

// ==================== 2. الأقسام والبوصلات الأساسية المعتمدة ====================
const DEFAULT_COMPASSES = [
  {
    id: "yemen-politics",
    name: "بوصلة السياسة اليمنية",
    slug: "yemen-politics",
    icon: "shield",
    flagUrl: "https://flagcdn.com/w80/ye.png",
    color: "#b91c1c",
    description: "رصد وتحليل معمق للمشهد السياسي والميداني اليمني، ودعم مؤسسات الدولة والشرعية.",
    subcategories: ["الشرعية ومؤسسات الدولة", "التحليلات الاستراتيجية", "الشأن المحلي والمحافظات", "كشف زيف الميليشيات"],
    visible: true,
    order: 1
  },
  {
    id: "saudi-politics",
    name: "بوصلة السياسة السعودية",
    slug: "saudi-politics",
    icon: "public",
    flagUrl: "https://flagcdn.com/w80/sa.png",
    color: "#047857",
    description: "تغطية شاملة للسياسة السعودية، الأمن القومي المشترك، والتحالفات الإقليمية والدولية.",
    subcategories: ["الأمن القومي اليمني السعودي", "الدبلوماسية الإقليمية", "رؤية المملكة 2030", "المشاريع التنموية"],
    visible: true,
    order: 2
  },
  {
    id: "regional-international",
    name: "البوصلة الإقليمية والدولية",
    slug: "regional-international",
    icon: "travel_explore",
    flagUrl: "",
    color: "#0369a1",
    description: "قراءة تحليلية في المتغيرات الجيوسياسية بالشرق الأوسط والعالم.",
    subcategories: ["الشرق الأوسط", "السياسة الدولية", "أمن البحر الأحمر والممرات"],
    visible: true,
    order: 3
  },
  {
    id: "culture-thought",
    name: "بوصلة الثقافة والفكر",
    slug: "culture-thought",
    icon: "menu_book",
    flagUrl: "",
    color: "#6d28d9",
    description: "مساحة حرة للأدب، الفكر، الهوية الوطنية، والتاريخ الحضاري.",
    subcategories: ["أدب وفكر", "تاريخ وهوية", "قراءات وكتب", "مقالات الرأي"],
    visible: true,
    order: 4
  },
  {
    id: "tech-future",
    name: "بوصلة التقنية والمستقبل",
    slug: "tech-future",
    icon: "memory",
    flagUrl: "",
    color: "#0f766e",
    description: "مواكبة ثورة الذكاء الاصطناعي، الأمن السيبراني، والتحول الرقمي.",
    subcategories: ["الذكاء الاصطناعي", "الأمن السيبراني", "تطبيقات ومنصات", "ابتكارات"],
    visible: true,
    order: 5
  },
  {
    id: "art-media",
    name: "بوصلة الفن والإعلام",
    slug: "art-media",
    icon: "theater_comedy",
    flagUrl: "",
    color: "#be185d",
    description: "متابعة المشهد الفني، الدراما، السينما، وصناعة الإعلام الجديد.",
    subcategories: ["فن ودراما", "إعلام رقمي", "تراث وفنون"],
    visible: true,
    order: 6
  },
  {
    id: "economy-dev",
    name: "بوصلة الاقتصاد والتنمية",
    slug: "economy-dev",
    icon: "monitoring",
    flagUrl: "",
    color: "#b45309",
    description: "تحليلات الأسواق، العملات، الطاقة، ومشاريع إعادة الإعمار والتنمية.",
    subcategories: ["أسواق وعملات", "طاقة ونفط", "إعمار وتنمية"],
    visible: true,
    order: 7
  }
];

// ==================== 3. النصوص المؤسسية الرسمية ====================
const DEFAULT_ABOUT_HTML = `
  <p><strong>منصة إخبارية وتحليلية شاملة، تنبض بروح الوطن، وتؤمن بأن الكلمة أمانة والموقف مبدأ.</strong></p>
  <p>تندرج <strong>شبكة البوصلة</strong> تحت مظلة <strong>مؤسسة RAWI-YE.COM الإعلامية الرقمية</strong>، وهي مؤسسة إعلامية مهنية رائدة تضم عدة منصات نوعية متكاملة في رؤيتها ومستقلة في خطوطها التحريرية، من أبرزها "شبكة البوصلة" و"موسوعة الحجرية". ننطلق من رسالة إعلامية راسخة لتكون منصاتنا مساحة رحبة وموضوعية لكل الأقلام الحرة والمبدعة في مختلف المجالات؛ الثقافية، الفنية، التقنية، والتحليلات المعمقة، التزاماً منا بإثراء وعي القارئ العربي ومواكبة الحقيقة بمهنية ومصداقية عالية.</p>
  <h3>التوجيه التحريري والثوابت الوطنية: التزام لا حياد فيه تجاه الاستقرار</h3>
  <p>تتبنى شبكة البوصلة معايير الصحافة الرصينة في التحقق من الحقائق وتقديم محتوى تحليلي موضوعي بعيداً عن التهويل. وفي الوقت الذي نؤمن فيه بالانفتاح المهني وتعددية الطرح في الشؤون العامة، فإننا نؤكد أن <strong>الخط الوطني والسيادي للشبكة هو خط ثابت لا يقبل المساومة</strong>:</p>
  <blockquote>
    <p>• <strong>الانحياز للدولة والاستقرار:</strong> تؤمن المؤسسة ومنصاتها بضرورة دعم مؤسسات الدولة الشرعية، وتعزيز مسار الأمن والاستقرار، ورفض كافة المشاريع الكيانية المتمردة أو الميليشيات التي تسعى لتقويض النسيج الاجتماعي وتخدم الأجندات التخريبية.</p>
    <p>• <strong>الأمن القومي المشترك:</strong> ننطلق من قناعة راسخة بأن أمن الجمهورية اليمنية وأمن المملكة العربية السعودية يمثلان عمقاً استراتيجياً وأمناً قومياً مشتركاً لا يتجزأ. وبناءً عليه، فإننا ندعم كل المساعي والتحالفات التي تصب في مصلحة استقرار المنطقة وسلامتها، ونتخذ موقفاً موضوعياً مناهضاً لكل ما يهدد السلم والأمن الإقليمي.</p>
  </blockquote>
  <p>إن <strong>شبكة البوصلة</strong> تلتزم تماماً بسياسات النشر الرقمي العالمية ومعايير الشفافية والموضوعية، لتظل منبراً إعلامياً رصيناً يخدم الحقيقة، ويعزز الوعي، وينتصر بثبات لمصلحة الوطن ورفعة شأنه.</p>
`;

const DEFAULT_CHARTER_HTML = `
  <p>يمثل هذا الميثاق الدستور المهني والأخلاقي والوطني لكافة المحررين والكتّاب في <strong>شبكة البوصلة (RAWI-YE.COM)</strong>:</p>
  <h3>أولاً: الثوابت الوطنية والسياسية</h3>
  <p>1. الالتزام التام بدعم الدولة والشرعية والاصطفاف مع المصلحة الوطنية العليا، وعدم الترويج لأي خطاب يخدم الميليشيات أو المشاريع التخريبية المعادية.</p>
  <p>2. احترام عمق الأمن القومي المشترك بين اليمن والمملكة العربية السعودية باعتباره ركيزة استقرار المنطقة.</p>
  <h3>ثانياً: المعايير المهنية والتحريرية</h3>
  <p>1. تحري الدقة والمصداقية والاعتماد على المصادر الموثوقة قبل نشر أي خبر أو تحليل.</p>
  <p>2. الكتابة باللغة العربية الفصحى الرصينة، والابتعاد عن الألفاظ النابية أو التجريح الشخصي.</p>
  <p>3. تخضع مقالات الكتّاب الجدد للمراجعة التحريرية قبل النشر، بينما يتمتع الكتّاب الموثقون بالشارة الزرقاء بصلاحية النشر المباشر وفق ضوابط الميثاق.</p>
`;

const DEFAULT_PRIVACY_HTML = `
  <p>تحترم <strong>شبكة البوصلة</strong> خصوصية كافة زوارها وقرّائها، وتلتزم بحماية البيانات وفق أعلى المعايير التقنية:</p>
  <p>• لا نقوم بجمع أي بيانات شخصية عن الزوار أثناء تصفح الأخبار والمقالات.</p>
  <p>• جميع الوثائق المرفوعة من قِبل الصحفيين لأغراض التوثيق بالشارة الزرقاء (KYC) تُحفظ بشكل مشفر وسري ولا يطلع عليها سوى الإدارة العليا للمنصة.</p>
`;

// ==================== 4. حالة التطبيق وضوابط الجلسة ====================
const state = {
  settings: {
    siteName: "شبكة البوصلة",
    networkName: "RAWI-YE.COM",
    siteDescription: "منصة إخبارية وتحليلية شاملة تندرج تحت مظلة مؤسسة RAWI-YE.COM الإعلامية الرقمية",
    logoUrl: "",
    faviconUrl: "",
    coverImageUrl: "",
    accentColor: "#b91c1c",
    aboutHtml: DEFAULT_ABOUT_HTML,
    charterHtml: DEFAULT_CHARTER_HTML,
    privacyHtml: DEFAULT_PRIVACY_HTML,
    socials: {}
  },
  compasses: [...DEFAULT_COMPASSES],
  posts: [],
  staff: [],
  ads: [],
  activeCompassId: "all",
  activeSubcategory: "all",
  activeTag: "",
  searchQuery: "",
  breakingIndex: 0,
  breakingTimer: null
};

let initialRouteHandled = false;
let currentViewName = "home";
let currentOpenPostId = null;
const viewedPostsSession = new Set();

// ==================== 5. الدوال المساعدة ومعالجة النصوص ====================
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function showToast(msg) {
  const toast = document.getElementById("public-toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove("hidden");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.add("hidden"), 3200);
}

function formatArabicDate(timestamp) {
  if (!timestamp) return "الآن";
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  if (isNaN(d.getTime())) return "حديثاً";
  return d.toLocaleDateString("ar-YE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getPostTimestampMs(post) {
  if (!post || !post.createdAt) return 0;
  if (typeof post.createdAt.toMillis === "function") return post.createdAt.toMillis();
  if (post.createdAt.seconds) return post.createdAt.seconds * 1000;
  const parsed = new Date(post.createdAt).getTime();
  return isNaN(parsed) ? 0 : parsed;
}

function isPostPublished(post) {
  if (!post) return false;
  if (post.status === "draft" || post.status === "review" || post.status === "pending" || post.status === "rejected") {
    return false;
  }
  return true;
}

function isBreakingStillActive(post) {
  if (!post || !post.isBreaking) return false;
  const now = Date.now();
  if (post.breakingExpiresAt) {
    const exp = typeof post.breakingExpiresAt === "number" ? post.breakingExpiresAt : new Date(post.breakingExpiresAt).getTime();
    if (exp && now > exp) return false;
  } else if (post.breakingDurationHours) {
    const createdMs = getPostTimestampMs(post);
    const durationMs = Number(post.breakingDurationHours) * 3600 * 1000;
    if (createdMs && durationMs > 0 && now > createdMs + durationMs) return false;
  }
  return true;
}

function getPostCompasses(post) {
  const list = [];
  if (Array.isArray(post.categories)) {
    list.push(...post.categories);
  }
  if (post.category && !list.includes(post.category)) {
    list.push(post.category);
  }
  if (post.compassId && !list.includes(post.compassId)) {
    list.push(post.compassId);
  }
  return list.length ? list : ["بوصلة السياسة اليمنية"];
}

function enrichArticleContent(htmlContent = "") {
  if (!htmlContent) return "";
  const container = document.createElement("div");
  container.innerHTML = htmlContent;

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
  const textNodes = [];
  while (walker.nextNode()) {
    const parentTag = walker.currentNode.parentElement ? walker.currentNode.parentElement.tagName : "";
    if (!["A", "SCRIPT", "STYLE", "CODE", "BUTTON"].includes(parentTag)) {
      textNodes.push(walker.currentNode);
    }
  }

  const urlRegex = /(https?:\/\/[^\s<"]+)/g;
  const hashtagRegex = /(^|\s)#([\u0600-\u06FFa-zA-Z0-9_]{2,40})/g;

  textNodes.forEach((node) => {
    const text = node.nodeValue;
    if (!urlRegex.test(text) && !hashtagRegex.test(text)) return;

    const replacedHtml = escapeHtml(text)
      .replace(
        urlRegex,
        (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:var(--accent);font-weight:800;text-decoration:underline;">${url}</a>`
      )
      .replace(
        hashtagRegex,
        (match, space, tag) =>
          `${space}<button type="button" class="inline-hashtag-btn" data-hashtag="${tag}" style="border:none;background:var(--accent-light);color:var(--accent);padding:1px 8px;border-radius:4px;font-family:inherit;font-weight:800;cursor:pointer;">#${tag}</button>`
      );

    const span = document.createElement("span");
    span.innerHTML = replacedHtml;
    node.parentNode.replaceChild(span, node);
  });

  container.querySelectorAll("a").forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (href.startsWith("http")) {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    }
  });

  return container.innerHTML;
}

// ==================== 6. الفهرسة الذكية (SEO) وصورة الغلاف ====================
function getDefaultCoverImage() {
  return (
    state.settings.coverImageUrl ||
    state.settings.ogImageUrl ||
    state.settings.logoUrl ||
    `${SITE_BASE_URL}/cover.jpg`
  );
}

function updateSeoMeta({ title, description, image, url, type = "website", publishedTime = "", authorName = "" }) {
  const siteName = state.settings.siteName || "شبكة البوصلة";
  const cleanTitle = title ? `${title} | ${siteName}` : `${siteName} | منصة إخبارية وتحليلية شاملة`;
  const cleanDesc = (description || state.settings.siteDescription || "").replace(/<[^>]*>/g, "").slice(0, 170);
  const cleanImg = image || getDefaultCoverImage();
  const cleanUrl = url || window.location.href;

  document.title = cleanTitle;

  const setAttr = (id, attr, val) => {
    const el = document.getElementById(id);
    if (el && val) el.setAttribute(attr, val);
  };

  setAttr("meta-desc", "content", cleanDesc);
  setAttr("canonical-link", "href", cleanUrl);
  setAttr("og-url", "content", cleanUrl);
  setAttr("og-title", "content", cleanTitle);
  setAttr("og-desc", "content", cleanDesc);
  setAttr("og-image", "content", cleanImg);
  setAttr("twitter-title", "content", cleanTitle);
  setAttr("twitter-desc", "content", cleanDesc);
  setAttr("twitter-image", "content", cleanImg);

  let ldScript = document.getElementById("json-ld-seo");
  if (!ldScript) {
    ldScript = document.createElement("script");
    ldScript.id = "json-ld-seo";
    ldScript.type = "application/ld+json";
    document.head.appendChild(ldScript);
  }

  const schemaData =
    type === "article"
      ? {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": title,
          "description": cleanDesc,
          "image": [cleanImg],
          "datePublished": publishedTime || new Date().toISOString(),
          "author": [{ "@type": "Person", "name": authorName || siteName }],
          "publisher": {
            "@type": "Organization",
            "name": `${siteName} — RAWI-YE.COM`,
            "logo": { "@type": "ImageObject", "url": cleanImg }
          },
          "mainEntityOfPage": { "@type": "WebPage", "@id": cleanUrl }
        }
      : {
          "@context": "https://schema.org",
          "@type": "NewsMediaOrganization",
          "name": siteName,
          "alternateName": "RAWI-YE.COM",
          "url": SITE_BASE_URL,
          "image": cleanImg,
          "description": cleanDesc
        };

  ldScript.textContent = JSON.stringify(schemaData);
}

// ==================== 7. تطبيق الهوية البصرية وإعدادات الموقع ====================
function applySiteSettings() {
  const s = state.settings;
  const siteName = s.siteName || "شبكة البوصلة";

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setTxt("ui-site-name", siteName);
  setTxt("sidebar-site-title", siteName);
  setTxt("footer-site-name", siteName);
  setTxt("footer-site-desc", s.siteDescription || "منصة إخبارية وتحليلية شاملة تندرج تحت مظلة مؤسسة RAWI-YE.COM الإعلامية الرقمية");

  if (s.accentColor && state.activeCompassId === "all") {
    document.documentElement.style.setProperty("--accent", s.accentColor);
  }

  const logoPairs = [
    { imgId: "custom-logo-img", markId: "default-brand-mark" },
    { imgId: "sidebar-logo-img", markId: "sidebar-default-mark" },
    { imgId: "footer-logo-img", markId: "footer-default-mark" }
  ];

  logoPairs.forEach(({ imgId, markId }) => {
    const imgEl = document.getElementById(imgId);
    const markEl = document.getElementById(markId);
    if (!imgEl) return;

    if (s.logoUrl && s.logoUrl.trim() !== "") {
      imgEl.src = s.logoUrl.trim();
      imgEl.classList.remove("hidden");
      if (markEl) markEl.classList.add("hidden");
      imgEl.onerror = () => {
        imgEl.classList.add("hidden");
        if (markEl) markEl.classList.remove("hidden");
      };
    } else {
      imgEl.classList.add("hidden");
      if (markEl) markEl.classList.remove("hidden");
    }
  });

  const favUrl = (s.faviconUrl && s.faviconUrl.trim()) || (s.logoUrl && s.logoUrl.trim()) || "";
  if (favUrl) {
    const fav = document.getElementById("dynamic-favicon");
    const appFav = document.getElementById("apple-favicon");
    if (fav) fav.href = favUrl;
    if (appFav) appFav.href = favUrl;
  }

  if (currentViewName === "home" && state.activeCompassId === "all" && !state.activeTag) {
    updateSeoMeta({
      title: "",
      description: s.siteDescription,
      image: getDefaultCoverImage(),
      url: window.location.href
    });
  }

  renderSocialLinks("sidebar-social-links", s.socials);
  renderSocialLinks("footer-social-links", s.socials);
}

function renderSocialLinks(containerId, socials = {}) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  const items = [
    { label: "واتساب", url: socials.whatsapp },
    { label: "تليجرام", url: socials.telegram },
    { label: "منصة X", url: socials.x || socials.twitter },
    { label: "فيسبوك", url: socials.facebook },
    { label: "يوتيوب", url: socials.youtube }
  ].filter((i) => i.url && i.url.trim() !== "");

  wrap.innerHTML = items
    .map((i) => `<a href="${escapeHtml(i.url)}" target="_blank" rel="noopener noreferrer" class="social-pill">${i.label}</a>`)
    .join("");
}

// ==================== 8. إدارة الأقسام وشريط التصفح الكلاسيكي (BBC Category Strip) ====================
function getVisibleCompasses() {
  return state.compasses
    .filter((c) => c.visible !== false)
    .sort((a, b) => (a.order || 99) - (b.order || 99));
}

function findCompass(identifier) {
  if (!identifier || identifier === "all") return null;
  return (
    state.compasses.find(
      (c) => c.id === identifier || c.slug === identifier || c.name === identifier
    ) || {
      id: identifier,
      name: identifier,
      icon: "explore",
      flagUrl: "",
      color: "#b91c1c",
      description: `تغطية شاملة ومقالات متخصصة ضمن ${identifier}`,
      subcategories: []
    }
  );
}

function renderTopCategoriesBar() {
  const topList = document.getElementById("top-categories-list");
  if (!topList) return;

  const compasses = getVisibleCompasses();
  topList.innerHTML = [
    `<li>
      <button type="button" class="cat-nav-item ${state.activeCompassId === "all" && currentViewName === "home" ? "active" : ""}" data-compass-nav="all">الرئيسية</button>
    </li>`,
    ...compasses.map(
      (c) => `
      <li>
        <button type="button" class="cat-nav-item ${
          state.activeCompassId === c.id || state.activeCompassId === c.name ? "active" : ""
        }" data-compass-nav="${escapeHtml(c.id)}">${escapeHtml(c.name)}</button>
      </li>`
    )
  ].join("");

  topList.querySelectorAll("[data-compass-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-compass-nav");
      selectCompass(id, "all", true);
    });
  });
}

function renderSidebarMenu() {
  const list = document.getElementById("sidebar-menu-list");
  if (!list) return;

  const compasses = getVisibleCompasses();
  list.innerHTML = [
    `<li>
      <button type="button" class="sidebar-menu-btn ${state.activeCompassId === "all" ? "active" : ""}" data-side-compass="all">
        <span class="side-btn-content">
          <span class="material-symbols-rounded" translate="no">home</span>
          <span>الرئيسية (كل الأقسام)</span>
        </span>
        <span class="material-symbols-rounded side-arrow" translate="no">chevron_left</span>
      </button>
    </li>`,
    ...compasses.map(
      (c) => `
      <li>
        <button type="button" class="sidebar-menu-btn ${
          state.activeCompassId === c.id || state.activeCompassId === c.name ? "active" : ""
        }" data-side-compass="${escapeHtml(c.id)}">
          <span class="side-btn-content">
            <span class="material-symbols-rounded" translate="no">${c.icon || "explore"}</span>
            <span>${escapeHtml(c.name)}</span>
          </span>
          <span class="material-symbols-rounded side-arrow" translate="no">chevron_left</span>
        </button>
      </li>`
    )
  ].join("");

  list.querySelectorAll(".sidebar-menu-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-side-compass");
      closeSidebar();
      selectCompass(id, "all", true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function renderCompassesHub() {
  const grid = document.getElementById("compasses-hub-grid");
  if (!grid) return;

  const compasses = getVisibleCompasses();
  const publishedPosts = state.posts.filter(isPostPublished);

  grid.innerHTML = compasses
    .map((comp) => {
      const count = publishedPosts.filter((p) => {
        const pCats = getPostCompasses(p);
        return pCats.includes(comp.name) || pCats.includes(comp.id);
      }).length;

      const subs = Array.isArray(comp.subcategories) ? comp.subcategories : [];
      return `
        <article class="compass-hub-card" data-compass-id="${escapeHtml(comp.id)}" style="border-top: 4px solid ${comp.color || "#b91c1c"};">
          <div class="compass-card-top">
            ${
              comp.flagUrl
                ? `<img src="${escapeHtml(comp.flagUrl)}" alt="${escapeHtml(comp.name)}" class="compass-flag-img">`
                : `<div class="compass-icon-box" style="color:${comp.color || "#b91c1c"};"><span class="material-symbols-rounded" translate="no">${comp.icon || "explore"}</span></div>`
            }
            <div>
              <h3 style="font-size:1.08rem;font-weight:900;">${escapeHtml(comp.name)}</h3>
              <span class="badge-pill" style="margin-top:4px;">${count} مادة منشورة</span>
            </div>
          </div>
          <p style="font-size:0.85rem;color:var(--text-secondary);">${escapeHtml(comp.description || "")}</p>
          ${
            subs.length
              ? `<div class="compass-card-subs">${subs
                  .map((s) => `<span class="sub-pill" style="font-size:0.74rem;padding:3px 10px;">${escapeHtml(s)}</span>`)
                  .join("")}</div>`
              : ""
          }
        </article>
      `;
    })
    .join("");

  grid.querySelectorAll(".compass-hub-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-compass-id");
      selectCompass(id, "all", true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function selectCompass(compassIdentifier, subcategory = "all", pushHistory = true) {
  state.activeCompassId = compassIdentifier || "all";
  state.activeSubcategory = subcategory || "all";
  state.activeTag = "";
  currentOpenPostId = null;

  const banner = document.getElementById("active-compass-banner");
  const flagImg = document.getElementById("active-compass-flag");
  const iconBox = document.getElementById("active-compass-icon-box");
  const iconEl = document.getElementById("active-compass-icon");
  const titleEl = document.getElementById("active-compass-title");
  const descEl = document.getElementById("active-compass-desc");
  const subsBar = document.getElementById("subcategories-bar");

  if (state.activeCompassId === "all") {
    if (banner) banner.classList.add("hidden");
    document.documentElement.style.setProperty("--accent", state.settings.accentColor || "#b91c1c");

    if (pushHistory) {
      const url = new URL(window.location.href);
      url.search = "";
      window.history.pushState({ view: "home" }, "", url.pathname);
    }
    updateSeoMeta({
      title: "",
      description: state.settings.siteDescription,
      image: getDefaultCoverImage(),
      url: SITE_BASE_URL
    });
  } else {
    const comp = findCompass(state.activeCompassId);
    document.documentElement.style.setProperty("--accent", comp.color || "#b91c1c");

    if (banner) banner.classList.remove("hidden");
    if (titleEl) titleEl.textContent = comp.name;
    if (descEl) descEl.textContent = comp.description || "";

    if (comp.flagUrl && comp.flagUrl.trim() !== "") {
      if (flagImg) {
        flagImg.src = comp.flagUrl.trim();
        flagImg.classList.remove("hidden");
      }
      if (iconBox) iconBox.classList.add("hidden");
    } else {
      if (flagImg) flagImg.classList.add("hidden");
      if (iconBox) iconBox.classList.remove("hidden");
      if (iconEl) iconEl.textContent = comp.icon || "explore";
    }

    const subs = Array.isArray(comp.subcategories) ? comp.subcategories : [];
    if (subs.length > 0 && subsBar) {
      subsBar.classList.remove("hidden");
      subsBar.innerHTML = [
        `<button type="button" class="sub-pill ${state.activeSubcategory === "all" ? "active" : ""}" data-sub="all">كل فئات ${escapeHtml(comp.name)}</button>`,
        ...subs.map(
          (sub) =>
            `<button type="button" class="sub-pill ${state.activeSubcategory === sub ? "active" : ""}" data-sub="${escapeHtml(sub)}">${escapeHtml(sub)}</button>`
        )
      ].join("");

      subsBar.querySelectorAll(".sub-pill").forEach((btn) => {
        btn.addEventListener("click", () => {
          const chosenSub = btn.getAttribute("data-sub") || "all";
          selectCompass(state.activeCompassId, chosenSub, false);
        });
      });
    } else if (subsBar) {
      subsBar.classList.add("hidden");
    }

    if (pushHistory) {
      const compUrl = `?compass=${encodeURIComponent(comp.id || comp.name)}`;
      window.history.pushState({ view: "compass", id: comp.id || comp.name }, "", compUrl);
    }

    updateSeoMeta({
      title: comp.name,
      description: comp.description || state.settings.siteDescription,
      image: getDefaultCoverImage(),
      url: `${SITE_BASE_URL}/?compass=${encodeURIComponent(comp.id || comp.name)}`
    });
  }

  switchView("home", false);
  renderTopCategoriesBar();
  renderSidebarMenu();
  renderHomeFeed();
}

function selectHashtag(tag, pushHistory = true) {
  const cleanTag = String(tag || "").replace(/^#/, "").trim();
  if (!cleanTag) return;

  state.activeTag = cleanTag;
  state.activeCompassId = "all";
  state.activeSubcategory = "all";
  currentOpenPostId = null;

  const banner = document.getElementById("active-compass-banner");
  const flagImg = document.getElementById("active-compass-flag");
  const iconBox = document.getElementById("active-compass-icon-box");
  const iconEl = document.getElementById("active-compass-icon");
  const titleEl = document.getElementById("active-compass-title");
  const descEl = document.getElementById("active-compass-desc");
  const subsBar = document.getElementById("subcategories-bar");

  if (banner) banner.classList.remove("hidden");
  if (flagImg) flagImg.classList.add("hidden");
  if (iconBox) iconBox.classList.remove("hidden");
  if (iconEl) iconEl.textContent = "sell";
  if (titleEl) titleEl.textContent = `#${cleanTag}`;
  if (descEl) descEl.textContent = `جميع الأخبار والتقارير المرتبطة بالوسم #${cleanTag}`;
  if (subsBar) subsBar.classList.add("hidden");

  if (pushHistory) {
    window.history.pushState({ view: "tag", tag: cleanTag }, "", `?tag=${encodeURIComponent(cleanTag)}`);
  }

  updateSeoMeta({
    title: `وسم #${cleanTag}`,
    description: `تصفح كافة الأخبار والتقارير المنشورة تحت وسم #${cleanTag} في شبكة البوصلة`,
    image: getDefaultCoverImage(),
    url: `${SITE_BASE_URL}/?tag=${encodeURIComponent(cleanTag)}`
  });

  switchView("home", true);
  renderTopCategoriesBar();
  renderHomeFeed();
}

// ==================== 9. شريط الأخبار العاجلة والأخبار السريعة ====================
function renderBreakingAndQuickNews() {
  const published = state.posts.filter(isPostPublished);
  const activeBreaking = published.filter(isBreakingStillActive);
  const quickPosts = published.filter((p) => p.isQuickNews || isBreakingStillActive(p)).slice(0, 8);

  const tickerWrap = document.getElementById("breaking-ticker-wrap");
  const listEl = document.getElementById("breaking-list");
  const counterEl = document.getElementById("breaking-counter");

  if (!activeBreaking.length) {
    if (tickerWrap) tickerWrap.classList.add("hidden");
    clearInterval(state.breakingTimer);
  } else {
    if (tickerWrap) tickerWrap.classList.remove("hidden");
    if (state.breakingIndex >= activeBreaking.length) state.breakingIndex = 0;

    const showCurrentBreaking = () => {
      const item = activeBreaking[state.breakingIndex];
      if (!item || !listEl) return;
      if (counterEl) counterEl.textContent = `${state.breakingIndex + 1}/${activeBreaking.length}`;
      listEl.innerHTML = `<a class="breaking-item" data-post-id="${escapeHtml(item.id)}">${escapeHtml(item.title)}</a>`;
      const link = listEl.querySelector(".breaking-item");
      if (link) link.addEventListener("click", () => openArticle(item.id, true));
    };

    showCurrentBreaking();
    clearInterval(state.breakingTimer);
    if (activeBreaking.length > 1) {
      state.breakingTimer = setInterval(() => {
        state.breakingIndex = (state.breakingIndex + 1) % activeBreaking.length;
        showCurrentBreaking();
      }, 5000);
    }
  }

  const quickListEl = document.getElementById("quick-news-sidebar-list");
  if (quickListEl) {
    if (!quickPosts.length) {
      quickListEl.innerHTML = `<div class="empty-hint" style="padding:12px;">لا توجد أخبار سريعة حالياً.</div>`;
    } else {
      quickListEl.innerHTML = quickPosts
        .map(
          (q) => `
          <div class="quick-news-item" data-quick-id="${escapeHtml(q.id)}" style="cursor:pointer;">
            <span class="quick-news-time">
              <span class="material-symbols-rounded" translate="no" style="font-size:14px;">bolt</span>
              <span>${formatArabicDate(q.createdAt)}</span>
            </span>
            <strong style="display:block;">${escapeHtml(q.title)}</strong>
          </div>
        `
        )
        .join("");

      quickListEl.querySelectorAll(".quick-news-item").forEach((el) => {
        el.addEventListener("click", () => openArticle(el.getAttribute("data-quick-id"), true));
      });
    }
  }
}

// ==================== 10. عرض الإعلانات الكلاسيكية ====================
function renderAdsSlot() {
  const topSlot = document.getElementById("ad-slot-top");
  if (!topSlot) return;

  const activeAds = state.ads.filter((a) => a.active !== false);
  if (!activeAds.length) {
    topSlot.innerHTML = "";
    return;
  }

  const ad = activeAds[0];
  topSlot.innerHTML = buildAdHtml(ad);
  bindAdEvents(topSlot, ad.id);
}

function buildAdHtml(ad) {
  if (!ad) return "";
  if (ad.styleType === "leaderboard" && ad.imageUrl) {
    return `
      <div class="leaderboard-ad-banner" data-ad-box="${escapeHtml(ad.id)}">
        <button type="button" class="glass-ad-close leaderboard-close-float" data-close-ad="${escapeHtml(ad.id)}" title="إخفاء الإعلان">
          <span class="material-symbols-rounded" translate="no" style="font-size:16px;">close</span>
        </button>
        <a href="${escapeHtml(ad.targetUrl || "#")}" target="_blank" rel="noopener noreferrer" class="leaderboard-ad-link" data-click-ad="${escapeHtml(ad.id)}">
          <img src="${escapeHtml(ad.imageUrl)}" alt="${escapeHtml(ad.title)}" class="leaderboard-ad-img" loading="lazy">
          <div class="leaderboard-ad-bar">
            <span><span class="glass-ad-tag">رعاية رسمية</span> ${escapeHtml(ad.title)}</span>
            <span style="color:var(--accent);display:inline-flex;align-items:center;gap:4px;">
              <span>زيارة الرابط</span>
              <span class="material-symbols-rounded" translate="no" style="font-size:16px;">open_in_new</span>
            </span>
          </div>
        </a>
      </div>
    `;
  }

  return `
    <div class="glass-ad-banner" data-ad-box="${escapeHtml(ad.id)}">
      <a href="${escapeHtml(ad.targetUrl || "#")}" target="_blank" rel="noopener noreferrer" class="glass-ad-clickable" data-click-ad="${escapeHtml(ad.id)}">
        ${ad.imageUrl ? `<img src="${escapeHtml(ad.imageUrl)}" alt="${escapeHtml(ad.title)}" class="glass-ad-thumb" loading="lazy">` : ""}
        <div>
          <span class="glass-ad-tag">مادة إعلانية</span>
          <h4 class="glass-ad-title">${escapeHtml(ad.title)}</h4>
          <p class="glass-ad-sponsor">${escapeHtml(ad.sponsorName || "شركاء شبكة البوصلة")}</p>
        </div>
      </a>
      <button type="button" class="glass-ad-close" data-close-ad="${escapeHtml(ad.id)}" title="إغلاق">
        <span class="material-symbols-rounded" translate="no" style="font-size:16px;">close</span>
      </button>
    </div>
  `;
}

function bindAdEvents(container, adId) {
  const closeBtn = container.querySelector(`[data-close-ad="${adId}"]`);
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const box = container.querySelector(`[data-ad-box="${adId}"]`);
      if (box) box.remove();
    });
  }

  const clickLink = container.querySelector(`[data-click-ad="${adId}"]`);
  if (clickLink) {
    clickLink.addEventListener("click", () => {
      updateDoc(doc(db, "ads", adId), { clicks: increment(1) }).catch(() => {});
    });
  }
}

// ==================== 11. إدارة الكتّاب وشريط أقلام الصحيفة ====================
function findAuthorInfo(post) {
  const staffMatch = state.staff.find(
    (s) =>
      (post.authorEmail && s.email && s.email.toLowerCase() === post.authorEmail.toLowerCase()) ||
      (post.author && s.name === post.author)
  );
  return {
    name: (staffMatch && staffMatch.name) || post.author || "هيئة التحرير",
    avatar:
      (staffMatch && staffMatch.avatar) ||
      post.authorAvatar ||
      "https://ui-avatars.com/api/?name=" + encodeURIComponent(post.author || "البوصلة") + "&background=b91c1c&color=fff",
    verified: Boolean((staffMatch && staffMatch.verified) || post.authorVerified),
    roleTitle: (staffMatch && staffMatch.jobTitle) || "كاتب ومحرر صحفي",
    email: (staffMatch && staffMatch.email) || post.authorEmail || ""
  };
}

function getAllActiveAuthors() {
  const published = state.posts.filter(isPostPublished);
  const authorsMap = new Map();

  state.staff.forEach((s) => {
    if (s.suspended) return;
    const key = (s.email || s.name || "").toLowerCase();
    if (!key) return;
    authorsMap.set(key, {
      id: s.email || s.name,
      name: s.name || "كاتب صحفي",
      email: s.email || "",
      jobTitle: s.jobTitle || "كاتب ومحرر في شبكة البوصلة",
      bio: s.bio || "كاتب ومحلل مشارك في شبكة البوصلة الإخبارية.",
      avatar:
        s.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name || "كاتب")}&background=b91c1c&color=fff`,
      verified: Boolean(s.verified),
      socials: s.socials || {}
    });
  });

  published.forEach((p) => {
    const key = (p.authorEmail || p.author || "").toLowerCase();
    if (!key || authorsMap.has(key)) return;
    authorsMap.set(key, {
      id: p.authorEmail || p.author,
      name: p.author || "هيئة التحرير",
      email: p.authorEmail || "",
      jobTitle: "كاتب ومحرر صحفي",
      bio: "كاتب مشارك في شبكة البوصلة.",
      avatar:
        p.authorAvatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(p.author || "كاتب")}&background=b91c1c&color=fff`,
      verified: Boolean(p.authorVerified),
      socials: {}
    });
  });

  return Array.from(authorsMap.values()).map((a) => {
    const writerPosts = published.filter(
      (p) =>
        (a.email && p.authorEmail && p.authorEmail.toLowerCase() === a.email.toLowerCase()) ||
        p.author === a.name
    );
    return { ...a, postCount: writerPosts.length, posts: writerPosts };
  });
}

function renderAuthorsHorizontalRibbon() {
  const section = document.getElementById("authors-ribbon-section");
  const track = document.getElementById("authors-ribbon-track");
  if (!section || !track) return;

  const authors = getAllActiveAuthors();
  if (!authors.length || state.activeCompassId !== "all" || state.activeTag || state.searchQuery) {
    section.classList.add("hidden");
    return;
  }

  section.classList.remove("hidden");
  track.innerHTML = authors
    .map(
      (a) => `
      <div class="author-ribbon-item" data-ribbon-author="${escapeHtml(a.id)}">
        <div class="author-ribbon-avatar-wrap">
          <img src="${escapeHtml(a.avatar)}" alt="${escapeHtml(a.name)}" class="author-ribbon-avatar" loading="lazy">
          ${
            a.verified
              ? `<span class="material-symbols-rounded author-ribbon-verified" translate="no" title="صحفي موثق">verified</span>`
              : ""
          }
        </div>
        <span class="author-ribbon-name">${escapeHtml(a.name)}</span>
        <span class="author-ribbon-role">${escapeHtml(a.jobTitle)}</span>
      </div>
    `
    )
    .join("");

  track.querySelectorAll("[data-ribbon-author]").forEach((item) => {
    item.addEventListener("click", () => openAuthorProfile(item.getAttribute("data-ribbon-author"), true));
  });
}

// ==================== 12. عرض الصفحة الرئيسية وتدفق الأخبار (BBC Feed) ====================
function renderHomeFeed() {
  const heroWrap = document.getElementById("hero-section");
  const grid = document.getElementById("posts-grid");
  const heading = document.getElementById("feed-heading");
  const trendWrap = document.getElementById("trending-list");
  if (!grid) return;

  renderAuthorsHorizontalRibbon();

  let list = state.posts.filter(isPostPublished);

  if (state.activeCompassId !== "all") {
    const comp = findCompass(state.activeCompassId);
    list = list.filter((p) => {
      const pCats = getPostCompasses(p);
      return pCats.includes(comp.name) || pCats.includes(comp.id) || pCats.includes(state.activeCompassId);
    });

    if (state.activeSubcategory !== "all") {
      list = list.filter(
        (p) =>
          p.subcategory === state.activeSubcategory ||
          (Array.isArray(p.tags) && p.tags.includes(state.activeSubcategory))
      );
    }
    if (heading) heading.textContent = comp.name;
  } else if (state.activeTag) {
    const t = state.activeTag.toLowerCase();
    list = list.filter((p) => {
      const inTags = Array.isArray(p.tags) && p.tags.some((tag) => String(tag).toLowerCase() === t);
      const inText = `${p.title || ""} ${p.content || ""}`.toLowerCase().includes(`#${t}`);
      return inTags || inText;
    });
    if (heading) heading.textContent = `الموضوع: #${state.activeTag}`;
  } else if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase().replace(/^#/, "");
    list = list.filter((p) => {
      const hay = `${p.title || ""} ${p.summary || ""} ${p.author || ""} ${(p.tags || []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
    if (heading) heading.textContent = `نتائج البحث: "${state.searchQuery}"`;
  } else {
    if (heading) heading.textContent = "أحدث الأخبار والتقارير";
  }

  const countBadge = document.getElementById("search-count-badge");
  if (countBadge) {
    if (state.searchQuery) {
      countBadge.textContent = String(list.length);
      countBadge.classList.remove("hidden");
    } else {
      countBadge.classList.add("hidden");
    }
  }

  // الخبر الرئيسي البارز (Top Story)
  if (heroWrap) {
    const showHero = state.activeCompassId === "all" && !state.activeTag && !state.searchQuery && list.length > 0;
    if (!showHero) {
      heroWrap.innerHTML = "";
      heroWrap.classList.add("hidden");
    } else {
      const heroPost = list.find((p) => p.isFeatured) || list[0];
      const author = findAuthorInfo(heroPost);
      const primaryCompass = getPostCompasses(heroPost)[0];
      heroWrap.classList.remove("hidden");
      heroWrap.innerHTML = `
        <article class="hero-card" data-open-post="${escapeHtml(heroPost.id)}">
          <div class="hero-img-wrap">
            <img src="${escapeHtml(
              heroPost.imageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1000&q=80"
            )}" alt="${escapeHtml(heroPost.title)}">
          </div>
          <div class="hero-content">
            <div class="article-badges">
              <span class="badge-pill">تغطية رئيسية</span>
              <span class="badge-pill">${escapeHtml(primaryCompass)}</span>
            </div>
            <h2 class="hero-title">${escapeHtml(heroPost.title)}</h2>
            <p class="hero-summary">${escapeHtml(heroPost.summary || "")}</p>
            <div class="card-footer" style="border-top:none;padding-top:4px;">
              <div class="card-author-wrap">
                <img src="${escapeHtml(author.avatar)}" alt="" class="card-author-avatar">
                <span>${escapeHtml(author.name)}</span>
                ${author.verified ? `<span class="verified-badge" translate="no">verified</span>` : ""}
              </div>
              <span>${formatArabicDate(heroPost.createdAt)}</span>
            </div>
          </div>
        </article>
      `;
      heroWrap.querySelector("[data-open-post]")?.addEventListener("click", () => openArticle(heroPost.id, true));
    }
  }

  // شبكة المقالات الكلاسيكية
  if (!list.length) {
    grid.innerHTML = `<div class="skeleton-card" style="grid-column: 1 / -1;">لا توجد مواد منشورة تطابق هذا الاختيار حالياً.</div>`;
  } else {
    grid.innerHTML = list.map((post) => buildNewsCardHtml(post)).join("");
    grid.querySelectorAll("[data-open-post]").forEach((card) => {
      card.addEventListener("click", () => openArticle(card.getAttribute("data-open-post"), true));
    });
  }

  // قائمة الأكثر قراءة (مرتبة حسب القراءة داخلياً بدون إظهار الرقم للجمهور)
  if (trendWrap) {
    const topPosts = [...state.posts.filter(isPostPublished)]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);

    trendWrap.innerHTML = topPosts
      .map(
        (p, idx) => `
        <div class="trend-item" data-open-post="${escapeHtml(p.id)}">
          <span class="trend-rank">${idx + 1}</span>
          <h4 class="trend-title">${escapeHtml(p.title)}</h4>
        </div>
      `
      )
      .join("");

    trendWrap.querySelectorAll("[data-open-post]").forEach((item) => {
      item.addEventListener("click", () => openArticle(item.getAttribute("data-open-post"), true));
    });
  }
}

function buildNewsCardHtml(post) {
  const author = findAuthorInfo(post);
  const compasses = getPostCompasses(post);
  const thumb =
    post.imageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80";

  return `
    <article class="news-card" data-open-post="${escapeHtml(post.id)}">
      <div class="card-thumb-wrap">
        <img src="${escapeHtml(thumb)}" alt="${escapeHtml(post.title)}" loading="lazy">
        <span class="card-cat-float">${escapeHtml(compasses[0])}</span>
        ${
          post.videoUrl
            ? `<span class="media-overlay-icon"><span class="material-symbols-rounded" translate="no">play_arrow</span></span>`
            : ""
        }
      </div>
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(post.title)}</h3>
        <p class="card-excerpt">${escapeHtml(post.summary || "")}</p>
        <div class="card-footer">
          <div class="card-author-wrap">
            <img src="${escapeHtml(author.avatar)}" alt="" class="card-author-avatar" loading="lazy">
            <span>${escapeHtml(author.name)}</span>
            ${author.verified ? `<span class="verified-badge" translate="no">verified</span>` : ""}
          </div>
          <span>${formatArabicDate(post.createdAt)}</span>
        </div>
      </div>
    </article>
  `;
}

// ==================== 13. دليل الكتّاب وصفحة الكاتب ====================
function renderAuthorsDirectory(filterText = "") {
  const grid = document.getElementById("authors-directory-grid");
  if (!grid) return;

  const q = filterText.trim().toLowerCase();
  let authorsList = getAllActiveAuthors();

  if (q) {
    authorsList = authorsList.filter((a) => {
      const matchWriter = `${a.name} ${a.jobTitle} ${a.bio}`.toLowerCase().includes(q);
      const matchArticles = a.posts.some((p) => `${p.title} ${p.summary}`.toLowerCase().includes(q));
      return matchWriter || matchArticles;
    });
  }

  if (!authorsList.length) {
    grid.innerHTML = `<div class="skeleton-card" style="grid-column:1/-1;">لم يتم العثور على كتّاب مطابقين للبحث.</div>`;
    return;
  }

  grid.innerHTML = authorsList
    .map(
      (a) => `
      <article class="author-dir-card" data-author-id="${escapeHtml(a.id)}">
        <img src="${escapeHtml(a.avatar)}" alt="${escapeHtml(a.name)}" class="author-dir-avatar" loading="lazy">
        <div style="display:flex;align-items:center;justify-content:center;gap:5px;">
          <h3 style="font-size:1.05rem;font-weight:900;">${escapeHtml(a.name)}</h3>
          ${a.verified ? `<span class="verified-badge" translate="no" title="موثق بالشارة الزرقاء">verified</span>` : ""}
        </div>
        <p style="font-size:0.8rem;color:var(--accent);font-weight:800;margin:4px 0 8px;">${escapeHtml(a.jobTitle)}</p>
        <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:12px;">${escapeHtml(a.bio)}</p>
        <span class="badge-pill">${a.postCount} مقال منشور</span>
      </article>
    `
    )
    .join("");

  grid.querySelectorAll("[data-author-id]").forEach((card) => {
    card.addEventListener("click", () => openAuthorProfile(card.getAttribute("data-author-id"), true));
  });
}

function openAuthorProfile(authorIdentifier, pushHistory = true) {
  if (!authorIdentifier) return;
  currentOpenPostId = null;

  const published = state.posts.filter(isPostPublished);
  const key = authorIdentifier.toLowerCase();

  const staffMember = state.staff.find(
    (s) => (s.email && s.email.toLowerCase() === key) || (s.name && s.name.toLowerCase() === key)
  );

  const writerPosts = published.filter(
    (p) =>
      (p.authorEmail && p.authorEmail.toLowerCase() === key) ||
      (p.author && p.author.toLowerCase() === key) ||
      (staffMember && p.author === staffMember.name)
  );

  const name = (staffMember && staffMember.name) || (writerPosts[0] && writerPosts[0].author) || authorIdentifier;
  const avatar =
    (staffMember && staffMember.avatar) ||
    (writerPosts[0] && writerPosts[0].authorAvatar) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=b91c1c&color=fff`;
  const verified = Boolean((staffMember && staffMember.verified) || (writerPosts[0] && writerPosts[0].authorVerified));
  const jobTitle = (staffMember && staffMember.jobTitle) || "كاتب ومحرر صحفي في شبكة البوصلة";
  const bio = (staffMember && staffMember.bio) || "كاتب ومحلل في شبكة البوصلة الإخبارية.";

  const avatarEl = document.getElementById("profile-author-avatar");
  if (avatarEl) avatarEl.src = avatar;
  const nameEl = document.getElementById("profile-author-name");
  if (nameEl) nameEl.textContent = name;
  const jobEl = document.getElementById("profile-author-job");
  if (jobEl) jobEl.textContent = jobTitle;
  const bioEl = document.getElementById("profile-author-bio");
  if (bioEl) bioEl.textContent = bio;
  const countEl = document.getElementById("profile-author-count");
  if (countEl) countEl.textContent = `${writerPosts.length} مادة صحفية منشورة`;

  const verEl = document.getElementById("profile-author-verified");
  if (verEl) verEl.classList.toggle("hidden", !verified);

  renderSocialLinks("profile-author-socials", (staffMember && staffMember.socials) || {});

  const postsGrid = document.getElementById("author-posts-grid");
  if (postsGrid) {
    postsGrid.innerHTML = writerPosts.length
      ? writerPosts.map((p) => buildNewsCardHtml(p)).join("")
      : `<div class="empty-hint">لا توجد مقالات منشورة لهذا الكاتب بعد.</div>`;

    postsGrid.querySelectorAll("[data-open-post]").forEach((c) => {
      c.addEventListener("click", () => openArticle(c.getAttribute("data-open-post"), true));
    });
  }

  const profileUrl = `${SITE_BASE_URL}/?author=${encodeURIComponent(authorIdentifier)}`;
  if (pushHistory) {
    window.history.pushState({ view: "author", id: authorIdentifier }, "", `?author=${encodeURIComponent(authorIdentifier)}`);
  }

  updateSeoMeta({
    title: `مقالات الكاتب ${name}`,
    description: bio,
    image: avatar,
    url: profileUrl
  });

  const shareAuthorBtn = document.getElementById("share-author-profile-btn");
  if (shareAuthorBtn) {
    shareAuthorBtn.onclick = async () => {
      const shareText = `صفحة الكاتب ${name} على شبكة البوصلة:\n${bio}\n${profileUrl}`;
      if (navigator.share) {
        try {
          await navigator.share({ title: name, text: shareText, url: profileUrl });
          return;
        } catch (_) {}
      }
      await navigator.clipboard.writeText(shareText);
      showToast("تم نسخ رابط صفحة الكاتب بنجاح");
    };
  }

  switchView("author", true);
}

// ==================== 14. قارئ المقال الكامل + المشاركة الفائقة ====================
function openArticle(postId, pushHistory = true) {
  const post = state.posts.find((p) => p.id === postId);
  if (!post || !isPostPublished(post)) {
    showToast("المقال غير متاح أو قيد المراجعة التحريرية");
    return;
  }

  currentOpenPostId = postId;

  if (!viewedPostsSession.has(postId)) {
    viewedPostsSession.add(postId);
    updateDoc(doc(db, "posts", postId), { views: increment(1) }).catch(() => {});
  }

  const author = findAuthorInfo(post);
  const compasses = getPostCompasses(post);

  const badgesEl = document.getElementById("art-badges");
  if (badgesEl) {
    badgesEl.innerHTML = compasses
      .map(
        (c) => `
        <button type="button" class="badge-pill" data-badge-compass="${escapeHtml(c)}" style="border:none;cursor:pointer;">
          <span>${escapeHtml(c)}</span>
        </button>`
      )
      .join("");
    badgesEl.querySelectorAll("[data-badge-compass]").forEach((btn) => {
      btn.addEventListener("click", () => selectCompass(btn.getAttribute("data-badge-compass"), "all", true));
    });
  }

  const titleEl = document.getElementById("art-title");
  if (titleEl) titleEl.textContent = post.title || "";

  const sumEl = document.getElementById("art-summary");
  if (sumEl) {
    sumEl.textContent = post.summary || "";
    sumEl.classList.toggle("hidden", !post.summary);
  }

  const authorNameEl = document.getElementById("art-author");
  if (authorNameEl) authorNameEl.textContent = author.name;
  const authorAvatarEl = document.getElementById("art-author-avatar");
  if (authorAvatarEl) authorAvatarEl.src = author.avatar;
  const authorRoleEl = document.getElementById("art-author-role");
  if (authorRoleEl) authorRoleEl.textContent = author.roleTitle;
  const authorVerEl = document.getElementById("art-author-verified");
  if (authorVerEl) authorVerEl.classList.toggle("hidden", !author.verified);
  const dateEl = document.getElementById("art-date");
  if (dateEl) dateEl.textContent = formatArabicDate(post.createdAt);

  const authorBtn = document.getElementById("art-author-btn");
  if (authorBtn) {
    authorBtn.onclick = () => openAuthorProfile(author.email || author.name, true);
  }

  const mediaSlot = document.getElementById("art-media-slot");
  if (mediaSlot) {
    if (post.videoUrl && post.videoUrl.includes("youtube")) {
      const vidId = post.videoUrl.split("v=")[1]?.split("&")[0] || post.videoUrl.split("/").pop();
      mediaSlot.innerHTML = `<div class="video-embed-wrap"><iframe src="https://www.youtube.com/embed/${escapeHtml(
        vidId
      )}" allowfullscreen></iframe></div>`;
    } else if (post.imageUrl) {
      mediaSlot.innerHTML = `<figure class="article-figure"><img src="${escapeHtml(post.imageUrl)}" alt="${escapeHtml(
        post.title
      )}"></figure>`;
    } else {
      mediaSlot.innerHTML = "";
    }
  }

  const bodyEl = document.getElementById("art-body");
  if (bodyEl) {
    bodyEl.innerHTML = enrichArticleContent(post.content || "");
    bodyEl.querySelectorAll(".inline-hashtag-btn").forEach((btn) => {
      btn.addEventListener("click", () => selectHashtag(btn.getAttribute("data-hashtag"), true));
    });
  }

  const tagsEl = document.getElementById("art-tags");
  const rawTags =
    Array.isArray(post.tags) && post.tags.length
      ? post.tags
      : ["شبكة_البوصلة", compasses[0].replace(/\s+/g, "_")];

  if (tagsEl) {
    tagsEl.innerHTML = rawTags
      .map((t) => {
        const clean = String(t).replace(/^#/, "").trim();
        return `<button type="button" class="tag-chip" data-tag-chip="${escapeHtml(clean)}">#${escapeHtml(clean)}</button>`;
      })
      .join("");
    tagsEl.querySelectorAll("[data-tag-chip]").forEach((chip) => {
      chip.addEventListener("click", () => selectHashtag(chip.getAttribute("data-tag-chip"), true));
    });
  }

  const articleUrl = `${SITE_BASE_URL}/?post=${encodeURIComponent(post.id)}`;
  if (pushHistory) {
    window.history.pushState({ view: "article", id: post.id }, "", `?post=${encodeURIComponent(post.id)}`);
  }

  updateSeoMeta({
    title: post.title,
    description: post.summary || post.title,
    image: post.imageUrl || getDefaultCoverImage(),
    url: articleUrl,
    type: "article",
    authorName: author.name
  });

  setupSuperShareButtons(post, rawTags, articleUrl);

  const relatedGrid = document.getElementById("related-grid");
  if (relatedGrid) {
    const related = state.posts
      .filter((p) => isPostPublished(p) && p.id !== post.id && getPostCompasses(p).some((c) => compasses.includes(c)))
      .slice(0, 3);
    relatedGrid.innerHTML = related.map((r) => buildNewsCardHtml(r)).join("");
    relatedGrid.querySelectorAll("[data-open-post]").forEach((c) => {
      c.addEventListener("click", () => openArticle(c.getAttribute("data-open-post"), true));
    });
  }

  switchView("article", true);
}

function setupSuperShareButtons(post, tagsList, articleUrl) {
  const hashtagsStr = tagsList.map((t) => `#${String(t).replace(/^#/, "").replace(/\s+/g, "_")}`).join(" ");
  const summarySnippet = post.summary ? `\n\n${post.summary.slice(0, 160)}...` : "";
  const fullShareText = `*${post.title}*${summarySnippet}\n\n${hashtagsStr}\n\nاقرأ التفاصيل عبر شبكة البوصلة:\n${articleUrl}`;

  const nativeBtn = document.getElementById("share-native-btn");
  if (nativeBtn) {
    nativeBtn.onclick = async () => {
      const shareImgUrl = post.imageUrl || getDefaultCoverImage();
      if (navigator.share) {
        try {
          if (shareImgUrl && navigator.canShare) {
            const response = await fetch(shareImgUrl);
            const blob = await response.blob();
            const imageFile = new File([blob], "bawsala-news.jpg", { type: blob.type || "image/jpeg" });
            if (navigator.canShare({ files: [imageFile] })) {
              await navigator.share({
                title: post.title,
                text: fullShareText,
                url: articleUrl,
                files: [imageFile]
              });
              return;
            }
          }
        } catch (_) {}

        try {
          await navigator.share({ title: post.title, text: fullShareText, url: articleUrl });
          return;
        } catch (_) {}
      }

      await navigator.clipboard.writeText(fullShareText);
      showToast("تم نسخ الخبر مع الملخص والرابط للمشاركة");
    };
  }

  const waBtn = document.getElementById("share-wa");
  if (waBtn) {
    waBtn.onclick = () => {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(fullShareText)}`, "_blank", "noopener");
    };
  }

  const tgBtn = document.getElementById("share-tg");
  if (tgBtn) {
    tgBtn.onclick = () => {
      window.open(
        `https://t.me/share/url?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(
          `${post.title}${summarySnippet}\n\n${hashtagsStr}`
        )}`,
        "_blank",
        "noopener"
      );
    };
  }

  const xBtn = document.getElementById("share-x");
  if (xBtn) {
    xBtn.onclick = () => {
      const tweetText = `${post.title}\n${hashtagsStr}`;
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(articleUrl)}`,
        "_blank",
        "noopener"
      );
    };
  }

  const fbBtn = document.getElementById("share-fb");
  if (fbBtn) {
    fbBtn.onclick = () => {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`, "_blank", "noopener");
    };
  }

  const copyBtn = document.getElementById("share-copy");
  if (copyBtn) {
    copyBtn.onclick = async () => {
      await navigator.clipboard.writeText(fullShareText);
      showToast("تم نسخ الخبر مع الرابط بنجاح");
    };
  }
}

// ==================== 15. الصفحات الثابتة والميثاق ====================
window.openStaticPage = function (pageType, pushHistory = true) {
  currentOpenPostId = null;
  const titleEl = document.getElementById("static-page-title");
  const bodyEl = document.getElementById("static-page-body");
  if (!titleEl || !bodyEl) return;

  if (pageType === "about") {
    titleEl.textContent = "من نحن — شبكة البوصلة والتوجيه الوطني";
    bodyEl.innerHTML = state.settings.aboutHtml || DEFAULT_ABOUT_HTML;
  } else if (pageType === "charter") {
    titleEl.textContent = "ميثاق الشرف الصحفي والدستور التحريري";
    bodyEl.innerHTML = state.settings.charterHtml || DEFAULT_CHARTER_HTML;
  } else {
    titleEl.textContent = "سياسة الخصوصية وحماية البيانات";
    bodyEl.innerHTML = state.settings.privacyHtml || DEFAULT_PRIVACY_HTML;
  }

  if (pushHistory) {
    window.history.pushState({ view: "static", page: pageType }, "", `?page=${encodeURIComponent(pageType)}`);
  }

  updateSeoMeta({
    title: titleEl.textContent,
    description: bodyEl.textContent.slice(0, 160),
    url: `${SITE_BASE_URL}/?page=${encodeURIComponent(pageType)}`
  });

  switchView("static", true);
};

// ==================== 16. التنقل بين الواجهات ودعم الروابط ====================
function switchView(viewName, scrollToTop = false) {
  currentViewName = viewName;

  const views = {
    home: document.getElementById("view-home"),
    compasses: document.getElementById("view-compasses"),
    authors: document.getElementById("view-authors"),
    article: document.getElementById("view-article"),
    author: document.getElementById("view-author"),
    static: document.getElementById("view-static")
  };

  Object.entries(views).forEach(([key, el]) => {
    if (el) el.classList.toggle("hidden", key !== viewName);
  });

  if (viewName === "compasses") renderCompassesHub();
  if (viewName === "authors") renderAuthorsDirectory();

  renderTopCategoriesBar();

  if (scrollToTop) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function closeSidebar() {
  document.getElementById("sidebar-drawer")?.classList.remove("open");
  document.getElementById("sidebar-backdrop")?.classList.add("hidden");
}

function resolveRouteFromUrl(pushHistory = false) {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("post");
  const compassId = params.get("compass");
  const tag = params.get("tag");
  const authorId = params.get("author");
  const page = params.get("page");

  if (postId && state.posts.length) {
    openArticle(postId, pushHistory);
  } else if (authorId && (state.staff.length || state.posts.length)) {
    openAuthorProfile(authorId, pushHistory);
  } else if (compassId) {
    selectCompass(compassId, "all", pushHistory);
  } else if (tag) {
    selectHashtag(tag, pushHistory);
  } else if (page) {
    window.openStaticPage(page, pushHistory);
  } else {
    selectCompass("all", "all", false);
  }
}

// ==================== 17. ربط الأحداث والمزامنة المستقرة ====================
function bindUiEvents() {
  document.getElementById("open-sidebar-btn")?.addEventListener("click", () => {
    document.getElementById("sidebar-drawer")?.classList.add("open");
    document.getElementById("sidebar-backdrop")?.classList.remove("hidden");
  });
  document.getElementById("close-sidebar-btn")?.addEventListener("click", closeSidebar);
  document.getElementById("sidebar-backdrop")?.addEventListener("click", closeSidebar);

  document.getElementById("side-nav-authors-btn")?.addEventListener("click", () => {
    closeSidebar();
    currentOpenPostId = null;
    switchView("authors", true);
  });
  document.getElementById("side-nav-compasses-btn")?.addEventListener("click", () => {
    closeSidebar();
    currentOpenPostId = null;
    switchView("compasses", true);
  });

  document.querySelectorAll("[data-nav-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-nav-target");
      currentOpenPostId = null;
      if (target === "home") selectCompass("all", "all", true);
      else switchView(target, true);
    });
  });

  const searchDrawer = document.getElementById("search-drawer");
  const searchInput = document.getElementById("global-search-input");

  document.getElementById("search-toggle-btn")?.addEventListener("click", () => {
    searchDrawer?.classList.toggle("hidden");
    if (!searchDrawer?.classList.contains("hidden")) searchInput?.focus();
  });

  document.getElementById("close-search-btn")?.addEventListener("click", () => {
    searchDrawer?.classList.add("hidden");
    if (searchInput) searchInput.value = "";
    state.searchQuery = "";
    renderHomeFeed();
  });

  searchInput?.addEventListener("input", (e) => {
    state.searchQuery = e.target.value.trim();
    currentOpenPostId = null;
    switchView("home", false);
    renderHomeFeed();
  });

  document.getElementById("authors-smart-search")?.addEventListener("input", (e) => {
    renderAuthorsDirectory(e.target.value);
  });

  document.getElementById("open-all-authors-btn")?.addEventListener("click", () => {
    currentOpenPostId = null;
    switchView("authors", true);
  });

  document.getElementById("open-compasses-shortcut")?.addEventListener("click", () => {
    currentOpenPostId = null;
    switchView("compasses", true);
  });

  document.getElementById("clear-compass-filter-btn")?.addEventListener("click", () => {
    selectCompass("all", "all", true);
  });

  document.getElementById("back-to-home-btn")?.addEventListener("click", () => {
    currentOpenPostId = null;
    window.history.pushState({ view: "home" }, "", "./");
    switchView("home", true);
  });

  document.getElementById("author-back-btn")?.addEventListener("click", () => {
    currentOpenPostId = null;
    window.history.pushState({ view: "home" }, "", "./");
    switchView("home", true);
  });

  document.getElementById("static-back-btn")?.addEventListener("click", () => {
    currentOpenPostId = null;
    window.history.pushState({ view: "home" }, "", "./");
    switchView("home", true);
  });

  document.getElementById("breaking-prev-btn")?.addEventListener("click", () => {
    state.breakingIndex = Math.max(0, state.breakingIndex - 1);
    renderBreakingAndQuickNews();
  });

  document.getElementById("breaking-next-btn")?.addEventListener("click", () => {
    state.breakingIndex += 1;
    renderBreakingAndQuickNews();
  });

  window.addEventListener("popstate", () => {
    resolveRouteFromUrl(false);
  });
}

function startRealtimeListeners() {
  onSnapshot(
    doc(db, "settings", "general"),
    (snap) => {
      if (snap.exists()) {
        state.settings = { ...state.settings, ...snap.data() };
        applySiteSettings();
      }
    },
    (err) => console.warn("Settings sync warning:", err)
  );

  onSnapshot(
    collection(db, "categories"),
    (snap) => {
      if (!snap.empty) {
        const dbCats = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const merged = [...DEFAULT_COMPASSES];
        dbCats.forEach((cat) => {
          const idx = merged.findIndex((m) => m.id === cat.id || m.name === cat.name);
          if (idx >= 0) merged[idx] = { ...merged[idx], ...cat };
          else merged.push(cat);
        });
        state.compasses = merged;
      }
      renderTopCategoriesBar();
      renderSidebarMenu();
      renderCompassesHub();
    },
    (err) => console.warn("Categories sync warning:", err)
  );

  onSnapshot(
    collection(db, "staff"),
    (snap) => {
      state.staff = snap.docs.map((d) => ({ id: d.id, email: d.id, ...d.data() }));
      renderHomeFeed();
    },
    (err) => console.warn("Staff sync warning:", err)
  );

  onSnapshot(
    collection(db, "posts"),
    (snap) => {
      state.posts = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => getPostTimestampMs(b) - getPostTimestampMs(a));

      renderBreakingAndQuickNews();
      renderHomeFeed();

      if (!initialRouteHandled) {
        initialRouteHandled = true;
        resolveRouteFromUrl(false);
      }
    },
    (err) => console.warn("Posts sync warning:", err)
  );

  onSnapshot(
    collection(db, "ads"),
    (snap) => {
      state.ads = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      renderAdsSlot();
    },
    (err) => console.warn("Ads sync warning:", err)
  );
}

// ==================== 18. نقطة التشغيل ====================
document.addEventListener("DOMContentLoaded", () => {
  applySiteSettings();
  renderTopCategoriesBar();
  renderSidebarMenu();
  bindUiEvents();
  startRealtimeListeners();
});
