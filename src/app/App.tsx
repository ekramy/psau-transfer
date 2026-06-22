import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
// motion/react handles micro-interactions (hover, tap, accordion); GSAP handles scroll animations
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import heroImage from "@/imports/magnific_maintain-the-exact-compos_rlIWbSfxtc.png";
import psauLogo  from "@/imports/PSAU-Logo-1.svg";
import aiLogo    from "@/imports/ai-1.svg";
import FooterFrame from "@/imports/Frame1/index";

gsap.registerPlugin(ScrollTrigger);

// ─── Reduced motion ──────────────────────────────────────────────────────────

function usePrefersReducedMotion() {
  const reduced = useReducedMotion();
  return !!reduced;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ─── Scroll progress bar ──────────────────────────────────────────────────────

function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const bar = barRef.current;
    if (!bar) return;

    const ctx = gsap.context(() => {
      gsap.to(bar, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 right-0 h-[3px] z-[100] origin-left"
      style={{
        background: "linear-gradient(90deg, #006C35, #0F8A5F, #C9A227)",
        transform: "scaleX(0)",
      }}
      aria-hidden="true"
    />
  );
}

// ─── GSAP-powered FadeIn ──────────────────────────────────────────────────────

function FadeIn({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const fromVars: gsap.TweenVars = {
      opacity: 0,
      duration: 0.7,
      delay,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    };
    if (direction === "up")    fromVars.y = 36;
    if (direction === "down")  fromVars.y = -36;
    if (direction === "left")  fromVars.x = 36;
    if (direction === "right") fromVars.x = -36;

    const ctx = gsap.context(() => gsap.from(el, fromVars));
    return () => ctx.revert();
  }, [delay, direction]);

  return <div ref={ref} className={className}>{children}</div>;
}

// ─── GSAP-powered stagger grid / list ────────────────────────────────────────

function StaggerContainer({
  children,
  className = "",
  stagger = 0.08,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const children = Array.from(el.children) as HTMLElement[];

    const ctx = gsap.context(() => {
      gsap.from(children, {
        opacity: 0,
        y: 28,
        duration: 0.55,
        stagger,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });
    return () => ctx.revert();
  }, [stagger]);

  return <div ref={ref} className={className}>{children}</div>;
}

// StaggerItem is now a plain wrapper — GSAP targets DOM children directly
function StaggerItem({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
  [k: string]: unknown;
}) {
  return <div className={className}>{children}</div>;
}

// ─── GSAP animated counter ────────────────────────────────────────────────────

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const obj = useRef({ n: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) { setVal(target); return; }

    const ctx = gsap.context(() => {
      gsap.to(obj.current, {
        n: target,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate() { setVal(Math.round(obj.current.n)); },
        onComplete() { setVal(target); },
      });
    });
    return () => ctx.revert();
  }, [target]);

  return <span ref={ref}>{val}{suffix}</span>;
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-xl bg-gray-200 animate-pulse ${className}`} />
  );
}

function MajorCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-border shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-9 w-full rounded-xl mt-2" />
    </div>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

type View = "home" | "dashboard";
type MajorCategory = "all" | "cs" | "eng" | "health" | "business" | "humanities";

interface Major {
  name: string;
  minGpa: number;
  seats: number;
  note: string;
  category: MajorCategory;
  college: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const MAJORS: Major[] = [
  { name: "علوم الحاسب", minGpa: 3.5, seats: 20, note: "اجتياز مقررات الرياضيات", category: "cs", college: "كلية الحاسب وتقنية المعلومات" },
  { name: "نظم المعلومات", minGpa: 3.2, seats: 15, note: "لا توجد اشتراطات خاصة", category: "cs", college: "كلية الحاسب وتقنية المعلومات" },
  { name: "أمن المعلومات", minGpa: 3.75, seats: 10, note: "اجتياز مقررات البرمجة", category: "cs", college: "كلية الحاسب وتقنية المعلومات" },
  { name: "الهندسة المدنية", minGpa: 4.0, seats: 8, note: "الرياضيات والفيزياء إلزاميان", category: "eng", college: "كلية الهندسة" },
  { name: "الهندسة الكهربائية", minGpa: 4.0, seats: 6, note: "مقررات الكيمياء والفيزياء", category: "eng", college: "كلية الهندسة" },
  { name: "هندسة الحاسب", minGpa: 3.9, seats: 12, note: "البرمجة والرياضيات إلزاميان", category: "eng", college: "كلية الهندسة" },
  { name: "الصيدلة", minGpa: 4.5, seats: 5, note: "الكيمياء والأحياء إلزاميان", category: "health", college: "كلية الصيدلة" },
  { name: "الطب البشري", minGpa: 4.75, seats: 3, note: "الكيمياء والأحياء وعلم الأحياء", category: "health", college: "كلية الطب" },
  { name: "إدارة الأعمال", minGpa: 3.0, seats: 25, note: "لا توجد اشتراطات خاصة", category: "business", college: "كلية إدارة الأعمال" },
  { name: "المحاسبة", minGpa: 3.0, seats: 20, note: "لا توجد اشتراطات خاصة", category: "business", college: "كلية إدارة الأعمال" },
  { name: "اللغة العربية", minGpa: 2.75, seats: 30, note: "اختبار قدرات لغوية", category: "humanities", college: "كلية الآداب والعلوم الإنسانية" },
  { name: "التاريخ والحضارة", minGpa: 2.5, seats: 25, note: "لا توجد اشتراطات خاصة", category: "humanities", college: "كلية الآداب والعلوم الإنسانية" },
];

const REQUIREMENTS = [
  { title: "الجنسية", body: "يُشترط أن يكون المتقدم سعودي الجنسية أو من في حكمه وفق لوائح الجامعة المعتمدة." },
  { title: "الانتظام الدراسي", body: "أن يكون الطالب منتظماً في جامعته الحالية وغير موقوف أو محال للتحقيق." },
  { title: "المعدل التراكمي المطلوب", body: "يختلف الحد ال��دنى للمعدل حسب التخصص المطلوب، ويتراوح بين 2.5 و4.75 من 5." },
  { title: "شروط التخصص", body: "اجتياز المقررات الأساسية المعادِلة لمتطلبات التخصص في جامعة الأمير سطام." },
  { title: "معادلة المقررات", body: "تُدرس معادلة المقررات من قِبل لجنة أكاديمية متخصصة. يحق للطالب احتساب ما لا يتجاوز 50% من إجمالي ساعاته." },
  { title: "المدة الزمنية للتقديم", body: "يُقبل الطلب خلال نافذة التقديم المحددة في كل فصل دراسي. لا يُقبل الطلب خارج هذه النافذة بأي حال." },
];

const FAQ_ITEMS = [
  { q: "متى يبدأ التقديم للتحويل الخارجي؟", a: "تفتح نافذة التقديم في بداية كل فصل دراسي وتمتد لمدة أسبوعين. يُعلن عن المواعيد الدقيقة عبر البوابة الإلكترونية للجامعة." },
  { q: "كيف تتم معادلة المقررات الدراسية؟", a: "تُرفع قائمة المقررات المجتازة مع توصيف كل مقرر، وتراجعها لجنة متخصصة في الكلية المعنية لتحديد المقررات القابلة للاحتساب." },
  { q: "هل التقديم يعني القبول التلقائي؟", a: "لا، التقديم لا يعني القبول. تخضع الطلبات لدراسة أكاديمية شاملة وتُحدد نتائجها وفقاً لتوافر المقاعد واستيفاء الشروط." },
  { q: "كيف أتابع حالة طلب التحويل؟", a: "بعد تسجيل الطلب، يمكنك متابعة حالته من خلال لوحة التحكم الخاصة بك في هذه البوابة باستخدام رقم الهوية الوطنية." },
  { q: "ما الوقت المستغرق للبت في الطلب؟", a: "يستغرق عادةً من 4 إلى 6 أسابيع من إغلاق باب التقديم حتى صدور النتائج." },
];

const CATEGORY_LABELS: Record<MajorCategory, string> = {
  all: "الكل",
  cs: "الحاسب وتقنية المعلومات",
  eng: "الهندسة",
  health: "العلوم الصحية",
  business: "العلوم الإدارية",
  humanities: "العلوم الإنسانية",
};

const NAV_SECTIONS = [
  { id: "hero", label: "الرئيسية" },
  { id: "majors", label: "التخصصات" },
  { id: "requirements", label: "الشروط" },
  { id: "calculator", label: "فحص الأهلية" },
  { id: "faq", label: "الأسئلة الشائعة" },
];

// ─── Hero parallax (GSAP scrub) ───────────────────────────────────────────────

function HeroParallax() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const img = document.getElementById("hero-img");
    if (!img) return;
    const ctx = gsap.context(() => {
      gsap.to(img, {
        yPercent: 22,
        ease: "none",
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    });
    return () => ctx.revert();
  }, []);
  return null;
}

// ─── Journey steps with GSAP timeline ────────────────────────────────────────

const JOURNEY_STEPS = [
  {
    num: 1,
    title: "رفع البيانات والمستندات",
    desc: "تعبئة النموذج الإلكتروني ورفع المستندات المطلوبة",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    ),
  },
  {
    num: 2,
    title: "مراجعة الشروط والتحقق",
    desc: "التحقق التلقائي من استيفاء الشروط الأساسية",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
  },
  {
    num: 3,
    title: "الدراسة الأكاديمية",
    desc: "مراجعة الطلب من القسم الأكاديمي المختص",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
      </svg>
    ),
  },
  {
    num: 4,
    title: "إشعار النتيجة النهائية",
    desc: "إرسال قرار القبول أو الرفض المسبب رسمياً",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
    ),
  },
];

function JourneySteps() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    const line = lineRef.current;
    if (!el || prefersReducedMotion()) return;

    const circles = el.querySelectorAll<HTMLElement>(".journey-circle");
    const texts   = el.querySelectorAll<HTMLElement>(".journey-text");

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 82%", once: true },
      });

      // 1. Line draws in from right → left
      if (line) {
        tl.from(line, { scaleX: 0, transformOrigin: "right center", duration: 0.9, ease: "power2.inOut" });
      }

      // 2. Circles pop in with stagger
      tl.from(circles, {
        scale: 0.4, opacity: 0, duration: 0.5,
        stagger: 0.15, ease: "back.out(1.6)",
      }, "-=0.5");

      // 3. Text slides up
      tl.from(texts, {
        opacity: 0, y: 18, duration: 0.45,
        stagger: 0.12, ease: "power2.out",
      }, "-=0.3");
    });
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Dashed connector */}
      <div
        ref={lineRef}
        className="absolute hidden md:block"
        style={{ top: 36, right: "12%", left: "12%", borderTop: "2px dashed #B6D9C4", zIndex: 0 }}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-4">
        {JOURNEY_STEPS.map((step) => (
          <div key={step.num} className="flex flex-col items-center text-center gap-4 relative z-10">
            <motion.div
              whileHover={{ scale: 1.08, y: -4 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              className="journey-circle relative"
            >
              <div
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center shadow-md"
                style={{ background: "linear-gradient(145deg, #006C35, #0F8A5F)" }}
              >
                {step.icon}
              </div>
              <div
                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow"
                style={{ background: "#C9A227" }}
              >
                {step.num}
              </div>
            </motion.div>
            <div className="journey-text">
              <p className="font-bold text-gray-800 text-sm leading-snug">{step.title}</p>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed max-w-[140px] mx-auto">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Smooth scroll helper ─────────────────────────────────────────────────────

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({
  view, setView, darkMode, setDarkMode, activeSection,
}: {
  view: View; setView: (v: View) => void;
  darkMode: boolean; setDarkMode: (v: boolean) => void;
  activeSection: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      className="sticky top-0 z-50 border-b border-border"
      style={{
        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
        backgroundColor: scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.92)",
        backdropFilter: "blur(16px)",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.08)" : "none",
        transition: "box-shadow 0.3s ease, background-color 0.3s ease",
      }}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => scrollToSection("hero")}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #006C35, #0F8A5F)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L2 8l10 5 10-5-10-5z" fill="white" opacity="0.9"/>
                <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M2 16l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
              </svg>
            </div>
            <div>
              <div className="font-bold text-sm leading-tight" style={{ color: "#006C35" }}>جامعة الأمير سطام</div>
              <div className="text-xs text-gray-500">بوابة التحويل الخارجي</div>
            </div>
          </motion.div>

          {/* Desktop nav links with active indicator */}
          <div className="hidden md:flex items-center gap-1">
            {view === "home" && NAV_SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className="relative px-4 py-2 text-sm rounded-lg font-medium transition-colors"
                style={{ color: activeSection === s.id ? "#006C35" : "#6B7280" }}
              >
                {activeSection === s.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: "#F0FDF4" }}
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setDarkMode(!darkMode)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
              aria-label="تبديل الوضع الليلي"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={darkMode ? "sun" : "moon"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {darkMode ? "☀️" : "🌙"}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            <motion.button
              onClick={() => setView(view === "dashboard" ? "home" : "dashboard")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm"
              style={{ background: "linear-gradient(135deg, #006C35, #0F8A5F)" }}
            >
              {view === "dashboard" ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  </svg>
                  الرئيسية
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  لوحة المتابعة
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-colors hover:bg-green-50"
              style={{ borderColor: "#006C35", color: "#006C35" }}
            >
              تسجيل الدخول
            </motion.button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 rounded-lg border border-border flex items-center justify-center"
              aria-label="قائمة التنقل"
            >
              <motion.svg
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                animate={mobileOpen ? "open" : "closed"}
              >
                <motion.path
                  variants={{ closed: { d: "M3 6h18" }, open: { d: "M18 6L6 18" } }}
                  transition={{ duration: 0.2 }}
                />
                <motion.path
                  variants={{ closed: { d: "M3 12h18", opacity: 1 }, open: { d: "M3 12h18", opacity: 0 } }}
                  transition={{ duration: 0.15 }}
                />
                <motion.path
                  variants={{ closed: { d: "M3 18h18" }, open: { d: "M6 6l12 12" } }}
                  transition={{ duration: 0.2 }}
                />
              </motion.svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden border-t border-border bg-white overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { scrollToSection(s.id); setMobileOpen(false); }}
                  className="block w-full text-right px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{ color: activeSection === s.id ? "#006C35" : "#374151", background: activeSection === s.id ? "#F0FDF4" : "transparent" }}
                >
                  {s.label}
                </button>
              ))}
              <div className="flex gap-2 pt-2 border-t border-border mt-2">
                <button
                  onClick={() => { setView(view === "dashboard" ? "home" : "dashboard"); setMobileOpen(false); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white text-center"
                  style={{ background: "#006C35" }}
                >
                  {view === "dashboard" ? "الرئيسية" : "لوحة المتابعة"}
                </button>
                <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 text-center" style={{ borderColor: "#006C35", color: "#006C35" }}>
                  تسجيل الدخول
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ─── Flat SVG icons ───────────────────────────────────���───────────────────────

function IconBolt() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#006C35" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#006C35" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
    </svg>
  );
}
function IconBuilding() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#006C35" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="18"/><rect x="14" y="8" width="7" height="13"/>
      <path d="M3 21h18"/><path d="M6 7h1m0 4H6m5-8h1m0 4h-1"/>
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#006C35" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ value, numericValue, suffix, label, Icon }: {
  value?: string; numericValue?: number; suffix?: string; label: string;
  Icon: React.ComponentType;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="flex flex-col items-center gap-4 text-center cursor-default"
    >
      {/* Icon pill */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 280, damping: 18 }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "#EBF5EE" }}
      >
        <Icon />
      </motion.div>

      {/* Value */}
      <div className="text-4xl font-bold leading-none" style={{ color: "#006C35" }}>
        {numericValue !== undefined ? (
          <AnimatedNumber target={numericValue} suffix={suffix ?? ""} />
        ) : value}
      </div>

      {/* Label */}
      <div className="text-sm text-gray-500 leading-snug">{label}</div>
    </motion.div>
  );
}

// ─── Major Card ───────────────────────────────────────────────────────────────

function MajorCard({ major }: { major: Major }) {
  const [hovered, setHovered] = useState(false);
  const hasSpecialReq = major.note && major.note !== "لا توجد اشتراطات خاصة";
  const gpaPercent = Math.min((major.minGpa / 5) * 100, 100);
  const seatsPercent = Math.min((major.seats / 30) * 100, 100);

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,108,53,0.10)" }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="bg-white rounded-2xl p-5 border border-border shadow-sm flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base leading-snug transition-colors" style={{ color: hovered ? "#006C35" : "#1F2937" }}>
            {major.name}
          </h3>
          <p className="text-xs text-gray-400 mt-1">{major.college}</p>
        </div>
        <motion.div
          animate={{ scale: hovered ? 1.08 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "#EBF5EE" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#006C35" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </motion.div>
      </div>

      {/* GPA row */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500">الحد الأدنى للمعدل</span>
          <span className="text-sm font-bold" style={{ color: "#006C35" }}>{major.minGpa.toFixed(2)}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#E5E7EB" }}>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${gpaPercent}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #006C35, #0F8A5F)" }}
          />
        </div>
      </div>

      {/* Seats row */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500">المقاعد المتاحة</span>
          <span className="text-sm font-bold" style={{ color: "#006C35" }}>{major.seats} مقعد</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#E5E7EB" }}>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${seatsPercent}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.18 }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #006C35, #0F8A5F)" }}
          />
        </div>
      </div>

      {/* Special requirement */}
      <div className="min-h-[28px] mb-3">
        {hasSpecialReq && (
          <div className="flex items-start gap-1.5">
            <span className="text-xs font-medium" style={{ color: "#D97706" }}>متطلبات خاصة</span>
            <span className="text-xs" style={{ color: "#D97706" }}>• {major.note}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-1">
        <p className="text-xs text-gray-400 mb-2">مقاعد متاحة</p>
        <motion.button
          whileHover={{ backgroundColor: "#006C35", color: "#ffffff" }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.18 }}
          className="w-full py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors"
          style={{ borderColor: "#006C35", color: "#006C35", background: "transparent" }}
        >
          عرض التفاصيل
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Accordion ────────────────────────────────────────────────────────────────

function AccordionItem({ title, body, open, onClick }: {
  title: string; body: string; open: boolean; onClick: () => void;
}) {
  return (
    <motion.div
      layout
      className="border border-border rounded-2xl overflow-hidden"
      style={{ background: open ? "white" : "white" }}
    >
      <motion.button
        onClick={onClick}
        className="w-full flex items-center justify-between px-6 py-4 text-right transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
        whileHover={{ backgroundColor: "#F9FAFB" }}
        aria-expanded={open}
      >
        <span className="font-semibold text-gray-800 text-right">{title}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0, background: open ? "#006C35" : "#F3F4F6" }}
          transition={{ duration: 0.25 }}
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ color: open ? "white" : "#6B7280" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </motion.span>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pt-3 text-gray-600 text-sm leading-relaxed border-t border-border bg-gray-50">
              {body}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Doc Card ──────────────────────────────────────────────────────���──────────

function DocCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,108,53,0.10)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className="bg-white rounded-2xl px-5 py-4 border border-border flex items-center gap-4 cursor-pointer"
      style={{ borderColor: "#E5E7EB" }}
    >
      {/* icon — right side in RTL (rendered first in DOM = visual right) */}
      <motion.div
        whileHover={{ scale: 1.08 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "linear-gradient(145deg, #006C35, #0F8A5F)" }}
      >
        {icon}
      </motion.div>
      {/* text — left side in RTL */}
      <div className="flex-1 text-right min-w-0">
        <h4 className="font-bold text-gray-800 text-sm leading-snug">{title}</h4>
        <p className="text-xs text-gray-400 mt-1">{desc}</p>
      </div>
    </motion.div>
  );
}

// ─── Calculator ────────────────────────────────────────────────────────������─���────

const MAJOR_OPTIONS = [
  "ع��وم الحاسب", "نظم المعلومات", "أمن المعلومات",
  "الهندسة المدنية", "الهندسة الكهربائية", "هندسة الحاسب",
  "الصيدلة", "الطب البشري",
  "إدارة الأعمال", "المحاسبة",
  "اللغة العربية", "التاريخ والحضارة",
];

function TransferCalculator() {
  const [university, setUniversity] = useState("");
  const [gpa, setGpa] = useState("");
  const [hours, setHours] = useState("");
  const [targetMajor, setTargetMajor] = useState("");
  const [result, setResult] = useState<null | "eligible" | "ineligible">(null);
  const [checking, setChecking] = useState(false);

  const check = useCallback(async () => {
    const g = parseFloat(gpa);
    const h = parseInt(hours);
    if (!university || isNaN(g) || isNaN(h) || !targetMajor) return;
    setChecking(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 900));
    setChecking(false);
    setResult(g >= 3.0 && h >= 30 ? "eligible" : "ineligible");
  }, [university, gpa, hours, targetMajor]);

  const inputCls = "w-full px-4 py-3 rounded-2xl border bg-white text-right text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition-all";
  const labelCls = "block text-sm font-bold text-gray-800 mb-2 text-right";

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border max-w-xl mx-auto" style={{ borderColor: "#E5E7EB" }}>

      {/* University — full width */}
      <div className="mb-5">
        <label className={labelCls}>الجامعة الحالية</label>
        <motion.input
          whileFocus={{ scale: 1.005 }}
          type="text"
          value={university}
          onChange={e => setUniversity(e.target.value)}
          placeholder="أدخل اسم جامعتك الحالية"
          className={inputCls}
          style={{ borderColor: "#E5E7EB" }}
        />
      </div>

      {/* GPA + Hours — two columns */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className={labelCls}>الساعات المجتازة</label>
          <motion.input
            whileFocus={{ scale: 1.005 }}
            type="number"
            value={hours}
            onChange={e => setHours(e.target.value)}
            placeholder="مثال: 45"
            className={inputCls}
            style={{ borderColor: "#E5E7EB" }}
          />
        </div>
        <div>
          <label className={labelCls}>المعدل التراكمي (من 5)</label>
          <motion.input
            whileFocus={{ scale: 1.005 }}
            type="number"
            value={gpa}
            onChange={e => setGpa(e.target.value)}
            placeholder="مثال: 3.75"
            className={inputCls}
            style={{ borderColor: "#E5E7EB" }}
          />
        </div>
      </div>

      {/* Target major — dropdown */}
      <div className="mb-7">
        <label className={labelCls}>التخصص المطلوب</label>
        <div className="relative">
          <select
            value={targetMajor}
            onChange={e => setTargetMajor(e.target.value)}
            className={`${inputCls} appearance-none cursor-pointer`}
            style={{ borderColor: "#E5E7EB" }}
          >
            <option value="" disabled>اختر التخصص المطلوب</option>
            {MAJOR_OPTIONS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          {/* chevron */}
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </span>
        </div>
      </div>

      {/* Submit */}
      <motion.button
        onClick={check}
        disabled={checking}
        whileHover={{ scale: checking ? 1 : 1.02 }}
        whileTap={{ scale: checking ? 1 : 0.97 }}
        className="w-full py-4 rounded-2xl text-white font-bold text-base transition-opacity"
        style={{ background: "#006C35", opacity: checking ? 0.85 : 1 }}
      >
        {checking ? (
          <span className="flex items-center justify-center gap-3">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full inline-block"
            />
            جارٍ التحقق...
          </span>
        ) : "تحقق من الأهلية"}
      </motion.button>

      {/* Result */}
      <AnimatePresence>
        {result && !checking && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mt-6 rounded-2xl p-6 text-center border-2"
            style={result === "eligible"
              ? { background: "#F0FDF4", borderColor: "#16A34A" }
              : { background: "#FFF7F7", borderColor: "#DC2626" }
            }
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
              className="text-5xl mb-3"
            >
              {result === "eligible" ? "✅" : "❌"}
            </motion.div>
            <h3 className="text-xl font-bold mb-2" style={{ color: result === "eligible" ? "#15803D" : "#DC2626" }}>
              {result === "eligible" ? "مؤهل مبدئياً للتحويل" : "غير مؤهل حالياً"}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {result === "eligible"
                ? "استيفاء الشروط المبدئية لا يضمن القبول. سيتم دراسة طلبك أكاديمياً بعد التقديم الرسمي."
                : "معدلك أو عدد الساعات لا يستوفي الحد الأدنى. يمكنك التواصل مع القبول للاستشارة."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Dashboard ────────────��───────────────────────────────────────────────────

const DOC_STATUSES = [
  { name: "السجل الأكاديمي الرسمي",  status: "مقبول",        type: "accepted"  },
  { name: "الهوية الوطنية",           status: "مقبول",        type: "accepted"  },
  { name: "شهادة الثانوية العامة",    status: "مقبول",        type: "accepted"  },
  { name: "وصف المقررات الدراسية",    status: "قيد المراجعة", type: "reviewing" },
  { name: "خطاب القبول السابق",       status: "مطلوب",        type: "required"  },
  { name: "خطاب الترشيح",            status: "مطلوب",        type: "required"  },
];

const NOTIFICATIONS = [
  { msg: "وصف المقررات قيد المراجعة من القسم الأكاديمي", time: "منذ ساعتين",   unread: true  },
  { msg: "طلبك قيد الدراسة لدى قسم علوم الحاسب",        time: "منذ يومين",    unread: true  },
  { msg: "تم تأكيد استلام طلبك بنجاح",                  time: "20 يوليو 2024", unread: false },
];

const PROGRESS_STEPS = [
  { label: "تم التقديم",         date: "20 يوليو 2024", state: "done"    },
  { label: "قيد المراجعة",       date: "25 يوليو 2024", state: "done"    },
  { label: "الدراسة الأكاديمية", date: "جارٍ الآن",     state: "active"  },
  { label: "القبول النهائي",     date: "—",              state: "pending" },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; iconBg: string; iconColor: string }> = {
  accepted:  { bg: "#DCFCE7", color: "#15803D", iconBg: "#DCFCE7", iconColor: "#16A34A" },
  reviewing: { bg: "#FEFCE8", color: "#A16207", iconBg: "#FEF9C3", iconColor: "#CA8A04" },
  required:  { bg: "#FEE2E2", color: "#DC2626", iconBg: "#FEE2E2", iconColor: "#DC2626" },
};

function DocStatusBadge({ type, label }: { type: string; label: string }) {
  const s = STATUS_STYLE[type] ?? STATUS_STYLE.required;
  return (
    <span
      className="text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      {label}
    </span>
  );
}

function DocFileIcon({ type }: { type: string }) {
  const s = STATUS_STYLE[type] ?? STATUS_STYLE.required;
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ background: s.iconBg }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke={s.iconColor} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="13" y1="17" x2="8" y2="17"/>
      </svg>
    </div>
  );
}

function Dashboard({ setView }: { setView: (v: View) => void }) {
  const dashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = dashRef.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll<HTMLElement>(".dash-card"), {
        opacity: 0, y: 20, duration: 0.5, stagger: 0.08, ease: "power3.out", delay: 0.05,
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={dashRef} className="min-h-screen py-8 px-4"
      style={{ background: "#F5F6FA", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
      dir="rtl">
      <div className="max-w-6xl mx-auto space-y-4">

        {/* ── Header ── */}
        <div className="dash-card flex items-center justify-between gap-4 py-2">
          <div className="text-right">
            <h1 className="text-xl font-bold text-gray-800">مرحباً، أحمد محمد العمري</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              رقم الطلب:&nbsp;
              <span className="font-mono font-semibold text-gray-500">PSAU-TR-2025-00847</span>
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.06 }}
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #006C35, #0F8A5F)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </motion.div>
        </div>

        {/* ── Status banner ── */}
        <div className="dash-card rounded-2xl overflow-hidden shadow-sm"
          style={{ background: "linear-gradient(135deg, #004B24 0%, #006C35 55%, #0A7A46 100%)" }}>
          <div className="flex items-stretch min-h-[100px]">
            {/* 75% block — visual left in RTL (rendered last) */}
            <div className="flex flex-col items-center justify-center px-8 py-5 flex-shrink-0 order-last"
              style={{ background: "rgba(0,0,0,0.20)", borderRight: "1px solid rgba(255,255,255,0.12)" }}>
              <span className="text-4xl font-black text-white leading-none">75%</span>
              <span className="text-xs text-green-200 mt-1 font-medium whitespace-nowrap">اكتمال الطلب</span>
            </div>
            {/* Status text — visual right in RTL */}
            <div className="flex-1 px-6 py-5 text-right flex flex-col justify-center">
              <p className="text-green-300 text-xs font-medium mb-1">حالة الطلب الحالية</p>
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                تحت المراجعة الأكاديمية
              </h2>
              <p className="text-green-300 text-xs mt-1.5">
                آخر تحديث: الثلاثاء، 3 ديسمبر 2024 — 10:30 ص
              </p>
            </div>
          </div>
        </div>

        {/* ── Progress tracker ── */}
        <div className="dash-card bg-white rounded-2xl px-6 pt-5 pb-7 shadow-sm border"
          style={{ borderColor: "#E9EAEC" }}>
          <h2 className="text-base font-bold text-gray-800 mb-7 text-right">مسار تقدم الطلب</h2>

          {/* Outer wrapper: relative so the line can be absolute */}
          <div className="relative">

            {/* ── Horizontal line behind circles ── */}
            {/* full-width base (gray) */}
            <div className="absolute left-0 right-0 h-0.5 bg-gray-200"
              style={{ top: 24 }} />
            {/* green filled portion — covers first 2 gaps (steps 0→1→2) = roughly 62.5% in a 4-step RTL row */}
            <motion.div
              className="absolute right-0 h-0.5"
              style={{ top: 24, background: "#006C35", width: "62.5%" }}
              initial={{ scaleX: 0, originX: "right" }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
            />

            {/* ── Steps ── */}
            <div className="grid grid-cols-4 relative z-10">
              {PROGRESS_STEPS.map((step, i) => (
                <div key={step.label} className="flex flex-col items-center gap-3">
                  {/* Circle */}
                  <motion.div
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.12, type: "spring", stiffness: 300, damping: 20 }}
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={
                      step.state === "done"
                        ? { background: "#006C35", border: "3px solid #006C35" }
                        : step.state === "active"
                        ? { background: "#C9A227", border: "3px solid #C9A227" }
                        : { background: "white", border: "2.5px solid #D1D5DB" }
                    }
                  >
                    {step.state === "done" ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6.5L9.5 17 4 11.5"/>
                      </svg>
                    ) : step.state === "active" ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="white" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="9"/>
                        <polyline points="12 7 12 12 15.5 14.5"/>
                      </svg>
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-gray-300" />
                    )}
                  </motion.div>

                  {/* Label + date */}
                  <div className="text-center">
                    <p className="text-sm font-bold leading-tight"
                      style={{
                        color: step.state === "done"
                          ? "#1F2937"
                          : step.state === "active"
                          ? "#C9A227"
                          : "#9CA3AF",
                      }}>
                      {step.label}
                    </p>
                    <p className="text-xs mt-0.5 font-medium"
                      style={{ color: step.state === "active" ? "#C9A227" : "#B0B7C3" }}>
                      {step.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Two columns ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4">

          {/* RIGHT col — حالة المستندات */}
          <div className="dash-card bg-white rounded-2xl px-6 py-5 shadow-sm border" style={{ borderColor: "#E9EAEC" }}>
            {/* Header - Title on right, upload link on left */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">حالة المستندات</h2>
              <motion.button
                whileHover={{ opacity: 0.75 }}
                whileTap={{ scale: 0.97 }}
                className="text-sm font-semibold flex items-center gap-1.5"
                style={{ color: "#006C35", background: "none", border: "none" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                رفع مستند
              </motion.button>
            </div>

            {/* Rows */}
            <div className="space-y-0">
              {DOC_STATUSES.map((doc, i) => (
                <motion.div
                  key={doc.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className="flex items-center justify-between gap-4 py-4 border-b last:border-b-0"
                  style={{ borderColor: "#F0F0F0" }}
                >
                  {/* Icon + Name — visual right in RTL */}
                  <div className="flex items-center gap-3">
                    <DocFileIcon type={doc.type} />
                    <span className="text-sm font-medium text-gray-800">{doc.name}</span>
                  </div>

                  {/* Badge — visual left in RTL */}
                  <DocStatusBadge type={doc.type} label={doc.status} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* LEFT col — Notifications + Details */}
          <div className="space-y-4">

            {/* الإشعارات */}
            <div className="dash-card bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: "#E9EAEC" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">الإشعارات</h2>
                {/* Gold badge count */}
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: "#C9A227" }}>
                  2
                </div>
              </div>
              <div className="space-y-3">
                {NOTIFICATIONS.map((n, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.07 }}
                    className="flex items-start gap-2.5 text-right">
                    {/* Dot */}
                    <motion.span
                      animate={n.unread ? { scale: [1, 1.4, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 2, delay: i * 0.6 }}
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                      style={{ background: n.unread ? "#006C35" : "#D1D5DB" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 leading-snug font-medium">{n.msg}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* تفاصيل الطلب */}
            <div className="dash-card bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: "#E9EAEC" }}>
              <h2 className="text-lg font-bold text-gray-900 mb-3">تفاصيل الطلب</h2>
              <div className="space-y-0">
                {[
                  { label: "التخصص المطلوب",  value: "علوم الحاسب",        bold: true  },
                  { label: "الجامعة الحالية",  value: "جامعة الملك سعود",   bold: false },
                  { label: "المعدل التراكمي",  value: "5.00 / 3.85",        bold: false },
                  { label: "الساعات المجتازة", value: "72 ساعة",            bold: false },
                  { label: "تاريخ التقديم",    value: "20 نوفمبر 2024",     bold: false },
                ].map((row, i) => (
                  <div key={row.label}
                    className="flex items-center justify-between gap-2 py-2 border-b last:border-b-0"
                    style={{ borderColor: "#F3F4F6" }}>
                    <span className={`text-xs ${row.bold ? "font-bold text-gray-800" : "font-medium text-gray-700"}`}>
                      {row.value}
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{row.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* هل تحتاج مساعدة؟ */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl p-6 text-center"
              style={{ background: "linear-gradient(135deg, #0F8A5F, #006C35)" }}
            >
              {/* Icon */}
              <div className="flex justify-center mb-3">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 11h3a2 2 0 012 2v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a9 9 0 0118 0v5a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3"/>
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-white font-bold text-base mb-1">
                هل تحتاج مساعدة؟
              </h3>

              {/* Subtitle */}
              <p className="text-white/80 text-sm mb-4">
                فريق الدعم متاح على مدار الساعة
              </p>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 6px 20px rgba(201,162,39,0.4)" }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 rounded-xl font-bold text-sm"
                style={{ background: "#C9A227", color: "white" }}
              >
                تواصل مع الدعم الفني
              </motion.button>
            </motion.div>

          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Scroll spy hook ──────────────────────────────────────────────────����──────

function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const map: Record<string, boolean> = {};

    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          map[id] = entry.isIntersecting;
          const first = ids.find(i => map[i]);
          if (first) setActive(first);
        },
        { threshold: 0.3, rootMargin: "-80px 0px -40% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
  }, [ids]);

  return active;
}

// ─── Main App ────��────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<View>("home");
  const [darkMode, setDarkMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MajorCategory>("all");
  const [openReq, setOpenReq] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [majorsLoading, setMajorsLoading] = useState(false);

  const sectionIds = NAV_SECTIONS.map(s => s.id);
  const activeSection = useScrollSpy(sectionIds);

  const filteredMajors = activeCategory === "all" ? MAJORS : MAJORS.filter(m => m.category === activeCategory);

  const handleCategoryChange = (cat: MajorCategory) => {
    if (cat === activeCategory) return;
    setMajorsLoading(true);
    setActiveCategory(cat);
    setTimeout(() => {
      setMajorsLoading(false);
      // Let new cards paint, then re-measure for ScrollTrigger
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, 450);
  };

  // Smooth scroll CSS + GSAP ScrollTrigger cleanup on view change
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => { document.documentElement.style.scrollBehavior = ""; };
  }, []);

  useEffect(() => {
    // Refresh ScrollTrigger measurements whenever view changes
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [view]);

  return (
    <div dir="rtl" className={darkMode ? "dark" : ""} style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
      <ScrollProgressBar />
      <div className="min-h-screen bg-background text-foreground">
        <Navbar
          view={view} setView={setView}
          darkMode={darkMode} setDarkMode={setDarkMode}
          activeSection={activeSection}
        />

        <AnimatePresence mode="wait">
          {view === "dashboard" ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <Dashboard setView={setView} />
            </motion.div>
          ) : (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* ── HERO ── */}
              <section id="hero" className="relative overflow-hidden min-h-[92vh] flex items-center">
                <HeroParallax />
                <div className="absolute inset-0">
                  <img
                    id="hero-img"
                    src={heroImage}
                    alt="حفل تخرج جامعة الأمير سطام - طالب في ثوبه الأبيض يقف أمام الخريجين"
                    className="w-full h-full object-cover will-change-transform"
                  />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(105deg, rgba(0,60,30,0.93) 0%, rgba(0,108,53,0.88) 35%, rgba(15,138,95,0.5) 65%, rgba(0,40,20,0.3) 100%)" }} />
                </div>

                {/* Decorative orbs */}
                <motion.div
                  animate={{ scale: [1, 1.08, 1], opacity: [0.08, 0.14, 0.08] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                  className="absolute -top-20 -right-20 w-96 h-96 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, #C9A227, transparent 70%)" }}
                />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
                  <div className="max-w-2xl">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8 backdrop-blur-sm border"
                      style={{ background: "rgba(201,162,39,0.15)", borderColor: "rgba(201,162,39,0.4)", color: "#F6D860" }}
                    >
                      <motion.span
                        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                        transition={{ repeat: Infinity, duration: 1.8 }}
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#C9A227" }}
                      />
                      بوابة التحويل الخارجي الرسمية • الفصل الدراسي الثاني 1446هـ
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.65, delay: 0.2 }}
                      className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
                    >
                      التحويل إلى جامعة
                      <span className="block" style={{ color: "#F6D860" }}>الأمير سطام</span>
                      <span className="block text-3xl sm:text-4xl font-semibold text-green-100 mt-1">يبدأ من هنا</span>
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.35 }}
                      className="text-lg text-green-100 leading-relaxed mb-10 max-w-xl"
                    >
                      بوابة رقمية متكاملة تمكّنك من التقديم على طلب التحويل الخارجي ومتابعة حالة الطلب بكل سهولة وشفافية.
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.45 }}
                      className="flex flex-wrap gap-4 mb-12"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 16px 40px rgba(201,162,39,0.4)" }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold text-white shadow-xl"
                        style={{ background: "linear-gradient(135deg, #C9A227, #B8911F)" }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 5v14M5 12l7 7 7-7"/>
                        </svg>
                        تقديم طلب تحويل جديد
                      </motion.button>
                      <motion.button
                        onClick={() => setView("dashboard")}
                        whileHover={{ scale: 1.04, backgroundColor: "rgba(255,255,255,0.15)" }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold border-2 border-white/60 text-white backdrop-blur-sm"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                        </svg>
                        متابعة طلب سابق
                      </motion.button>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.65 }}
                      className="flex flex-wrap gap-3"
                    >
                      {[
                        { icon: "💻", label: "إجراءات رقمية بالكامل" },
                        { icon: "📡", label: "متابعة الطلب لحظياً" },
                        { icon: "🎓", label: "معادلة إلكترونية" },
                        { icon: "🛎️", label: "دعم فني متكامل" },
                      ].map((f, i) => (
                        <motion.div
                          key={f.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 + i * 0.08 }}
                          whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.18)" }}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-sm text-sm font-medium text-white/90 cursor-default"
                          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
                        >
                          <span>{f.icon}</span>{f.label}
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                  animate={{ y: [0, 6, 0], opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                >
                  <div className="w-px h-10 bg-white/40" />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </motion.div>
              </section>

              {/* ── STATS ── */}
              <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-border">
                <div className="max-w-5xl mx-auto">
                  <StaggerContainer
                    className="grid grid-cols-2 lg:grid-cols-4"
                    stagger={0.1}
                  >
                    {[
                      { numericValue: 2000, suffix: "+", label: "طلب تحويل سنوياً", Icon: IconUsers },
                      { numericValue: 24,   suffix: "",  label: "كلية وبرنامج أكاديمي", Icon: IconBuilding },
                      { numericValue: 100,  suffix: "%", label: "خدمات رقمية", Icon: IconGlobe },
                      { value: "فوري",      label: "متابعة الط��بات", Icon: IconBolt },
                    ].map((stat, i, arr) => (
                      <StaggerItem key={stat.label} className="relative">
                        <StatCard {...stat} />
                        {/* vertical divider between items (hidden on last) */}
                        {i < arr.length - 1 && (
                          <span
                            className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-12"
                            style={{ background: "#E5E7EB" }}
                          />
                        )}
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              </section>

              {/* ── JOURNEY ── */}
              <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-5xl mx-auto">
                  {/* Header */}
                  <FadeIn className="text-center mb-14">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold mb-5 border" style={{ background: "#EBF5EE", color: "#006C35", borderColor: "#BBF7D0" }}>
                      رحلة التحويل
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
                      رحلة التحويل في 4 خطوات
                    </h2>
                    <p className="text-gray-500 mt-3 text-sm max-w-md mx-auto">
                      نظام شفاف يُمكّنك من متابعة كل مرحلة من مراحل طلبك
                    </p>
                  </FadeIn>

                  {/* Steps */}
                  <JourneySteps />

                </div>
              </section>

              {/* ── MAJORS ── */}
              <section id="majors" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-6xl mx-auto">
                  <FadeIn className="text-center mb-10">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold mb-4 border" style={{ background: "#EBF5EE", color: "#006C35", borderColor: "#BBF7D0" }}>
                      التخصصات
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">التخصصات المتاحة للتحويل</h2>
                    <p className="text-gray-500 mt-3 text-sm">اختر التخصص وتحقق من الشروط اللازمة</p>
                  </FadeIn>

                  {/* Filter tabs — outlined pill style matching reference */}
                  <FadeIn className="flex flex-wrap justify-center gap-2 mb-8" delay={0.1}>
                    {(Object.keys(CATEGORY_LABELS) as MajorCategory[]).map((cat) => {
                      const active = activeCategory === cat;
                      return (
                        <motion.button
                          key={cat}
                          onClick={() => handleCategoryChange(cat)}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.96 }}
                          className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors overflow-hidden border"
                          style={{
                            borderColor: active ? "#006C35" : "#E5E7EB",
                            color: active ? "#ffffff" : "#374151",
                            background: active ? "transparent" : "transparent",
                          }}
                        >
                          {active && (
                            <motion.span
                              layoutId="cat-bg"
                              className="absolute inset-0 rounded-full"
                              style={{ background: "#006C35" }}
                              transition={{ type: "spring", stiffness: 380, damping: 32 }}
                            />
                          )}
                          <span className="relative z-10">{CATEGORY_LABELS[cat]}</span>
                        </motion.button>
                      );
                    })}
                  </FadeIn>

                  <AnimatePresence mode="wait">
                    {majorsLoading ? (
                      <motion.div
                        key="skeleton"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                      >
                        {Array.from({ length: 6 }).map((_, i) => <MajorCardSkeleton key={i} />)}
                      </motion.div>
                    ) : (
                      <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.28 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                      >
                        {filteredMajors.map((m, i) => (
                          <motion.div
                            key={m.name}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.055, duration: 0.32 }}
                          >
                            <MajorCard major={m} />
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>

              {/* ── REQUIREMENTS ── */}
              <section id="requirements" className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: "#F8FAFC" }}>
                <div className="max-w-4xl mx-auto">
                  <FadeIn className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">شروط التحويل</h2>
                    <p className="text-gray-500 mt-3">تأكد من استيفاء جميع الشروط قبل التقديم</p>
                  </FadeIn>
                  <StaggerContainer className="space-y-3" stagger={0.07}>
                    {REQUIREMENTS.map((r, i) => (
                      <StaggerItem key={i}>
                        <AccordionItem
                          title={r.title} body={r.body}
                          open={openReq === i}
                          onClick={() => setOpenReq(openReq === i ? null : i)}
                        />
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              </section>

              {/* ── DOCUMENTS ── */}
              <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: "#F8FAFC" }}>
                <div className="max-w-5xl mx-auto">
                  <FadeIn className="text-center mb-12">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold mb-4 border" style={{ background: "#EBF5EE", color: "#006C35", borderColor: "#BBF7D0" }}>
                      المستندات
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">المستندات المطلوبة</h2>
                    <p className="text-gray-500 mt-3 text-sm">جهّز هذه المستندات قبل البدء في التقديم</p>
                  </FadeIn>

                  <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.08}>
                    {[
                      {
                        title: "السجل الأكاديمي الرسمي",
                        desc: "مختوم ومعتمد من الجامعة الحالية",
                        icon: (
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10 9 9 9 8 9"/>
                          </svg>
                        ),
                      },
                      {
                        title: "الهوية الوطنية",
                        desc: "سارية المفعول — الوجهين",
                        icon: (
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="5" width="20" height="14" rx="2"/>
                            <circle cx="8" cy="12" r="2"/>
                            <path d="M14 9h4M14 12h4M14 15h2"/>
                          </svg>
                        ),
                      },
                      {
                        title: "شهادة الثانوية العامة",
                        desc: "الأصل أو صورة مصدّقة",
                        icon: (
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8" r="3"/>
                            <path d="M20 21a8 8 0 10-16 0"/>
                            <path d="M12 11v4M10 15h4"/>
                          </svg>
                        ),
                      },
                      {
                        title: "وصف المقررات الدراسية",
                        desc: "لجميع المقررات المدروسة",
                        icon: (
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
                            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
                          </svg>
                        ),
                      },
                      {
                        title: "خطاب القبول السابق",
                        desc: "من عمادة القبول والتسجيل",
                        icon: (
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                          </svg>
                        ),
                      },
                      {
                        title: "خطاب الترشيح",
                        desc: "من الجامعة المحوَّل منها",
                        icon: (
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="8" y1="13" x2="16" y2="13"/>
                            <line x1="8" y1="17" x2="12" y2="17"/>
                          </svg>
                        ),
                      },
                    ].map((d) => (
                      <StaggerItem key={d.title}>
                        <DocCard icon={d.icon} title={d.title} desc={d.desc} />
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              </section>

              {/* ── CALCULATOR ── */}
              <section id="calculator" className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: "#F8FAFC" }}>
                <div className="max-w-2xl mx-auto">
                  <FadeIn className="text-center mb-10">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold mb-5 border" style={{ background: "#EBF5EE", color: "#006C35", borderColor: "#BBF7D0" }}>
                      حاسبة الأهلية
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">هل أنت مؤهل للتحويل؟</h2>
                    <p className="text-gray-500 mt-3 text-sm">أدخل بياناتك للتحقق المبدئي من أهليتك للتقديم</p>
                  </FadeIn>
                  <FadeIn delay={0.1}>
                    <TransferCalculator />
                  </FadeIn>
                </div>
              </section>

              {/* ── FAQ ── */}
              <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-3xl mx-auto">
                  <FadeIn className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">الأسئلة الشائعة</h2>
                    <p className="text-gray-500 mt-3">إجابات لأكثر الأسئلة تكراراً من المتقدمين</p>
                  </FadeIn>
                  <StaggerContainer className="space-y-3" stagger={0.07}>
                    {FAQ_ITEMS.map((f, i) => (
                      <StaggerItem key={i}>
                        <AccordionItem
                          title={f.q} body={f.a}
                          open={openFaq === i}
                          onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        />
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              </section>

              {/* ── SUPPORT ── */}
              <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-5xl mx-auto">
                  <FadeIn className="text-center mb-12">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold mb-5 border" style={{ background: "#EBF5EE", color: "#006C35", borderColor: "#BBF7D0" }}>
                      الدعم
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">هل تحتاج مساعدة؟</h2>
                    <p className="text-gray-500 mt-3 text-sm">فريق الدعم جاهز لمساعدتك في جميع استفساراتك</p>
                  </FadeIn>

                  <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" stagger={0.09}>
                    {[
                      {
                        title: "الدعم الفني",
                        desc: "للمشاكل التقنية في البوابة الإلكترونية",
                        badge: "متاح 24/7",
                        badgeColor: "#006C35",
                        badgeBg: "#EBF5EE",
                        iconBg: "#EBF5EE",
                        iconStroke: "#006C35",
                        icon: (
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#006C35" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 18v-6a9 9 0 0118 0v6"/>
                            <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/>
                          </svg>
                        ),
                      },
                      {
                        title: "القبول والتسجيل",
                        desc: "للاستفسار عن شروط التحويل و��لقبول",
                        badge: "أوقات الدوام",
                        badgeColor: "#006C35",
                        badgeBg: "#EBF5EE",
                        iconBg: "#EBF5EE",
                        iconStroke: "#006C35",
                        icon: (
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#006C35" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/>
                            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                          </svg>
                        ),
                      },
                      {
                        title: "الدليل الإرشادي",
                        desc: "دليل خطوة بخطوة لإكمال التقديم",
                        badge: "متاح الآن",
                        badgeColor: "#B45309",
                        badgeBg: "#FEF9E7",
                        iconBg: "#FEF9E7",
                        iconStroke: "#C9A227",
                        icon: (
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
                            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
                          </svg>
                        ),
                      },
                      {
                        title: "التواصل المباشر",
                        desc: "تحدث مع موظف دعم عبر الدردشة",
                        badge: "دردشة مباشرة",
                        badgeColor: "#006C35",
                        badgeBg: "#EBF5EE",
                        iconBg: "#EBF5EE",
                        iconStroke: "#006C35",
                        icon: (
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#006C35" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                          </svg>
                        ),
                      },
                    ].map((s) => (
                      <StaggerItem key={s.title}>
                        <motion.div
                          whileHover={{ y: -5, boxShadow: "0 12px 32px rgba(0,108,53,0.10)" }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                          className="bg-white rounded-2xl p-6 border cursor-pointer"
                          style={{ borderColor: "#E5E7EB" }}
                        >
                          {/* Icon */}
                          <motion.div
                            whileHover={{ scale: 1.08 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            className="w-13 h-13 w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                            style={{ background: s.iconBg }}
                          >
                            {s.icon}
                          </motion.div>

                          {/* Status badge */}
                          <div className="mb-3">
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                              style={{ background: s.badgeBg, color: s.badgeColor }}
                            >
                              {s.badge}
                            </span>
                          </div>

                          {/* Text */}
                          <h3 className="font-bold text-gray-800 text-base mb-1.5">{s.title}</h3>
                          <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                        </motion.div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              </section>

              {/* ── FOOTER ── */}
              {/* dir="ltr" overrides inherited RTL — the Figma export uses LTR flex with RTL text internally */}
              <footer dir="ltr" className="w-full overflow-hidden" style={{ height: 493 }}>
                <FooterFrame />
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
