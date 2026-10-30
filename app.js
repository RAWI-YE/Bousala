/* ==========================================================================
   حُجرية بريس (Hujariya Press) — hujariyapress.rawi-ye.com
   المحرك البرمجي التفاعلي للموقع العام (app.js) — الجزء الأول (الأكبر):
   إدارة الهوية البصرية والشعار المفرغ، أيقونة تطبيق الويب (PWA)، الصورة الافتراضية،
   الأقسام والبوصلات، العاجل الموقوت، النبض السريع، وشبكة الأخبار
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

// ==================== 1. إعدادات الاتصال بقاعدة بيانات Firebase ====================
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAd4Df_Fpp2GlGkRPyvmKuFW68LbL_a4yU",
  authDomain: "rawi-01.firebaseapp.com",
  databaseURL: "https://rawi-01-default-rtdb.firebaseio.com",
  projectId: "rawi-01",
  storageBucket: "rawi-01.firebasestorage.app",
  messagingSenderId: "91203142966",
  appId: "1:91203142966:web:a44f7c06c98529a57a9f97",
  measurementId: "G-2VNWNSZLBJ"
};

const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);

const SITE_CANONICAL_URL = "https://hujariyapress.rawi-ye.com";
const VIEWED_POSTS_STORAGE_KEY = "hujariya_viewed_posts_v1";

// ==================== 2. الأقسام الأساسية والنصوص المؤسسية لـ «حُجرية بريس» ====================
const DEFAULT_COMPASSES = [
  {
    id: "yemen-politics",
    name: "بوصلة السياسة اليمنية",
    slug: "yemen-politics",
    icon: "shield",
    flagUrl: "https://flagcdn.com/w80/ye.png",
    color: "#ef3327",
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

const DEFAULT_ABOUT_HTML = `<p><strong>منصة إخبارية وتحليلية شاملة، تنبض بروح الوطن، وتؤمن بأن الكلمة أمانة والموقف مبدأ.</strong></p>
<p>تندرج <strong>حُجرية بريس (Hujariya Press)</strong> تحت مظلة <strong>مؤسسة RAWI-YE.COM الإعلامية الرقمية</strong>، وهي مؤسسة إعلامية مهنية رائدة تضم عدة منصات نوعية متكاملة في رؤيتها ومستقلة في خطوطها التحريرية. ننطلق من رسالة إعلامية راسخة لتكون منصتنا مساحة رحبة وموضوعية لكل الأقلام الحرة والمبدعة في مختلف المجالات؛ السياسية، الثقافية، الفنية، التقنية، والتحليلات المعمقة، التزاماً منا بإثراء وعي القارئ العربي ومواكبة الحقيقة بمهنية ومصداقية عالية.</p>
<h3>التوجيه التحريري والثوابت الوطنية: التزام لا حياد فيه تجاه الاستقرار</h3>
<p>تتبنى <strong>حُجرية بريس</strong> معايير الصحافة الرصينة في التحقق من الحقائق وتقديم محتوى تحليلي موضوعي بعيداً عن التهويل. وفي الوقت الذي نؤمن فيه بالانفتاح المهني وتعددية الطرح في الشؤون العامة، فإننا نؤكد أن <strong>الخط الوطني والسيادي للمنصة هو خط ثابت لا يقبل المساومة</strong>:</p>
<blockquote>
<p>• <strong>الانحياز للدولة والاستقرار:</strong> تؤمن المؤسسة بضرورة دعم مؤسسات الدولة الشرعية، وتعزيز مسار الأمن والاستقرار، ورفض كافة المشاريع الكيانية المتمردة أو الميليشيات التي تسعى لتقويض النسيج الاجتماعي وتخدم الأجندات التخريبية.</p>
<p>• <strong>الأمن القومي المشترك:</strong> ننطلق من قناعة راسخة بأن أمن الجمهورية اليمنية وأمن المملكة العربية السعودية يمثلان عمقاً استراتيجياً وأمناً قومياً مشتركاً لا يتجزأ. وبناءً عليه، فإننا ندعم كل المساعي والتحالفات التي تصب في مصلحة استقرار المنطقة وسلامتها.</p>
</blockquote>`;

const DEFAULT_CHARTER_HTML = `<p>يمثل هذا الميثاق الدستور المهني والأخلاقي والوطني لكافة المحررين والكتّاب في <strong>حُجرية بريس (Hujariya Press — RAWI-YE.COM)</strong>:</p>
<h3>أولاً: الثوابت الوطنية والسياسية</h3>
<p>1. الالتزام التام بدعم الدولة والشرعية والاصطفاف مع المصلحة الوطنية العليا، وعدم الترويج لأي خطاب يخدم الميليشيات أو المشاريع التخريبية المعادية.</p>
<p>2. احترام عمق الأمن القومي المشترك بين اليمن والمملكة العربية السعودية باعتباره ركيزة استقرار المنطقة.</p>
<h3>ثانياً: المعايير المهنية والتحريرية</h3>
<p>1. تحري الدقة والمصداقية والاعتماد على المصادر الموثوقة قبل نشر أي خبر أو تحليل.</p>
<p>2. الكتابة باللغة العربية الفصحى الرصينة، والابتعاد عن الألفاظ النابية أو التجريح الشخصي.</p>`;

const DEFAULT_PRIVACY_HTML = `<p>تحترم <strong>حُجرية بريس</strong> خصوصية كافة زوارها وقرّائها، وتلتزم بحماية البيانات وفق أعلى المعايير التقنية:</p>
<p>• لا نقوم بجمع أي بيانات شخصية عن الزوار أثناء تصفح الأخبار والمقالات.</p>
<p>• تُستخدم الإحصائيات العامة لقياس جودة المحتوى وتطوير تجربة القارئ دون المساس بخصوصيته.</p>`;

// ==================== 3. الحالة العامة للموقع العام (State) ====================
const state = {
  settings: {
    siteName: "حُجرية بريس",
    networkName: "RAWI-YE.COM",
    siteDescription: "حُجرية بريس — منصة إخبارية وتحليلية شاملة تندرج تحت مظلة مؤسسة RAWI-YE.COM الإعلامية الرقمية",
    logoUrl: "",
    hideSiteName: false,
    faviconUrl: "",
    coverImageUrl: "",
    defaultPostImageUrl: "",
    accentColor: "#ef3327",
    aboutHtml: DEFAULT_ABOUT_HTML,
    charterHtml: DEFAULT_CHARTER_HTML,
    privacyHtml: DEFAULT_PRIVACY_HTML,
    socials: {}
  },
  compasses: [...DEFAULT_COMPASSES],
  posts: [],
  staff: [],
  ads: [],
  activeView: "home", // home | article | author | static
  activeCompass: "all",
  activeSubcategory: "all",
  activeTag: "",
  searchQuery: "",
  visiblePostsLimit: 12,
  currentArticleId: null,
  currentAuthorKey: null
};

// ==================== 4. الدوال المساعدة، التواريخ، والصور الافتراضية ====================
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripHtmlToPlain(html = "") {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").trim();
}

function showPubToast(msg) {
  const toast = document.getElementById("pub-toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove("hidden");
  clearTimeout(window.__pubToastTimer);
  window.__pubToastTimer = setTimeout(() => toast.classList.add("hidden"), 3200);
}

function getPostTimestampMs(item) {
  if (!item) return 0;
  const t = item.createdAt || item.updatedAt;
  if (!t) return 0;
  if (typeof t.toMillis === "function") return t.toMillis();
  if (typeof t.seconds === "number") return t.seconds * 1000;
  const parsed = new Date(t).getTime();
  return isNaN(parsed) ? 0 : parsed;
}

function formatArabicDate(timestamp) {
  const ms = typeof timestamp === "number" ? timestamp : getPostTimestampMs({ createdAt: timestamp });
  if (!ms) return "حديثاً";
  const d = new Date(ms);
  return d.toLocaleDateString("ar-YE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatRelativeTime(timestamp) {
  const ms = typeof timestamp === "number" ? timestamp : getPostTimestampMs({ createdAt: timestamp });
  if (!ms) return "الآن";
  const diffMinutes = Math.max(1, Math.floor((Date.now() - ms) / 60000));
  if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `منذ ${diffDays} يوم`;
  return formatArabicDate(ms);
}

function updateLiveHeaderDate() {
  const el = document.getElementById("live-arabic-date");
  if (!el) return;
  try {
    const now = new Date();
    el.textContent = now.toLocaleDateString("ar-SA-u-ca-islamic", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }) + " | " + now.toLocaleDateString("ar-YE", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  } catch (_) {
    el.textContent = new Date().toLocaleDateString("ar-YE");
  }
}

// جلب الصورة البارزة للمنشور أو الرجوع للصورة الافتراضية المحددة في الإعدادات
function getPostEffectiveImageUrl(post) {
  if (post && post.imageUrl && String(post.imageUrl).trim() !== "") {
    return String(post.imageUrl).trim();
  }
  const s = state.settings;
  if (s.defaultPostImageUrl && s.defaultPostImageUrl.trim() !== "") {
    return s.defaultPostImageUrl.trim();
  }
  if (s.coverImageUrl && s.coverImageUrl.trim() !== "") {
    return s.coverImageUrl.trim();
  }
  return "";
}

// بناء صورة البطاقة (إما صورة المقال / الصورة الافتراضية من الإعدادات، أو بطاقة هوية حُجرية بريس الحمراء)
function buildPostThumbnailHtml(post, altText = "") {
  const imgUrl = getPostEffectiveImageUrl(post);
  const s = state.settings;
  const fallbackLogo = s.logoUrl || s.faviconUrl || "";
  const siteName = s.siteName || "حُجرية بريس";

  if (imgUrl) {
    return `<img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(altText || post?.title || siteName)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'brand-fallback-thumb\\'><span class=\\'brand-fallback-monogram\\'>ح</span><strong class=\\'brand-fallback-name\\'>${escapeHtml(siteName)}</strong></div>'">`;
  }

  return `
    <div class="brand-fallback-thumb">
      ${
        fallbackLogo
          ? `<img src="${escapeHtml(fallbackLogo)}" alt="${escapeHtml(siteName)}">`
          : `<span class="brand-fallback-monogram">ح</span>`
      }
      <strong class="brand-fallback-name">${escapeHtml(siteName)}</strong>
    </div>
  `;
}

// جلب بيانات الكاتب المحدثة من سجل الكادر (صورة الكاتب وشارة التوثيق)
function resolvePostAuthorInfo(post) {
  const rawName = post?.author || "هيئة التحرير";
  const rawEmail = String(post?.authorEmail || post?.authorUsername || "").toLowerCase();
  const rawId = String(post?.authorId || "").toLowerCase();

  const matchedStaff = state.staff.find((s) => {
    if (rawId && String(s.id || "").toLowerCase() === rawId) return true;
    if (rawEmail && (String(s.email || "").toLowerCase() === rawEmail || String(s.username || "").toLowerCase() === rawEmail)) return true;
    if (s.name && s.name.trim() === rawName.trim()) return true;
    return false;
  });

  const name = matchedStaff?.name || rawName;
  const avatar =
    matchedStaff?.avatar ||
    post?.authorAvatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ef3327&color=fff`;
  const verified = matchedStaff ? Boolean(matchedStaff.verified || matchedStaff.role === "admin") : Boolean(post?.authorVerified);
  const authorKey = matchedStaff?.id || rawEmail || name;

  return { name, avatar, verified, authorKey, staffMember: matchedStaff };
}

function getPostCompasses(post) {
  const list = [];
  if (Array.isArray(post?.categories)) list.push(...post.categories);
  if (post?.category && !list.includes(post.category)) list.push(post.category);
  return list.length ? list : ["بوصلة السياسة اليمنية"];
}

function isBreakingStillActive(post) {
  if (!post || !post.isBreaking) return false;
  const now = Date.now();
  if (post.breakingExpiresAt) {
    const exp =
      typeof post.breakingExpiresAt === "number"
        ? post.breakingExpiresAt
        : new Date(post.breakingExpiresAt).getTime();
    if (exp && !isNaN(exp) && now > exp) return false;
  } else if (post.breakingDurationHours) {
    const createdMs = getPostTimestampMs(post);
    const durationMs = Number(post.breakingDurationHours) * 3600 * 1000;
    if (createdMs && durationMs > 0 && now > createdMs + durationMs) return false;
  }
  return true;
}

// ==================== 5. تطبيق الهوية البصرية، الشعار المفرغ، وأيقونة تطبيق الويب (PWA) ====================
function applyDynamicSiteIdentity() {
  const s = state.settings;
  const siteName = (s.siteName && s.siteName !== "شبكة البوصلة") ? s.siteName : "حُجرية بريس";
  const siteDesc = s.siteDescription || "حُجرية بريس — منصة إخبارية وتحليلية شاملة تندرج تحت مظلة مؤسسة RAWI-YE.COM الإعلامية الرقمية.";
  const brandColor = s.accentColor || "#ef3327";

  document.documentElement.style.setProperty("--brand-red", brandColor);

  const themeMeta = document.getElementById("page-theme-color");
  if (themeMeta) themeMeta.setAttribute("content", brandColor);

  // تحديث النصوص في الترويسة والتذييل
  const nameHeading = document.getElementById("site-name-heading");
  if (nameHeading) nameHeading.textContent = siteName;

  const footerName = document.getElementById("footer-site-name");
  if (footerName) footerName.textContent = `${siteName} | Hujariya Press`;

  const copyName = document.getElementById("copyright-site-name");
  if (copyName) copyName.textContent = siteName;

  const footerDesc = document.getElementById("footer-site-desc");
  if (footerDesc) footerDesc.textContent = siteDesc;

  // التحكم الذكي بالشعار الأبيض المفرغ وإخفاء/إظهار الاسم النصي
  const logoImg = document.getElementById("site-logo-img");
  const textBrand = document.getElementById("site-text-brand");
  const footerLogo = document.getElementById("footer-logo-img");
  const hasLogo = Boolean(s.logoUrl && s.logoUrl.trim() !== "");

  if (logoImg) {
    if (hasLogo) {
      logoImg.src = s.logoUrl.trim();
      logoImg.classList.remove("hidden");
    } else {
      logoImg.classList.add("hidden");
    }
  }

  if (footerLogo) {
    if (hasLogo) {
      footerLogo.src = s.logoUrl.trim();
      footerLogo.classList.remove("hidden");
    } else {
      footerLogo.classList.add("hidden");
    }
  }

  // إذا اختار الأدمن إخفاء الاسم النصي عند وجود الشعار، يختفي النص فوراً ويبقى الشعار وحده
  if (textBrand) {
    const shouldHideText = hasLogo && Boolean(s.hideSiteName);
    textBrand.classList.toggle("hidden", shouldHideText);
  }

  // تحديث أيقونة المتصفح وأيقونة التثبيت على الشاشة الرئيسية (Web App Manifest)
  const appIcon = (s.faviconUrl || s.appIconUrl || s.logoUrl || "").trim();
  if (appIcon) {
    const favEl = document.getElementById("dynamic-favicon");
    if (favEl) favEl.href = appIcon;

    const appleEl = document.getElementById("dynamic-apple-icon");
    if (appleEl) appleEl.href = appIcon;

    updateDynamicWebAppManifest(siteName, siteDesc, appIcon, brandColor);
  }

  // تحديث صورة المشاركة الافتراضية لواتساب ومنصات التواصل (OG Image)
  const shareImage = (s.coverImageUrl || s.defaultPostImageUrl || s.logoUrl || "").trim();
  if (state.activeView === "home") {
    updateMetaAndOgTags(
      `${siteName} | Hujariya Press`,
      siteDesc,
      shareImage,
      SITE_CANONICAL_URL
    );
  }

  renderSocialLinks();
}

function updateMetaAndOgTags(title, description, imageUrl, url) {
  document.title = title;
  const setAttr = (id, attr, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.setAttribute(attr, val);
  };
  setAttr("page-meta-desc", "content", description);
  setAttr("og-meta-title", "content", title);
  setAttr("og-meta-desc", "content", description);
  if (imageUrl) setAttr("og-meta-image", "content", imageUrl);
  if (url) setAttr("og-meta-url", "content", url);
}

// توليد ملف تطبيق الويب (Manifest) ديناميكياً ليظهر الشعار عند "الإضافة إلى الشاشة الرئيسية"
function updateDynamicWebAppManifest(name, description, iconUrl, themeColor) {
  try {
    const manifestObj = {
      name: `${name} | Hujariya Press`,
      short_name: name,
      description,
      start_url: SITE_CANONICAL_URL,
      display: "standalone",
      background_color: "#f6f5f2",
      theme_color: themeColor || "#ef3327",
      dir: "rtl",
      lang: "ar",
      icons: [
        { src: iconUrl, sizes: "192x192", type: "image/png" },
        { src: iconUrl, sizes: "512x512", type: "image/png" }
      ]
    };
    const blob = new Blob([JSON.stringify(manifestObj)], { type: "application/json" });
    const manifestUrl = URL.createObjectURL(blob);
    let linkEl = document.querySelector('link[rel="manifest"]');
    if (!linkEl) {
      linkEl = document.createElement("link");
      linkEl.rel = "manifest";
      document.head.appendChild(linkEl);
    }
    linkEl.href = manifestUrl;
  } catch (_) {}
}

function renderSocialLinks() {
  const soc = state.settings.socials || {};
  const items = [
    { key: "whatsapp", label: "واتساب", url: soc.whatsapp },
    { key: "telegram", label: "تليجرام", url: soc.telegram },
    { key: "x", label: "X", url: soc.x || soc.twitter },
    { key: "facebook", label: "فيسبوك", url: soc.facebook },
    { key: "youtube", label: "يوتيوب", url: soc.youtube }
  ].filter((item) => item.url && String(item.url).trim() !== "");

  const html = items
    .map(
      (item) =>
        `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.label)}</a>`
    )
    .join("");

  const headerSoc = document.getElementById("header-social-links");
  if (headerSoc) headerSoc.innerHTML = html;

  const footerSoc = document.getElementById("footer-social-links");
  if (footerSoc) footerSoc.innerHTML = html;
}

// ==================== 6. شريط الأقسام والبوصلات والفئات الفرعية ====================
function getVisibleCompasses() {
  return [...state.compasses]
    .filter((c) => c.visible !== false)
    .sort((a, b) => (a.order || 99) - (b.order || 99));
}

function renderCompassesNavigation() {
  const navEl = document.getElementById("public-compasses-nav");
  const footerLinks = document.getElementById("footer-compasses-links");
  const compasses = getVisibleCompasses();

  if (navEl) {
    const pillsHtml = [
      `<button type="button" class="compass-nav-pill ${state.activeCompass === "all" ? "active" : ""}" data-compass-filter="all">
        <span class="material-symbols-rounded" translate="no">home</span>
        <span>الرئيسية</span>
      </button>`,
      ...compasses.map((c) => {
        const isActive = state.activeCompass === c.name || state.activeCompass === c.id;
        const flagHtml = c.flagUrl
          ? `<img src="${escapeHtml(c.flagUrl)}" alt="" class="compass-flag-tiny">`
          : `<span class="material-symbols-rounded" translate="no">${escapeHtml(c.icon || "explore")}</span>`;
        return `
          <button type="button" class="compass-nav-pill ${isActive ? "active" : ""}" data-compass-filter="${escapeHtml(c.name)}">
            ${flagHtml}
            <span>${escapeHtml(c.name)}</span>
          </button>
        `;
      })
    ].join("");

    navEl.innerHTML = pillsHtml;

    navEl.querySelectorAll("[data-compass-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const selected = btn.getAttribute("data-compass-filter") || "all";
        selectCompassCategory(selected);
      });
    });
  }

  if (footerLinks) {
    footerLinks.innerHTML = compasses
      .map(
        (c) =>
          `<button type="button" class="footer-nav-link" data-footer-compass="${escapeHtml(c.name)}">${escapeHtml(
            c.name
          )}</button>`
      )
      .join("");

    footerLinks.querySelectorAll("[data-footer-compass]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const selected = btn.getAttribute("data-footer-compass") || "all";
        selectCompassCategory(selected);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  renderSubcategoriesBar();
}

function renderSubcategoriesBar() {
  const wrap = document.getElementById("subcategories-bar-wrap");
  const listEl = document.getElementById("public-subcategories-list");
  if (!wrap || !listEl) return;

  if (state.activeCompass === "all") {
    wrap.classList.add("hidden");
    return;
  }

  const comp = state.compasses.find(
    (c) => c.name === state.activeCompass || c.id === state.activeCompass
  );
  const subs = Array.isArray(comp?.subcategories) ? comp.subcategories.filter(Boolean) : [];

  if (!subs.length) {
    wrap.classList.add("hidden");
    return;
  }

  wrap.classList.remove("hidden");
  listEl.innerHTML = [
    `<button type="button" class="subcat-pill ${state.activeSubcategory === "all" ? "active" : ""}" data-subcat-item="all">كل مواضيع ${escapeHtml(
      comp.name
    )}</button>`,
    ...subs.map(
      (sub) =>
        `<button type="button" class="subcat-pill ${
          state.activeSubcategory === sub ? "active" : ""
        }" data-subcat-item="${escapeHtml(sub)}">${escapeHtml(sub)}</button>`
    )
  ].join("");

  listEl.querySelectorAll("[data-subcat-item]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.activeSubcategory = btn.getAttribute("data-subcat-item") || "all";
      renderSubcategoriesBar();
      renderAllHomeSections();
    });
  });
}

function selectCompassCategory(compassName) {
  state.activeCompass = compassName;
  state.activeSubcategory = "all";
  state.activeTag = "";
  state.visiblePostsLimit = 12;
  switchPublicView("home");
  renderCompassesNavigation();
  renderAllHomeSections();
}

// ==================== 7. شريط الأخبار العاجلة الموقوت والمساحات الإعلانية ====================
function getPublishedPosts() {
  return state.posts.filter((p) => !p.status || p.status === "published");
}

function renderBreakingNewsBar() {
  const bar = document.getElementById("breaking-news-bar");
  const track = document.getElementById("breaking-ticker-items");
  if (!bar || !track) return;

  const breakingPosts = getPublishedPosts().filter((p) => isBreakingStillActive(p));

  if (!breakingPosts.length) {
    bar.classList.add("hidden");
    return;
  }

  bar.classList.remove("hidden");
  track.innerHTML = breakingPosts
    .map(
      (p) => `
      <button type="button" class="breaking-ticker-item" data-open-post="${escapeHtml(p.id)}">
        <span>${escapeHtml(p.title)}</span>
        <span style="opacity:0.65;font-size:0.74rem;">(${formatRelativeTime(p.createdAt)})</span>
      </button>
    `
    )
    .join(`<span style="opacity:0.4;">•</span>`);

  track.querySelectorAll("[data-open-post]").forEach((btn) => {
    btn.addEventListener("click", () => openArticleReader(btn.getAttribute("data-open-post")));
  });
}

function renderPublicAds() {
  const topSlot = document.getElementById("ad-slot-top");
  const midSlot = document.getElementById("ad-slot-middle");
  const activeAds = state.ads.filter((a) => a.active !== false);

  if (!activeAds.length) {
    topSlot?.classList.add("hidden");
    midSlot?.classList.add("hidden");
    return;
  }

  const buildAdHtml = (ad) => `
    <a href="${escapeHtml(ad.targetUrl || "#")}" target="_blank" rel="noopener noreferrer" class="ad-banner-card" data-ad-click="${escapeHtml(ad.id)}">
      <div>
        <span class="cat-badge" style="margin-bottom:6px;">مادة إعلانية — ${escapeHtml(ad.sponsorName || "شركاء حُجرية بريس")}</span>
        <strong style="display:block;font-size:1.02rem;">${escapeHtml(ad.title)}</strong>
      </div>
      ${ad.imageUrl ? `<img src="${escapeHtml(ad.imageUrl)}" alt="${escapeHtml(ad.title)}" loading="lazy">` : ""}
    </a>
  `;

  if (topSlot && activeAds[0]) {
    topSlot.innerHTML = buildAdHtml(activeAds[0]);
    topSlot.classList.remove("hidden");
  }

  if (midSlot && activeAds[1]) {
    midSlot.innerHTML = buildAdHtml(activeAds[1]);
    midSlot.classList.remove("hidden");
  } else if (midSlot) {
    midSlot.classList.add("hidden");
  }

  document.querySelectorAll("[data-ad-click]").forEach((link) => {
    link.addEventListener("click", () => {
      const adId = link.getAttribute("data-ad-click");
      if (adId) {
        updateDoc(doc(db, "ads", adId), { clicks: increment(1) }).catch(() => {});
      }
    });
  });
}

// ==================== 8. التغطية البارزة (Hero)، النبض السريع، وشريط الكُتّاب ====================
function renderHeroAndPulseSection() {
  const heroSection = document.getElementById("hero-and-pulse-section");
  const heroBox = document.getElementById("hero-featured-box");
  const pulseFeed = document.getElementById("quick-pulse-feed");
  if (!heroSection || !heroBox || !pulseFeed) return;

  // إخفاء قسم الهيرو عند البحث أو فلترة وسم محدد للتركيز على النتائج
  const hasSpecialFilter = Boolean(state.searchQuery || state.activeTag || state.activeSubcategory !== "all");
  if (hasSpecialFilter) {
    heroSection.classList.add("hidden");
    return;
  }

  heroSection.classList.remove("hidden");
  const published = getPublishedPosts();
  const scoped =
    state.activeCompass === "all"
      ? published
      : published.filter((p) => getPostCompasses(p).includes(state.activeCompass));

  const heroPost = scoped.find((p) => p.isFeatured) || scoped[0];

  if (!heroPost) {
    heroBox.innerHTML = `<div class="empty-box" style="padding:40px;text-align:center;">لا توجد تغطيات منشورة في هذا القسم حالياً.</div>`;
  } else {
    const authorInfo = resolvePostAuthorInfo(heroPost);
    const compasses = getPostCompasses(heroPost);
    const summaryText = heroPost.summary || stripHtmlToPlain(heroPost.content).slice(0, 190) + "...";

    heroBox.innerHTML = `
      <article class="hero-card" data-open-post="${escapeHtml(heroPost.id)}">
        <div class="hero-card-media">
          ${buildPostThumbnailHtml(heroPost, heroPost.title)}
        </div>
        <div class="hero-card-body">
          <div>
            <div class="hero-badges-row">
              <span class="cat-badge">${escapeHtml(compasses[0])}</span>
              ${
                isBreakingStillActive(heroPost)
                  ? `<span class="cat-badge" style="background:#991b1b;">عاجل</span>`
                  : ""
              }
            </div>
            <h2 class="hero-title">${escapeHtml(heroPost.title)}</h2>
            <p class="hero-summary">${escapeHtml(summaryText)}</p>
          </div>

          <div class="card-meta-footer">
            <div class="card-author-pill" data-open-author="${escapeHtml(authorInfo.authorKey)}">
              <img src="${escapeHtml(authorInfo.avatar)}" alt="${escapeHtml(authorInfo.name)}">
              <span>${escapeHtml(authorInfo.name)}</span>
              ${
                authorInfo.verified
                  ? `<span class="material-symbols-rounded verified-badge" translate="no">verified</span>`
                  : ""
              }
            </div>
            <span>${formatRelativeTime(heroPost.createdAt)}</span>
          </div>
        </div>
      </article>
    `;

    heroBox.querySelector("[data-open-post]")?.addEventListener("click", (e) => {
      const authorTrigger = e.target.closest("[data-open-author]");
      if (authorTrigger) {
        e.stopPropagation();
        openAuthorProfile(authorTrigger.getAttribute("data-open-author"));
        return;
      }
      openArticleReader(heroPost.id);
    });
  }

  // عمود نبض الأخبار السريعة
  const pulsePosts = published
    .filter((p) => p.isQuickNews || isBreakingStillActive(p))
    .slice(0, 10);
  const pulseList = pulsePosts.length ? pulsePosts : published.slice(0, 8);

  if (!pulseList.length) {
    pulseFeed.innerHTML = `<div class="empty-box" style="padding:20px;text-align:center;">لا توجد أخبار سريعة حالياً.</div>`;
  } else {
    pulseFeed.innerHTML = pulseList
      .map(
        (p) => `
        <div class="pulse-item" data-open-post="${escapeHtml(p.id)}">
          <span class="pulse-item-time">${formatRelativeTime(p.createdAt)} • ${escapeHtml(
          getPostCompasses(p)[0]
        )}</span>
          <h3 class="pulse-item-title">${escapeHtml(p.title)}</h3>
        </div>
      `
      )
      .join("");

    pulseFeed.querySelectorAll("[data-open-post]").forEach((item) => {
      item.addEventListener("click", () => openArticleReader(item.getAttribute("data-open-post")));
    });
  }
}

function renderWritersStrip() {
  const section = document.getElementById("writers-strip-section");
  const listEl = document.getElementById("writers-horizontal-list");
  if (!section || !listEl) return;

  const activeWriters = state.staff.filter((s) => !s.suspended && s.name);

  if (!activeWriters.length || state.activeCompass !== "all" || state.searchQuery || state.activeTag) {
    section.classList.add("hidden");
    return;
  }

  section.classList.remove("hidden");
  listEl.innerHTML = activeWriters
    .map((w) => {
      const avatar =
        w.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(w.name)}&background=ef3327&color=fff`;
      const isVer = Boolean(w.verified || w.role === "admin" || w.isMasterAdmin);
      return `
        <button type="button" class="writer-pill-card btn-interactive" data-open-author="${escapeHtml(w.id)}">
          <img src="${escapeHtml(avatar)}" alt="${escapeHtml(w.name)}" class="writer-pill-avatar" loading="lazy">
          <div>
            <div class="writer-pill-name">
              <span>${escapeHtml(w.name)}</span>
              ${
                isVer
                  ? `<span class="material-symbols-rounded verified-badge" translate="no">verified</span>`
                  : ""
              }
            </div>
            <span class="writer-pill-job">${escapeHtml(w.jobTitle || "كاتب وصحفي")}</span>
          </div>
        </button>
      `;
    })
    .join("");

  listEl.querySelectorAll("[data-open-author]").forEach((btn) => {
    btn.addEventListener("click", () => openAuthorProfile(btn.getAttribute("data-open-author")));
  });
}

// ==================== 9. شبكة الأخبار والتقارير الرئيسية والفلترة التفاعلية ====================
function buildNewsCardHtml(post) {
  const authorInfo = resolvePostAuthorInfo(post);
  const compasses = getPostCompasses(post);
  const excerpt = post.summary || stripHtmlToPlain(post.content).slice(0, 130) + "...";

  return `
    <article class="news-card" data-open-post="${escapeHtml(post.id)}">
      <div class="news-card-thumb">
        ${buildPostThumbnailHtml(post, post.title)}
      </div>
      <div class="news-card-body">
        <div>
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
            <span class="cat-badge">${escapeHtml(compasses[0])}</span>
            ${
              post.subcategory
                ? `<span style="font-size:0.74rem;font-weight:800;color:var(--text-muted);">${escapeHtml(
                    post.subcategory
                  )}</span>`
                : ""
            }
          </div>
          <h3 class="news-card-title">${escapeHtml(post.title)}</h3>
          <p class="news-card-excerpt">${escapeHtml(excerpt)}</p>
        </div>

        <div class="card-meta-footer">
          <div class="card-author-pill" data-open-author="${escapeHtml(authorInfo.authorKey)}">
            <img src="${escapeHtml(authorInfo.avatar)}" alt="${escapeHtml(authorInfo.name)}" loading="lazy">
            <span>${escapeHtml(authorInfo.name)}</span>
            ${
              authorInfo.verified
                ? `<span class="material-symbols-rounded verified-badge" translate="no">verified</span>`
                : ""
            }
          </div>
          <span>${formatRelativeTime(post.createdAt)}</span>
        </div>
      </div>
    </article>
  `;
}

function bindPostCardsEvents(container) {
  if (!container) return;
  container.querySelectorAll("[data-open-post]").forEach((card) => {
    card.addEventListener("click", (e) => {
      const authorEl = e.target.closest("[data-open-author]");
      if (authorEl) {
        e.stopPropagation();
        openAuthorProfile(authorEl.getAttribute("data-open-author"));
        return;
      }
      openArticleReader(card.getAttribute("data-open-post"));
    });
  });
}

function renderPublicPostsFeed() {
  const grid = document.getElementById("public-posts-grid");
  const heading = document.getElementById("feed-section-heading");
  const counterEl = document.getElementById("feed-posts-counter");
  const filterBanner = document.getElementById("active-filter-banner");
  const filterTitle = document.getElementById("active-filter-title");
  const loadMoreWrap = document.getElementById("load-more-wrap");

  if (!grid) return;

  let list = getPublishedPosts();

  if (state.activeCompass !== "all") {
    list = list.filter((p) => getPostCompasses(p).includes(state.activeCompass));
  }

  if (state.activeSubcategory !== "all") {
    list = list.filter((p) => p.subcategory === state.activeSubcategory);
  }

  if (state.activeTag) {
    const tagClean = state.activeTag.toLowerCase();
    list = list.filter(
      (p) =>
        Array.isArray(p.tags) &&
        p.tags.some((t) => String(t).toLowerCase() === tagClean)
    );
  }

  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    list = list.filter((p) => {
      const hay = `${p.title || ""} ${p.summary || ""} ${p.author || ""} ${(p.tags || []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }

  // تحديث شريط التنبيه عند تفعيل فلتر خاص
  if (state.searchQuery || state.activeTag || state.activeCompass !== "all") {
    filterBanner?.classList.remove("hidden");
    if (filterTitle) {
      if (state.searchQuery) filterTitle.textContent = `نتائج البحث عن: "${state.searchQuery}"`;
      else if (state.activeTag) filterTitle.textContent = `المواضيع المرتبطة بالوسم: #${state.activeTag}`;
      else if (state.activeSubcategory !== "all")
        filterTitle.textContent = `${state.activeCompass} — ${state.activeSubcategory}`;
      else filterTitle.textContent = `قسم: ${state.activeCompass}`;
    }
  } else {
    filterBanner?.classList.add("hidden");
  }

  if (heading) {
    heading.textContent =
      state.activeCompass === "all" ? "أحدث الأخبار والتقارير والتحليلات" : state.activeCompass;
  }

  if (counterEl) {
    counterEl.textContent = `${list.length.toLocaleString("ar-YE")} مادة صحفية`;
  }

  if (!list.length) {
    grid.innerHTML = `<div class="empty-box" style="grid-column:1/-1;padding:38px;text-align:center;">لا توجد مواد صحفية تطابق خيارات العرض الحالية.</div>`;
    loadMoreWrap?.classList.add("hidden");
    return;
  }

  const visibleSlice = list.slice(0, state.visiblePostsLimit);
  grid.innerHTML = visibleSlice.map((p) => buildNewsCardHtml(p)).join("");
  bindPostCardsEvents(grid);

  if (loadMoreWrap) {
    loadMoreWrap.classList.toggle("hidden", list.length <= state.visiblePostsLimit);
  }
}

function renderAllHomeSections() {
  renderBreakingNewsBar();
  renderPublicAds();
  renderHeroAndPulseSection();
  renderWritersStrip();
  renderPublicPostsFeed();
}

// ------------------- نهاية الجزء الأول (الأكبر) من محرك الموقع العام (حُجرية بريس) -------------------
