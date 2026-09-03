import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import mockData from "./mockData.js";

/* -------------------------------------------------------------------------- */
/* Lightbox                                                                    */
/* -------------------------------------------------------------------------- */

const LightboxContext = createContext(null);

function LightboxProvider({ children }) {
  const [src, setSrc] = useState(null);

  const open = useCallback((s) => setSrc(s), []);
  const close = useCallback(() => setSrc(null), []);

  useEffect(() => {
    if (!src) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [src, close]);

  return (
    <LightboxContext.Provider value={{ open, close }}>
      {children}
      {src && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 fade-in"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={close}
        >
          <button
            onClick={close}
            className="absolute top-5 right-6 text-4xl leading-none text-white/80 hover:text-white cursor-pointer"
            aria-label="Đóng"
          >
            &times;
          </button>
          <img
            src={src}
            alt=""
            className="max-h-[90vh] max-w-[92vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </LightboxContext.Provider>
  );
}

function useLightbox() {
  return useContext(LightboxContext);
}

/* -------------------------------------------------------------------------- */
/* Img - tự dò đuôi ảnh, placeholder khi không có ảnh thật                     */
/* -------------------------------------------------------------------------- */

const EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif", "gif"];

function Img({ src, alt = "", className = "", zoomable = false, ...rest }) {
  const [extIndex, setExtIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const lightbox = useLightbox();

  useEffect(() => {
    setExtIndex(0);
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-brand/5 text-brand/40 text-sm font-medium text-center px-4 ${className}`}
      >
        Hình ảnh đang cập nhật
      </div>
    );
  }

  const resolvedSrc = `${src}.${EXTENSIONS[extIndex]}`;

  const handleError = () => {
    if (extIndex < EXTENSIONS.length - 1) {
      setExtIndex((i) => i + 1);
    } else {
      setFailed(true);
    }
  };

  const handleClick = () => {
    if (zoomable && lightbox) lightbox.open(resolvedSrc);
  };

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      onError={handleError}
      onClick={zoomable ? handleClick : undefined}
      className={`${className} ${zoomable ? "cursor-zoom-in" : ""}`}
      {...rest}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Particles                                                                   */
/* -------------------------------------------------------------------------- */

function Particles({ count = 130 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width, height, dpr;
    let particles = [];
    let raf;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const init = () => {
      particles = Array.from({ length: count }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.6 + 0.4,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15,
        alpha: Math.random() * 0.5 + 0.2,
      }));
    };

    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(tick);
    };

    resize();
    init();
    tick();

    const ro = new ResizeObserver(() => {
      resize();
      init();
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [count]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* -------------------------------------------------------------------------- */
/* Shared bits                                                                 */
/* -------------------------------------------------------------------------- */

const longTextStyle = { fontSize: "1.0625rem", lineHeight: 1.75 };

function SectionHeading({ eyebrow, title, center = true, dark = false }) {
  return (
    <div className={`${center ? "text-center" : ""} mb-10 animate-fade-up`}>
      {eyebrow && (
        <p
          className={`text-xs md:text-sm font-semibold uppercase tracking-[0.3em] mb-3 ${
            dark ? "text-gold" : "text-gold-dark"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`font-serif text-3xl md:text-4xl font-bold ${
          dark ? "text-white" : "text-brand"
        }`}
      >
        {title}
      </h2>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Header                                                                      */
/* -------------------------------------------------------------------------- */

const NAV_ITEMS = [
  { href: "#intro", label: "Giới thiệu" },
  { href: "#project-info", label: "Tổng quan" },
  { href: "#location", label: "Vị trí" },
  { href: "#amenities", label: "Tiện ích" },
  { href: "#pricing", label: "Giá bán" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Liên hệ" },
];

function Header({ data, onOpenPopup }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  const [hoverStyle, setHoverStyle] = useState({ opacity: 0 });
  const navRef = useRef(null);

  const handleLinkMouseEnter = (e) => {
    if (!navRef.current) return;
    const linkRect = e.currentTarget.getBoundingClientRect();
    const navRect = navRef.current.getBoundingClientRect();
    setHoverStyle({
      opacity: 1,
      left: linkRect.left - navRect.left,
      width: linkRect.width,
    });
  };

  const handleNavMouseLeave = () => setHoverStyle((s) => ({ ...s, opacity: 0 }));

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 80);

      if (y > lastScrollY.current && y > 200) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      } ${hidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        <a href="#" className="flex items-center">
          <Img
            src={data.logo}
            alt={data.name}
            className={`h-16 w-auto object-contain transition-opacity duration-300 ${
              scrolled ? "opacity-100" : "opacity-0"
            }`}
          />
        </a>

        <nav
          ref={navRef}
          onMouseLeave={handleNavMouseLeave}
          className="relative hidden lg:flex items-center gap-6"
        >
          <div
            className="absolute top-0 h-full rounded-full bg-brand/10 opacity-0 transition-[width,left,opacity] duration-300 pointer-events-none"
            style={hoverStyle}
          />
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onMouseEnter={handleLinkMouseEnter}
              className={`relative z-10 px-3 py-2 text-sm font-medium transition-colors ${
                scrolled ? "text-brand hover:text-gold" : "text-white hover:text-gold"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={onOpenPopup}
          className={`rounded-full bg-gold hover:bg-gold-dark text-brand text-sm font-semibold px-6 py-2.5 transition-all cursor-pointer ${
            scrolled ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          Nhận báo giá
        </button>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero                                                                        */
/* -------------------------------------------------------------------------- */

function Hero({ data }) {
  const shadowLabel = { textShadow: "0 1px 3px rgba(0,0,0,0.8), 0 2px 12px rgba(0,0,0,0.6)" };
  const shadowH1 = { textShadow: "0 2px 4px rgba(0,0,0,0.8), 0 4px 24px rgba(0,0,0,0.6)" };
  const shadowDesc = { textShadow: "0 1px 3px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.55)" };

  return (
    <section className="relative h-[100svh] min-h-[560px] w-full overflow-hidden">
      <Img src={data.heroImage} alt={data.name} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-brand/55 via-brand/45 to-brand/70" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <p
          style={shadowLabel}
          className="animate-fade-up text-gold uppercase tracking-[0.3em] text-base md:text-xl font-semibold mb-4"
        >
          {data.eyebrow}
        </p>
        <h1 style={shadowH1} className="animate-fade-up text-4xl md:text-6xl font-bold text-white max-w-4xl">
          {data.name}
        </h1>
        <p style={shadowDesc} className="animate-fade-up text-white/90 mt-5 max-w-2xl text-base md:text-lg">
          {data.shortDescription}
        </p>

        <div className="animate-fade-up flex flex-wrap justify-center gap-3 mt-8">
          {data.badges.map((b) => (
            <div
              key={b.label}
              className="bg-black/25 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 text-left"
            >
              <p className="text-gold text-xs font-semibold uppercase tracking-wide">{b.label}</p>
              <p className="text-white font-bold">{b.value}</p>
            </div>
          ))}
        </div>

        <a
          href="#lead-1"
          className="animate-fade-up mt-10 rounded-full bg-gold hover:bg-gold-dark text-brand text-base md:text-lg font-bold px-8 py-3.5 transition-colors"
        >
          Nhận báo giá & chính sách bán hàng
        </a>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Intro                                                                       */
/* -------------------------------------------------------------------------- */

function Intro({ data }) {
  return (
    <section id="intro" className="bg-white py-20 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="relative rounded-3xl bg-brand p-10 md:p-16 animate-fade-up">
          <div className="absolute -top-6 left-10 w-14 h-14 rounded-2xl bg-gold flex items-center justify-center -rotate-[15deg] shadow-lg">
            <i className="fa-solid fa-leaf text-brand text-2xl" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mt-6 mb-6">
            {data.name}
          </h2>
          <div className="space-y-5">
            {data.longDescription.map((p, i) => (
              <p key={i} style={longTextStyle} className="text-white/75 text-justify">
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* ProjectInfo                                                                 */
/* -------------------------------------------------------------------------- */

function ProjectInfo({ data }) {
  return (
    <section id="project-info" className="bg-white py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <SectionHeading eyebrow="Tổng quan" title={data.infoTitle} />
        <div className="grid md:grid-cols-2 gap-10 items-stretch">
          <div className="rounded-2xl overflow-hidden border border-brand/10 animate-fade-up">
            {data.info.map((row, i) => (
              <div
                key={row.label}
                className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-5 py-4 ${
                  i % 2 === 0 ? "bg-brand/5" : "bg-white"
                }`}
              >
                <p className="sm:w-2/5 text-sm font-semibold text-brand/70">{row.label}</p>
                <div className="sm:w-3/5 text-sm font-medium text-brand">
                  {row.value.split(" · ").map((part, pi) => (
                    <p key={pi}>{part}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="h-full grid grid-cols-2 content-center gap-6 animate-fade-up justify-items-center">
            {data.highlights.map((h) => (
              <div
                key={h.label}
                className="group aspect-square w-full max-w-[250px] rounded-full border-2 border-gold bg-brand flex flex-col items-center justify-center text-center p-4 transition-all duration-300 hover:bg-gold hover:scale-105 hover:shadow-xl cursor-default"
              >
                <p className="text-gold text-xs font-semibold uppercase tracking-wide group-hover:text-brand transition-colors">
                  {h.label}
                </p>
                <p className="text-white font-serif text-xl md:text-2xl font-bold mt-1 group-hover:text-brand transition-colors">
                  {h.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* SalesPolicy                                                                 */
/* -------------------------------------------------------------------------- */

function SalesPolicy({ data }) {
  return (
    <section className="bg-brand/[0.03] py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <SectionHeading title={data.title} />
        <div className="grid md:grid-cols-3 gap-6">
          {data.items.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-8 text-center shadow-sm animate-fade-up flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-full bg-brand border-2 border-gold flex items-center justify-center mb-4">
                <i className="fa-solid fa-check text-gold text-xl" />
              </div>
              <p className="text-brand font-semibold">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* LeadForm                                                                    */
/* -------------------------------------------------------------------------- */

function LeadForm({ compact = false }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState("idle");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Vui lòng nhập họ tên";
    if (!/^\d{9,11}$/.test(phone.trim())) nextErrors.phone = "Số điện thoại không hợp lệ";
    if (!agree) nextErrors.agree = "Vui lòng đồng ý điều khoản";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("loading");
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: mockData.name,
          createdAt: new Date().toISOString(),
          name,
          phone,
          source: window.location.href,
        }),
      });
    } catch (err) {
      // nuốt lỗi network
    }

    if (typeof window.fbq === "function") {
      window.fbq("track", "Lead");
    }

    setStatus("success");
    setTimeout(() => {
      setStatus("idle");
      setName("");
      setPhone("");
      setAgree(false);
    }, 5000);
  };

  if (status === "success") {
    return (
      <div className="text-center py-10">
        <p className="font-serif text-xl font-bold text-brand">Cảm ơn quý khách!</p>
        <p className="text-brand/70 text-sm mt-1">
          Chuyên viên tư vấn sẽ liên hệ với bạn trong thời gian sớm nhất.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Họ và tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3.5 rounded-lg border border-gray-200 bg-white text-gray-800 text-base outline-none focus:border-gold"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>
      <div>
        <input
          type="tel"
          placeholder="Số điện thoại"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-3.5 rounded-lg border border-gray-200 bg-white text-gray-800 text-base outline-none focus:border-gold"
        />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <span
            onClick={(e) => {
              e.preventDefault();
              setAgree((a) => !a);
            }}
            className={`mt-0.5 w-4 h-4 rounded shrink-0 flex items-center justify-center border ${
              agree ? "bg-gold border-gold" : "border-gray-300"
            }`}
          >
            {agree && (
              <svg viewBox="0 0 16 16" className="w-3 h-3 fill-none stroke-white stroke-[2.5]">
                <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span className="text-xs text-brand/60 leading-snug">
            Tôi đồng ý với{" "}
            <a href="/chinh-sach-bao-mat.html" className="text-gold-dark underline">
              Chính sách bảo mật
            </a>{" "}
            của Palm River.
          </span>
        </label>
        {errors.agree && <p className="text-red-500 text-xs mt-1">{errors.agree}</p>}
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-4 rounded-lg font-bold text-white text-base tracking-wider bg-gold hover:brightness-110 transition cursor-pointer disabled:opacity-70"
      >
        {status === "loading" ? "ĐANG GỬI..." : "NHẬN BÁO GIÁ NGAY"}
      </button>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* LeadFormSection                                                             */
/* -------------------------------------------------------------------------- */

function LeadFormSection({ id, data }) {
  return (
    <section id={id} className="relative bg-brand py-20 px-6 md:px-12 overflow-hidden">
      <Particles />
      <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-up">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">{data.title}</h2>
          <p style={longTextStyle} className="text-white/75 mb-6">{data.subtitle}</p>
          <div>
            <p className="text-gold text-xs font-semibold uppercase tracking-wide flex items-center gap-2">
              <i className="fa-solid fa-phone text-lg" />
              Hotline
            </p>
            <a href={`tel:${data.hotline.replace(/\s/g, "")}`} className="text-white font-serif text-2xl font-bold">
              {data.hotline}
            </a>
            <p className="text-white/50 text-xs mt-1">{data.note}</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl animate-fade-up">
          <LeadForm />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Location                                                                    */
/* -------------------------------------------------------------------------- */

function Location({ data }) {
  return (
    <section id="location" className="bg-white py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-up">
          <SectionHeading eyebrow="Vị trí" title={data.title} center={false} />
          <div className="space-y-4">
            {data.paragraphs.map((p, i) => (
              <p key={i} style={longTextStyle} className="text-brand/70">
                {p}
              </p>
            ))}
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-lg animate-fade-up">
          <Img src={data.image} zoomable className="w-full aspect-4/3 object-cover" />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Connectivity                                                                */
/* -------------------------------------------------------------------------- */

function Connectivity({ data }) {
  return (
    <section className="bg-gradient-to-b from-[#eaf3ec] via-[#f4f8f4] to-white py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <SectionHeading eyebrow="Kết nối" title={data.title} />
        <div className="grid md:grid-cols-3 gap-6">
          {data.items.map((item, i) => (
            <div
              key={item.title}
              className="relative bg-white rounded-2xl p-8 pt-10 shadow-sm animate-fade-up"
            >
              <div className="absolute -top-5 left-8 w-11 h-11 rounded-full bg-brand text-gold text-xl leading-none font-serif font-bold flex items-center justify-center shadow-md">
                {i + 1}
              </div>
              <h3 className="font-serif text-lg font-bold text-brand mb-3">{item.title}</h3>
              {item.paragraphs?.map((p, pi) => (
                <p key={pi} className="text-sm text-brand/65 leading-relaxed mb-3">
                  {p}
                </p>
              ))}
              {item.bullets && (
                <ul className="space-y-2 mb-3">
                  {item.bullets.map((b, bi) => (
                    <li key={bi} className="flex items-start gap-2 text-sm text-brand/70">
                      <i className="fa-solid fa-circle-check text-gold-dark mt-0.5 text-xs" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {item.footer && (
                <p className="text-sm text-brand/70 font-semibold leading-relaxed mt-3">
                  {item.footer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Differences                                                                 */
/* -------------------------------------------------------------------------- */

function Differences({ data }) {
  return (
    <section className="bg-gradient-to-b from-[#eaf3ec] via-[#f4f8f4] to-white py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <SectionHeading title={data.title} />
        <div className="grid md:grid-cols-3 gap-8 mt-14">
          {data.items.map((item, i) => (
            <div key={item.title} className="relative bg-white rounded-2xl p-8 pt-12 text-center shadow-sm animate-fade-up">
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-gold text-brand font-serif text-xl font-bold flex items-center justify-center shadow-lg border-4 border-white">
                {i + 1}
              </div>
              <h3 className="font-serif text-lg font-bold text-brand mb-3">{item.title}</h3>
              <p className="text-brand/65 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Amenities - carousel tự động                                               */
/* -------------------------------------------------------------------------- */

function Amenities({ data }) {
  const images = data.images;
  const total = images.length;
  const visibleCount = 3;
  const [rawIndex, setRawIndex] = useState(0);
  const [transitionOn, setTransitionOn] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || total <= visibleCount) return;
    const t = setInterval(() => setRawIndex((i) => i + 1), 4000);
    return () => clearInterval(t);
  }, [paused, total]);

  useEffect(() => {
    if (rawIndex !== total) return;
    const t = setTimeout(() => {
      setTransitionOn(false);
      setRawIndex(0);
    }, 700);
    return () => clearTimeout(t);
  }, [rawIndex, total]);

  useEffect(() => {
    if (transitionOn) return;
    const raf = requestAnimationFrame(() => setTransitionOn(true));
    return () => cancelAnimationFrame(raf);
  }, [transitionOn]);

  const activeDot = rawIndex % total;
  const slideWidth = 100 / visibleCount;

  return (
    <section id="amenities" className="bg-white py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <SectionHeading eyebrow="Tiện ích" title={data.title} />
        <div className="max-w-3xl mx-auto text-center mb-12 -mt-4">
          {data.paragraphs.map((p, i) => (
            <p key={i} style={longTextStyle} className="text-brand/65">
              {p}
            </p>
          ))}
        </div>

        <div
          className="overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className={`flex ${transitionOn ? "transition-transform duration-700 ease-in-out" : ""}`}
            style={{ transform: `translateX(-${rawIndex * slideWidth}%)` }}
          >
            {images.concat(images.slice(0, visibleCount)).map((img, i) => (
              <div key={`${img.src}-${i}`} className="shrink-0 px-2.5" style={{ width: `${slideWidth}%` }}>
                <div className="group flex flex-col gap-2">
                  <div className="overflow-hidden rounded-xl shadow-sm">
                    <Img
                      src={img.src}
                      zoomable
                      className="w-full aspect-4/3 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <p className="text-center text-sm font-medium text-brand/70">{img.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {total > visibleCount && (
          <div className="flex justify-center gap-2 mt-6">
            {images.slice(0, total - visibleCount + 1).map((img, i) => (
              <button
                key={img.src}
                onClick={() => {
                  setTransitionOn(true);
                  setRawIndex(i);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === activeDot ? "w-8 bg-gold" : "w-2 bg-brand/20"
                }`}
                aria-label={`Xem tiện ích ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* FloorPlan                                                                   */
/* -------------------------------------------------------------------------- */

function FloorPlan({ data }) {
  return (
    <section className="bg-brand/[0.03] py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1 rounded-2xl overflow-hidden shadow-lg animate-fade-up">
          <Img src={data.image} zoomable className="w-full aspect-4/3 object-cover" />
        </div>
        <div className="order-1 md:order-2 animate-fade-up">
          <SectionHeading title={data.title} center={false} />
          <div className="space-y-4">
            {data.paragraphs.map((p, i) => (
              <p key={i} style={longTextStyle} className="text-brand/70">
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* PerspectiveShowcase                                                         */
/* -------------------------------------------------------------------------- */

function PerspectiveShowcase({ data }) {
  const [index, setIndex] = useState(0);
  const total = data.images.length;

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  const current = data.images[index];

  return (
    <section className="bg-white py-20 px-6 md:px-0">
      <div className="max-w-6xl mx-auto px-6 md:px-6">
        <SectionHeading eyebrow="Phối cảnh" title={data.title} />
        <p className="text-center text-brand/60 max-w-2xl mx-auto -mt-6 mb-10">{data.subtitle}</p>
      </div>

      <div className="relative w-full">
        <div className="relative w-full aspect-video md:aspect-21/9 overflow-hidden md:rounded-2xl max-w-6xl mx-auto">
          <Img src={current.src} zoomable className="w-full h-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-black/40 backdrop-blur-md px-6 py-4">
            <p className="text-white font-medium text-center">{current.caption}</p>
          </div>

          <button
            onClick={prev}
            aria-label="Ảnh trước"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center cursor-pointer transition"
          >
            <i className="fa-solid fa-chevron-left text-brand" />
          </button>
          <button
            onClick={next}
            aria-label="Ảnh sau"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center cursor-pointer transition"
          >
            <i className="fa-solid fa-chevron-right text-brand" />
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {data.images.map((img, i) => (
            <button
              key={img.src}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                i === index ? "w-8 bg-gold" : "w-2 bg-brand/20"
              }`}
              aria-label={`Xem phối cảnh ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Design                                                                      */
/* -------------------------------------------------------------------------- */

function Design({ data }) {
  return (
    <section className="bg-white py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <SectionHeading title={data.title} />
        <div className="max-w-3xl mx-auto text-center mb-12 -mt-4 space-y-3">
          {data.paragraphs.map((p, i) => (
            <p key={i} style={longTextStyle} className="text-brand/65">
              {p}
            </p>
          ))}
        </div>
        <div className="rounded-2xl overflow-hidden shadow-lg animate-fade-up">
          <Img src={data.images[0]} zoomable className="w-full aspect-8/3 object-cover" />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* DashedCTA + Pricing                                                         */
/* -------------------------------------------------------------------------- */

function DashedCTA({ children, onClick }) {
  return (
    <div className="relative block w-full">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <rect
          x="2.5"
          y="2.5"
          width="calc(100% - 5px)"
          height="calc(100% - 5px)"
          rx="9"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.85"
          strokeWidth="1.5"
          strokeDasharray="5 4"
          className="marching-ants"
        />
      </svg>
      <button
        type="button"
        onClick={onClick}
        style={{ backgroundColor: "var(--color-gold)" }}
        className="relative block w-full text-center rounded-xl py-3 mt-2 text-sm font-semibold text-white hover:brightness-110 transition cursor-pointer"
      >
        {children}
      </button>
    </div>
  );
}

const GRID_COLS_LG = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

function Pricing({ data, onOpenPopup }) {
  const lgCols = GRID_COLS_LG[Math.min(data.units.length, 4)] || "lg:grid-cols-4";
  return (
    <section id="pricing" className="bg-brand/[0.03] py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <SectionHeading title={data.title} />
        <div className={`grid gap-5 sm:grid-cols-2 ${lgCols} max-w-5xl mx-auto`}>
          {data.units.map((u) => (
            <div key={u.type} className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col animate-fade-up">
              <Img src={u.image} className="w-full aspect-4/3 object-cover" />
              <div className="bg-brand text-center py-2.5">
                <p className="text-white font-serif text-base font-bold">{u.type}</p>
              </div>
              <div className="p-4 flex flex-col gap-2 grow">
                <div className="flex justify-between text-sm">
                  <span className="text-brand/60">Diện tích</span>
                  <span className="font-semibold text-brand">{u.area}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand/60">Giá bán</span>
                  <span className="font-semibold text-brand">{u.price}</span>
                </div>
                <div className="mt-auto pt-3">
                  <DashedCTA onClick={onOpenPopup}>Nhận báo giá chi tiết</DashedCTA>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-brand/50 mt-8 max-w-2xl mx-auto">{data.note}</p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* ProductTypes                                                                */
/* -------------------------------------------------------------------------- */

function ProductTypes({ data }) {
  return (
    <section className="bg-white">
      <div className="py-20 px-6 md:px-12 max-w-6xl mx-auto">
        <SectionHeading title={data.title} />
        <p style={longTextStyle} className="text-center text-brand/65 max-w-2xl mx-auto -mt-4">
          {data.intro}
        </p>
      </div>

      {data.items.map((item, i) => {
        const dark = i % 2 === 1;
        const imageFirst = i % 2 === 1;
        return (
          <div key={item.title} className={`${dark ? "bg-brand" : "bg-white"} py-16 px-6 md:px-12`}>
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              <div className={imageFirst ? "md:order-2" : ""}>
                <div className="rounded-2xl overflow-hidden shadow-lg animate-fade-up">
                  <Img src={item.image} zoomable className="w-full aspect-4/3 object-cover" />
                </div>
              </div>
              <div className={imageFirst ? "md:order-1" : ""}>
                <h3
                  className={`font-serif text-2xl md:text-3xl font-bold mb-4 ${
                    dark ? "text-white" : "text-brand"
                  }`}
                >
                  {item.title}
                </h3>
                <p style={longTextStyle} className={`mb-6 ${dark ? "text-white/70" : "text-brand/70"}`}>
                  {item.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {item.specs.map((s) => (
                    <div key={s.label}>
                      <p className={`text-sm uppercase tracking-wide ${dark ? "text-gold" : "text-gold-dark"}`}>
                        {s.label}
                      </p>
                      <p className={`text-sm font-semibold ${dark ? "text-white" : "text-brand"}`}>{s.value}</p>
                    </div>
                  ))}
                </div>
                <a
                  href="#lead-2"
                  className="inline-block rounded-full bg-gold hover:bg-gold-dark text-brand font-bold px-7 py-3 transition-colors"
                >
                  {item.ctaLabel}
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Reasons                                                                     */
/* -------------------------------------------------------------------------- */

function Reasons({ data }) {
  return (
    <section className="bg-white py-20 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <SectionHeading title={data.title} />
        <div className="space-y-8">
          {data.items.map((item, i) => (
            <div key={item.title} className="flex gap-5 animate-fade-up">
              <div className="shrink-0 w-10 h-10 rounded-full bg-gold text-brand font-serif font-bold flex items-center justify-center">
                {i + 1}
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-brand mb-1">{item.title}</h3>
                <p style={longTextStyle} className="text-brand/65">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Buyers                                                                      */
/* -------------------------------------------------------------------------- */

function Buyers({ data }) {
  return (
    <section className="bg-gradient-to-b from-[#eaf3ec] to-white py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <SectionHeading title={data.title} />
        <div className="grid md:grid-cols-3 gap-6">
          {data.items.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-xl p-7 border-t-4 border-gold shadow-sm animate-fade-up"
            >
              <h3 className="font-serif text-lg font-bold text-brand mb-2">{item.title}</h3>
              <p className="text-brand/65 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* FAQ                                                                         */
/* -------------------------------------------------------------------------- */

function FAQ({ data }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="bg-white py-20 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        <SectionHeading title={data.title} />
        <div className="space-y-4">
          {data.items.map((item, i) => {
            const open = openIndex === i;
            return (
              <div
                key={item.question}
                className={`rounded-xl border transition-colors ${
                  open ? "border-gold" : "border-brand/10"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left cursor-pointer"
                >
                  <span className="font-semibold text-brand">{item.question}</span>
                  <i
                    className={`fa-solid fa-chevron-down text-gold-dark transition-transform duration-300 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div className={`accordion-content ${open ? "open" : ""}`}>
                  <div className="accordion-inner">
                    <p style={longTextStyle} className="px-6 pb-5 text-brand/65">{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Consultant                                                                  */
/* -------------------------------------------------------------------------- */

function Consultant({ data }) {
  return (
    <section className="bg-[#f5f3ef] py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 animate-fade-up">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand uppercase">{data.title}</h2>
          <div className="w-16 h-1 bg-gold rounded-full mx-auto mt-5" />
        </div>

        <div className="grid md:grid-cols-[420px_1fr] gap-12 items-start">
          <div className="rounded-2xl overflow-hidden shadow-lg aspect-4/5 animate-fade-up">
            <Img src={data.image} className="w-full h-full object-cover" />
          </div>
          <div className="animate-fade-up">
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-brand mb-1">{data.name}</h3>
            <p className="text-gold-dark uppercase text-sm font-semibold tracking-wide mb-6">{data.role}</p>
            <div className="space-y-4 mb-8">
              {data.description.map((p, i) => (
                <p key={i} style={longTextStyle} className="text-brand/70">
                  {p}
                </p>
              ))}
            </div>
            <a
              href={`tel:${data.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-3 rounded-full bg-brand text-white px-6 py-3.5 font-semibold hover:bg-brand-light transition-colors"
            >
              <i className="fa-solid fa-phone text-gold" />
              Gọi tư vấn: {data.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Footer                                                                      */
/* -------------------------------------------------------------------------- */

function Footer({ data, logoGroup }) {
  return (
    <footer className="bg-white pt-16 pb-8 px-6 md:px-12 border-t border-brand/10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8 items-start md:items-center">
        <div className="flex items-center gap-4">
          <Img src={logoGroup} alt={data.company} className="h-14 w-auto object-contain" />
          <div>
            <p className="font-semibold text-brand">{data.company}</p>
            <p className="text-brand/60 text-sm max-w-xs">{data.address}</p>
          </div>
        </div>

        <div className="text-left md:text-right">
          <p className="text-brand/60 text-sm">Hotline</p>
          <a href={`tel:${data.hotline.replace(/\s/g, "")}`} className="text-gold-dark font-bold text-lg">
            {data.hotline}
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto border-t border-brand/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
        <p className="text-brand/50 text-xs">{data.copyright}</p>
        <div className="flex gap-5 text-xs">
          <a href="/chinh-sach-bao-mat.html" className="text-brand/50 hover:text-gold-dark">
            Chính sách bảo mật
          </a>
          <a href="/dieu-khoan.html" className="text-brand/50 hover:text-gold-dark">
            Điều khoản sử dụng
          </a>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/* FloatingCTAs                                                                */
/* -------------------------------------------------------------------------- */

function ZaloIcon({ className }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <circle cx="24" cy="24" r="24" fill="#0068ff" />
      <path
        fill="#fff"
        d="M24 10c-7.7 0-14 5.6-14 12.5 0 4 2.1 7.6 5.5 9.9-.2 1.3-.9 3.3-2.6 5.3 2.6-.5 5-1.7 6.8-3 1.4.4 2.8.6 4.3.6 7.7 0 14-5.6 14-12.5S31.7 10 24 10Z"
      />
    </svg>
  );
}

function FloatingCTAs({ zalo, onOpenPopup }) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className="fixed bottom-4 left-4 z-40 w-[calc(100%-2rem)] max-w-sm">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label="Mở rộng"
          className="h-7 w-12 rounded-full bg-black/35 hover:bg-black/50 backdrop-blur-md ring-1 ring-white/30 flex items-center justify-center cursor-pointer transition-colors"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-white stroke-[2.5]">
            <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 w-[calc(100%-2rem)] max-w-sm">
      <div className="relative rounded-3xl bg-white/20 backdrop-blur-md ring-1 ring-white/30 shadow-xl p-3 pt-5 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          aria-label="Thu gọn"
          className="absolute -top-3 left-1/2 -translate-x-1/2 h-7 w-12 rounded-full bg-black/35 hover:bg-black/50 backdrop-blur-md ring-1 ring-white/30 flex items-center justify-center cursor-pointer transition-colors"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-white stroke-[2.5]">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <a
          href={zalo}
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-5 rounded-full text-base font-bold text-white shadow-lg shadow-black/30 hover:brightness-110 transition"
          style={{ backgroundColor: "#0068ff" }}
        >
          <ZaloIcon className="h-6 w-6" />
          TƯ VẤN QUA ZALO VỚI CEO
        </a>

        <button
          type="button"
          onClick={onOpenPopup}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-5 rounded-full text-base font-bold text-white shadow-lg shadow-black/30 hover:brightness-110 transition cursor-pointer"
          style={{ backgroundColor: "#e11d2a" }}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-white stroke-2">
            <path
              d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M14 2v5h5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 13h8M8 17h5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          TẢI GIỎ HÀNG ĐỘC QUYỀN ĐỢT 1
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ZaloButton                                                                  */
/* -------------------------------------------------------------------------- */

function ZaloButton({ zalo }) {
  return (
    <a
      href={zalo}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat Zalo"
      className="fixed bottom-4 right-4 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
      style={{ backgroundColor: "#0068ff" }}
    >
      <span className="absolute inset-0 rounded-full bg-[#0068ff] zalo-wave-1" />
      <span className="absolute inset-0 rounded-full bg-[#0068ff] zalo-wave-2" />
      <i className="fa-solid fa-comment-dots text-white text-2xl relative z-10" />
    </a>
  );
}

/* -------------------------------------------------------------------------- */
/* PopupForm                                                                   */
/* -------------------------------------------------------------------------- */

function PopupForm({ data, visible, onOpen, onClose }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState("idle");
  const [errors, setErrors] = useState({});
  const hasInteracted = useRef(false);

  useEffect(() => {
    const markInteracted = () => {
      hasInteracted.current = true;
    };
    window.addEventListener("scroll", markInteracted, { once: true, passive: true });
    window.addEventListener("click", markInteracted, { once: true });

    const t = setTimeout(() => {
      onOpen();
    }, 10000);

    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", markInteracted);
      window.removeEventListener("click", markInteracted);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Vui lòng nhập họ tên";
    if (!/^\d{9,11}$/.test(phone.trim())) nextErrors.phone = "Số điện thoại không hợp lệ";
    if (!agree) nextErrors.agree = "Vui lòng đồng ý điều khoản";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("loading");
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: mockData.name,
          createdAt: new Date().toISOString(),
          name,
          phone,
          source: window.location.href,
        }),
      });
    } catch (err) {
      // nuốt lỗi network
    }

    if (typeof window.fbq === "function") {
      window.fbq("track", "Lead");
    }

    setStatus("success");
    setTimeout(() => {
      setStatus("idle");
      setName("");
      setPhone("");
      setAgree(false);
      onClose();
    }, 5000);
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center px-4 fade-in"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-brand border-2 border-dashed border-white/40 rounded-2xl p-8 md:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-3xl leading-none text-white/70 hover:text-white cursor-pointer"
        >
          &times;
        </button>

        <div className="text-center mb-7">
          <p className="text-white/80 text-sm uppercase tracking-widest">{data.title[0]}</p>
          <p className="font-serif text-white text-2xl md:text-3xl font-bold mt-2">{data.title[1]}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-7">
          {data.cards.map((c) => (
            <div key={c.label} className="rounded-xl p-4 text-center bg-gold">
              <p className="text-xs font-bold text-white/90 uppercase tracking-wide">{c.label}</p>
              <p className="font-serif text-3xl font-bold text-white my-2">{c.value}</p>
              <p className="text-white/80 text-xs">{c.sub}</p>
            </div>
          ))}
        </div>

        {status === "success" ? (
          <div className="text-center text-white py-6">
            <p className="font-serif text-xl font-bold">Cảm ơn quý khách!</p>
            <p className="text-white/80 text-sm mt-1">
              Chuyên viên tư vấn sẽ liên hệ với bạn trong thời gian sớm nhất.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-xl p-6 space-y-4">
            <div>
              <input
                type="text"
                placeholder="Họ và tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-lg border border-gray-200 bg-white text-gray-800 text-base outline-none"
              />
              {errors.name && <p className="text-red-300 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <input
                type="tel"
                placeholder="Số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3.5 rounded-lg border border-gray-200 bg-white text-gray-800 text-base outline-none"
              />
              {errors.phone && <p className="text-red-300 text-xs mt-1">{errors.phone}</p>}
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <span
                onClick={(e) => {
                  e.preventDefault();
                  setAgree((a) => !a);
                }}
                className={`mt-0.5 w-4 h-4 rounded shrink-0 flex items-center justify-center border ${
                  agree ? "bg-gold border-gold" : "border-white/40"
                }`}
              >
                {agree && (
                  <svg viewBox="0 0 16 16" className="w-3 h-3 fill-none stroke-white stroke-[2.5]">
                    <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="text-xs text-white/70 leading-snug">
                Tôi đồng ý với{" "}
                <a href="/chinh-sach-bao-mat.html" className="text-gold underline">
                  Chính sách bảo mật
                </a>{" "}
                của Palm River.
              </span>
            </label>
            {errors.agree && <p className="text-red-300 text-xs -mt-2">{errors.agree}</p>}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-4 rounded-lg font-bold text-white text-base tracking-wider bg-gold hover:brightness-110 transition cursor-pointer disabled:opacity-70"
            >
              {status === "loading" ? "ĐANG GỬI..." : "TÔI MUỐN NHẬN NGAY"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* LandingPage                                                                 */
/* -------------------------------------------------------------------------- */

export default function LandingPage() {
  const data = mockData;
  const [popupVisible, setPopupVisible] = useState(false);
  const openPopup = useCallback(() => setPopupVisible(true), []);
  const closePopup = useCallback(() => setPopupVisible(false), []);

  return (
    <LightboxProvider>
      <Header data={data} onOpenPopup={openPopup} />
      <Hero data={data} />
      <Intro data={data} />
      <ProjectInfo data={data} />
      <SalesPolicy data={data.salesPolicy} />
      <LeadFormSection id="lead-1" data={data.cta} />
      <Location data={data.location} />
      <Connectivity data={data.connectivity} />
      <Differences data={data.differences} />
      <Amenities data={data.amenities} />
      <FloorPlan data={data.floorPlan} />
      <PerspectiveShowcase data={data.perspectiveShowcase} />
      <Design data={data.design} />
      <Pricing data={data.pricing} onOpenPopup={openPopup} />
      <ProductTypes data={data.productTypes} />
      <LeadFormSection id="lead-2" data={data.cta} />
      <Reasons data={data.reasons} />
      <Buyers data={data.buyers} />
      <FAQ data={data.faq} />
      <Consultant data={data.consultant} />
      <LeadFormSection id="contact" data={data.cta} />
      <Footer data={data.footer} logoGroup={data.logoGroup} />
      <FloatingCTAs zalo={data.zalo} onOpenPopup={openPopup} />
      <ZaloButton zalo={data.zalo} />
      <PopupForm data={data.popup} visible={popupVisible} onOpen={openPopup} onClose={closePopup} />
    </LightboxProvider>
  );
}
