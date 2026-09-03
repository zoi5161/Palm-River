# Prompt build landing page Palm River (React + Vite + Tailwind v4)

Bạn hãy build cho tôi một landing page bất động sản bằng **React (Vite) + Tailwind CSS v4**, kiến trúc single-page component, layout/kích thước/bo góc/khoảng cách/animation **giữ nguyên y hệt** một landing page mẫu tôi đã có (dự án khác), chỉ đổi màu sắc, nội dung text và hình ảnh cho dự án **Palm River**. Dưới đây là toàn bộ đặc tả chi tiết + nội dung thật của Palm River.

## 1. Stack & cấu trúc thư mục

```
project-root/
├── index.html
├── package.json
├── vite.config.js
├── netlify.toml
├── .gitignore              # PHẢI có, chặn node_modules/ và dist/ ngay từ đầu
├── netlify/functions/lead.js
├── public/
│   ├── favicon.svg (không bắt buộc nếu dùng logo.png làm favicon)
│   ├── icons.svg
│   ├── sitemap.xml
│   ├── chinh-sach-bao-mat.html
│   ├── dieu-khoan.html
│   └── images/
│       ├── logo.png            # logo đầy đủ Palm River (dùng cho navbar + footer)
│       ├── logo-web.png        # bản vuông chỉ icon, dùng làm favicon (crop riêng từ logo, KHÔNG dùng nguyên logo dọc - xem mục 11)
│       ├── hero.jpg
│       ├── vi-tri.jpg
│       ├── mat-bang.jpg
│       ├── tien-ich-1.jpg ... tien-ich-9.jpg
│       ├── phoi-canh-1.jpg ... phoi-canh-4.jpg
│       ├── thiet-ke-1.jpg
│       ├── thiet-ke-2.jpg
│       ├── anh-render-studio.jpg
│       ├── anh-render-1pn.jpg
│       ├── anh-render-2pn.jpg
│       ├── anh-render-2pn-dac-biet.jpg
│       └── tu-van.jpg
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── mockData.js
    └── LandingPage.jsx
```

## 2. Font & theme màu (Tailwind v4, khai báo trong `index.css`)

```css
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");
@import "tailwindcss";

@theme {
  --color-brand: #1c3a2e;       /* xanh rêu đậm - lấy từ logo Palm River (nền section tối, nút, tiêu đề) */
  --color-brand-light: #2f5443; /* biến thể sáng hơn của brand */
  --color-gold: #c9a24b;        /* vàng đồng/gold - accent, nút CTA, gạch chân, số thứ tự (đồng bộ với chữ vàng trong logo/leaflet) */
  --color-gold-dark: #a9822f;   /* biến thể đậm hơn của accent */

  --font-sans: "Plus Jakarta Sans", system-ui, "Segoe UI", Roboto, sans-serif;
  --font-serif: "Playfair Display", Georgia, "Times New Roman", serif;
}
```

**Về màu sắc**: Logo Palm River dùng tông **xanh rêu đậm (forest green) + chữ trắng/kem**, còn logo Palm City (dự án mẹ) dùng xanh rêu + vàng đồng. Dùng `brand = xanh rêu đậm` (khoảng `#1c3a2e` - có thể tinh chỉnh dựa theo đúng mã màu logo bạn có trong tay) làm màu chủ đạo, và `gold = vàng đồng ấm` làm accent (giữ nguyên vai trò accent giống bản mẫu, vì trong leaflet Palm River các tiêu đề/nút xuất hiện tông be/vàng nhạt trên nền xanh rêu). Nếu bạn có file logo Palm River thật, hãy lấy mã màu chính xác bằng cách sample pixel từ logo trước khi áp dụng vào theme - đừng đoán.

Giữ nguyên toàn bộ animation: `fadeInUp` (`.animate-fade-up`), `fadeIn` (`.fade-in`), `zalo-wave-1`/`zalo-wave-2`, `marching-ants`, `.accordion-content`/`.accordion-inner` (grid-template-rows 0fr→1fr), scroll-behavior smooth, custom scrollbar (track trong suốt, thumb `--color-brand-light` mỏng bo tròn - xem mục 9).

## 3. Component tổng & thứ tự các section (top-down)

**LƯU Ý QUAN TRỌNG**: Bản mẫu gốc có 26 section nhưng qua quá trình chỉnh sửa thực tế đã **bỏ bớt "Progress" (Tiến độ dự án)** vì dự án đang ở giai đoạn chưa có tiến độ thi công thực tế để show. Với Palm River cũng đang giai đoạn tương tự (dự án mới công bố, đầy đủ tiện ích/mặt bằng nhưng chưa có ảnh công trường), nên **bỏ luôn section Progress** khỏi danh sách dưới đây - trừ khi bạn có ảnh công trường thực tế của Palm River thì thêm lại.

Thứ tự render (component `LandingPage`, bọc trong `LightboxProvider`):

1. **Header** - fixed top, trong suốt khi ở đầu trang, chuyển nền trắng + shadow khi scroll > 80px; tự ẩn khi scroll xuống nhanh (> 200px), hiện lại khi scroll lên. Logo chỉ hiện (opacity 0→1) khi đã scroll, kích thước `h-16` (đã phóng to so với bản gốc `h-10`). Menu ngang giữa (desktop `lg:flex`, `gap-6`) với hiệu ứng "pill" nền mờ trượt theo item đang hover - xem cơ chế chi tiết ở mục 4. Nút "Nhận báo giá" bên phải chỉ hiện khi đã scroll, **bấm vào phải MỞ POPUP ưu đãi (PopupForm) chứ không phải scroll xuống form** (dùng chung state `popupVisible` được quản lý ở component gốc `LandingPage`, truyền `onOpenPopup` xuống Header qua props).
2. **Hero** - full-viewport (`h-[100svh] min-h-[560px]`), ảnh nền `object-cover`, overlay gradient `bg-gradient-to-b from-brand/55 via-brand/45 to-brand/70` (đã tinh chỉnh đậm hơn bản đầu để đảm bảo tương phản chữ - ảnh nền sáng thì overlay phải đủ đậm, không để nhạt dưới 40% ở vùng giữa). Toàn bộ text trong Hero dùng **font-sans** (Plus Jakarta Sans), KHÔNG dùng font-serif - kể cả H1 tên dự án. Style chi tiết:
   - Nhãn nhỏ uppercase: `text-gold uppercase tracking-[0.3em] text-base md:text-xl font-semibold`, có `textShadow: "0 1px 3px rgba(0,0,0,0.8), 0 2px 12px rgba(0,0,0,0.6)"` (double-shadow: 1 lớp sát viền đậm + 1 lớp glow lan toả, để chữ tách khỏi nền ảnh sáng).
   - H1: `text-4xl md:text-6xl font-bold text-white max-w-4xl` (không font-serif), `textShadow: "0 2px 4px rgba(0,0,0,0.8), 0 4px 24px rgba(0,0,0,0.6)"`.
   - Mô tả ngắn: `text-white/90 mt-5 max-w-2xl text-base md:text-lg`, `textShadow: "0 1px 3px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.55)"`.
   - 3 badge ngang: nền `bg-black/25 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3`; label `text-gold text-xs font-semibold uppercase tracking-wide`; value `text-white font-bold` (không set size riêng, mặc định text-base).
   - Nút CTA: `rounded-full bg-gold hover:bg-gold-dark text-brand text-base md:text-lg font-bold px-8 py-3.5`.
3. **Intro** - card bo góc lớn `rounded-3xl` nền `bg-brand`, icon lá cây/icon đại diện góc trên trái xoay `-rotate-[15deg]`, tiêu đề tên dự án (font-serif, dùng bình thường ở đây - chỉ Hero là ngoại lệ không dùng serif) + 2 đoạn mô tả dài màu trắng mờ, `text-justify`.
4. **ProjectInfo** ("Thông tin tổng quan dự án") - lưới 2 cột. Cột trái bảng thông tin zebra-stripe. Cột phải: lưới `grid-cols-2` các vòng tròn highlight - dùng `h-full grid grid-cols-2 content-center gap-3` (căn giữa theo chiều cao so với bảng bên trái, gap giảm còn 12px thay vì 20px, để tránh khoảng trống lớn khi bảng bên trái có ít dòng). Mỗi vòng tròn: viền gold, nền brand, hover đổi nền gold + chữ brand + scale nhẹ + shadow.
5. **SalesPolicy** ("CHÍNH SÁCH BÁN HÀNG") - lưới 3 cột card trắng, icon tick tròn nền brand viền gold, text đậm căn giữa.
6. **LeadFormSection** (id="lead-1") - nền brand đặc, Particles canvas (130 hạt trắng bay chậm). Trái: tiêu đề + subtitle + hotline. Phải: LeadForm trong card trắng bo góc lớn.
7. **Location** ("VỊ TRÍ DỰ ÁN") - lưới 2 cột: trái tiêu đề+mô tả, phải ảnh vị trí/map (`aspect-4/3`, zoomable).
8. **Connectivity** ("HẠ TẦNG KẾT NỐI") - nền gradient `from-[#eaf3ec] via-[#f4f8f4] to-white`, các card trắng bo lớn có số thứ tự tròn nổi bên trái.
9. **Differences** ("3 ĐIỂM NỔI BẬT") - cùng nền gradient, lưới 3 cột, số thứ tự tròn nổi phía trên đè lên mép card.
10. **Amenities** ("HỆ TIỆN ÍCH") - **carousel tự động, KHÔNG phải grid tĩnh** (xem mục 5 để biết cơ chế chi tiết).
11. **FloorPlan** ("MẶT BẰNG TỔNG THỂ") - lưới 2 cột đảo thứ tự mobile/desktop, ảnh `aspect-4/3` zoomable.
12. **PerspectiveShowcase** ("PHỐI CẢNH DỰ ÁN") - slider 1 ảnh lớn full-width, caption overlay kính mờ đáy ảnh, nút prev/next tròn nổi 2 bên, dots pill bên dưới.
13. **Design** ("THIẾT KẾ SẢN PHẨM") - tiêu đề + mô tả + lưới 2 ảnh.
14. **Pricing** ("GIÁ BÁN") - lưới cột theo số loại căn hộ (xem mục 6), mỗi loại 1 card: ảnh trên (`aspect-video`), dải tên nền brand, phần thân Diện tích/Giá bán/Thanh toán, nút CTA "Nhận báo giá chi tiết" viền dash động - **style nút xem chi tiết chính xác ở mục 7**.
15. **ProductTypes** ("CÁC LOẠI HÌNH SẢN PHẨM") - tiêu đề+giới thiệu, rồi lặp từng loại căn hộ dạng block full-width, xen kẽ nền brand/trắng, ảnh-text đảo trái-phải theo index. **Quan trọng: block ĐẦU TIÊN (index 0) phải là nền TRẮNG, không phải nền tối** - tức `dark = i % 2 === 1` (không phải `i % 2 === 0`), để đồng bộ ngay sau Intro (đã là nền trắng) mà không bị 2 khối tối liền nhau. Mỗi khối: ảnh lớn zoomable, tiêu đề, mô tả, specs (label:value), nút CTA gold dẫn `#lead-2`.
16. **LeadFormSection** (id="lead-2") - lặp lại section 6.
17. **Reasons** ("LÝ DO NÊN ĐẦU TƯ") - max-w-4xl, danh sách dọc, số tròn nền gold bên trái.
18. **Buyers** ("AI PHÙ HỢP") - nền gradient xanh nhạt, lưới 3 cột `border-t-4 border-gold`.
19. **FAQ** - accordion single-open, viền đổi gold khi mở, chevron xoay 180°, animation grid-template-rows.
20. **Consultant** ("NGƯỜI TƯ VẤN") - lưới 2 cột `md:grid-cols-[470px_1fr]`, ảnh vuông bo lớn `md:-ml-6`, tên (serif to)/chức danh (uppercase gold-dark)/mô tả/nút gọi tròn nền brand.
21. **LeadFormSection** (id="contact") - lặp lại lần 3, trước Footer.
22. **Footer** - nền trắng. Logo bên trái dùng field **riêng `logoGroup`** (không phải logo navbar `logo`) - nếu Palm River có logo tập đoàn/logo phiên bản khác cho footer thì tách riêng field này trong mockData, nếu không có thì trỏ về cùng `logo`. Bên phải chỉ có **Hotline** (đã bỏ hẳn dòng Email - xem mục 8). Dưới cùng border-top + copyright + link Chính sách bảo mật/Điều khoản sử dụng.
23. **FloatingCTAs** - góc dưới trái, style chính xác ở mục 10.
24. **ZaloButton** - góc dưới phải, tròn xanh Zalo `#0068ff`, 2 vòng sóng lan toả.
25. **PopupForm** - modal tự bật sau 10s nếu chưa tương tác, HOẶC mở thủ công qua `onOpenPopup` (từ Header và từ nút "Tải giỏ hàng độc quyền" trong FloatingCTAs). Style chi tiết ở mục 8b.

## 4. Cơ chế hover "pill" trượt theo con trỏ trong nav (Header)

Không dùng CSS `:hover` thuần mà dùng 1 `<div>` pill nền mờ di chuyển bằng JS theo item đang hover:

```jsx
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
```

```jsx
<nav ref={navRef} onMouseLeave={handleNavMouseLeave} className="relative hidden lg:flex items-center gap-6">
  <div
    className="absolute top-0 h-full rounded-full bg-brand/10 opacity-0 transition-[width,left,opacity] duration-300 pointer-events-none"
    style={hoverStyle}
  />
  {navItems.map(item => (
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
```

- Pill: `absolute top-0 h-full rounded-full bg-brand/10`, `transition-[width,left,opacity] duration-300`.
- Link: `px-3 py-2 text-sm font-medium`, KHÔNG có `rounded-full` riêng trên link (bo góc chỉ nằm ở pill).
- Màu chữ đổi theo trạng thái scroll (không đổi theo hover): chưa scroll → `text-white hover:text-gold`; đã scroll → `text-brand hover:text-gold`. Dùng transition-colors mặc định Tailwind (150ms), không khai báo duration riêng cho màu chữ.
- Khi rời `<nav>` (không phải rời từng link) → chỉ set `opacity: 0`, KHÔNG reset lại `left`/`width` (để không bị "trượt ngược" khi ẩn).

## 5. Amenities - carousel tự động (không phải grid tĩnh)

Với N ảnh tiện ích, hiển thị **3 ảnh cùng lúc**, tự động trượt sang trái **từng ảnh một mỗi 4 giây**, dùng **N dots tròn** (bằng đúng số ảnh, không cố định số lượng) - dot active dài ra thành pill màu gold. **Không có nút mũi tên điều hướng.**

Cơ chế kỹ thuật (dùng `rawIndex` tăng liên tục + nhân bản 3 ảnh đầu nối vào cuối mảng để trượt mượt, rồi nhảy tức thời không animation khi hết vòng):

```jsx
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
      {/* ...SectionHeading + paragraphs... */}
      <div className="overflow-hidden" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div
          className={`flex ${transitionOn ? "transition-transform duration-700 ease-in-out" : ""}`}
          style={{ transform: `translateX(-${rawIndex * slideWidth}%)` }}
        >
          {images.concat(images.slice(0, visibleCount)).map((img, i) => (
            <div key={`${img.src}-${i}`} className="shrink-0 px-2.5" style={{ width: `${slideWidth}%` }}>
              <div className="group flex flex-col gap-2">
                <div className="overflow-hidden rounded-xl shadow-sm">
                  <Img src={img.src} zoomable className="w-full aspect-4/3 object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <p className="text-center text-sm font-medium text-brand/70">{img.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {total > visibleCount && (
        <div className="flex justify-center gap-2 mt-6">
          {images.map((img, i) => (
            <button
              key={img.src}
              onClick={() => { setTransitionOn(true); setRawIndex(i); }}
              className={`h-2 rounded-full transition-all ${i === activeDot ? "w-8 bg-gold" : "w-2 bg-brand/20"}`}
              aria-label={`Xem tiện ích ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
```

Tạm dừng tự động khi hover chuột vào carousel (`onMouseEnter`/`onMouseLeave` set `paused`).

## 6. Cấu trúc dữ liệu `mockData.js` - NỘI DUNG THẬT CỦA PALM RIVER

Dưới đây là toàn bộ thông tin thật đã trích xuất từ leaflet PDF "Leaflet Palm River Digital" - dùng trực tiếp, không cần đoán:

```js
const mockData = {
  logo: "/images/logo",
  logoGroup: "/images/logo-group",   // nếu không có logo riêng cho footer, trỏ chung "/images/logo"
  name: "Palm River",
  shortDescription:
    "Chuẩn sống mới bên dòng sông, nơi thiên nhiên và sự thịnh vượng kết hợp hài hoà giữa lòng thành phố.",
  badges: [
    { label: "Vị trí", value: "Ngay giao điểm trung tâm TP.Thủ Đức" },
    { label: "Sở hữu", value: "Lâu dài (áp dụng khách VN)" },
    { label: "Quy mô", value: "4 tòa - 36 tầng nổi" },
  ],
  heroImage: "/images/hero",
  longDescription: [
    "Palm River là dự án căn hộ cao tầng kết hợp thương mại - dịch vụ do Hướng Việt Properties phát triển, tọa lạc tại Phường Bình Trưng, TP.HCM - ngay giao điểm trung tâm kết nối mọi tiện ích một cách nh�anh chóng. Lấy cảm hứng từ biểu tượng của nước, Palm River kiến tạo một phong cách sống an yên nhưng không ngừng chuyển động, nơi mỗi ngày đều mở ra những trải nghiệm mới mẻ và giàu cảm hứng.",
    "Từ những mảng xanh mang đến sự thư thái và tái tạo năng lượng, đến thiết kế lấy cảm hứng từ dòng chảy cùng những không gian sống rộng mở, mỗi góc nhỏ tại Palm River đều được nuôi dưỡng bởi nhịp điệu hài hoà của nước, mang đến nguồn năng lượng tích cực và một chuẩn mực sống vượt trên những điều quen thuộc.",
  ],
  infoTitle: "Thông tin tổng quan dự án",
  info: [
    { label: "Tên dự án", value: "Palm River" },
    { label: "Chủ đầu tư / Phát triển", value: "Hướng Việt Properties" },
    { label: "Vị trí", value: "Phường Bình Trưng, TP. Hồ Chí Minh" },
    { label: "Loại hình dự án", value: "Nhà ở chung cư cao tầng kết hợp thương mại - dịch vụ" },
    { label: "Quy mô dự án", value: "4 tòa tháp · 36 tầng nổi · 2 tầng hầm" },
    { label: "Loại hình căn hộ", value: "Studio · 1PN · 2PN · Duplex · Penthouse · Shophouse" },
    { label: "Hình thức sở hữu", value: "Sở hữu lâu dài (áp dụng khách hàng quốc tịch Việt Nam)" },
    { label: "Đơn vị thiết kế", value: "DPA - DP Architects" },
    { label: "Tổng thầu xây dựng", value: "Dark Horse" },
    { label: "Đơn vị cơ điện", value: "M&E Engineering" },
    { label: "Đơn vị cảnh quan", value: "LJ Group" },
    { label: "Quản lý dự án / vận hành", value: "Core Project Management · Ardor Group" },
  ],
  salesPolicy: {
    title: "CHÍNH SÁCH BÁN HÀNG",
    items: [
      "Sở hữu lâu dài, pháp lý minh bạch ngay từ giai đoạn đầu mở bán",
      "Đa dạng loại hình căn hộ từ Studio đến Penthouse, phù hợp mọi nhu cầu",
      "Vị trí giao điểm trung tâm, kết nối nhanh chóng tới mọi tiện ích thành phố",
    ],
  },
  highlights: [
    { label: "Quy mô", value: "4 tòa tháp" },
    { label: "Tầng nổi", value: "36 tầng" },
    { label: "Tầng hầm", value: "2 tầng" },
    { label: "Diện tích sàn TM", value: "286.000 m²" },
  ],
  cta: {
    title: "ĐĂNG KÝ NHẬN BẢNG GIÁ & CHÍNH SÁCH BÁN HÀNG MỚI NHẤT",
    subtitle: "Để lại thông tin để chuyên viên tư vấn Palm River liên hệ hỗ trợ trong thời gian sớm nhất.",
    hotline: "[ĐIỀN: số hotline thật]",
    note: "Hotline tư vấn 24/7",
  },
  location: {
    title: "VỊ TRÍ DỰ ÁN",
    paragraphs: [
      "Palm River tọa lạc ngay giao điểm trung tâm của khu Đông thành phố, sở hữu hạ tầng giao thông hiện đại, thuận tiện kết nối mọi tiện ích một cách nhanh chóng.",
      "Từ dự án, cư dân chỉ mất 1 phút tới Ga Bình Trưng, 3 phút tới Nút giao An Phú và Đường sắt cao tốc Bắc - Nam, 3 phút tới Cao tốc Long Thành - Dầu Giây, 30 phút tới Sân bay Quốc tế Long Thành.",
    ],
    image: "/images/vi-tri",
  },
  connectivity: {
    title: "HẠ TẦNG KẾT NỐI",
    items: [
      {
        title: "Giao thông thuận tiện mọi hướng",
        paragraphs: [
          "Palm River sở hữu vị trí kết nối vượt trội với hệ thống giao thông trọng điểm khu Đông TP.HCM, rút ngắn thời gian di chuyển tới trung tâm và các đầu mối giao thông lớn.",
        ],
        bullets: [
          "Ga Bình Trưng - 1 phút",
          "Nút giao An Phú - 3 phút",
          "Đường sắt cao tốc Bắc - Nam - 3 phút",
          "Cao tốc Long Thành - Dầu Giây - 3 phút",
          "Cầu Cát Lái, Tuyến Metro Thủ Thiêm - Long Thành - 3 phút",
          "Sân bay Quốc tế Long Thành - 30 phút",
        ],
        footer: "Kết nối nhanh chóng tới trung tâm TP.HCM và các tỉnh lân cận.",
      },
      {
        title: "Tiện ích ngoại khu đầy đủ",
        paragraphs: [
          "Xung quanh Palm River là hệ sinh thái tiện ích cao cấp đã và đang hình thành, đáp ứng đầy đủ nhu cầu sống, học tập, khám chữa bệnh và giải trí của cư dân.",
        ],
        bullets: [
          "Palm Landmark - 1 phút · Khu Liên Hợp TDTT Quốc Gia Rạch Chiếc - 5 phút",
          "Lotte Mall - 8 phút · Thiso Mall - 10 phút · Vincom Mega Mall - 12 phút",
          "Bệnh viện Quốc tế - 1 phút · Bệnh viện Quốc tế AIH - 8 phút",
          "Trường Quốc tế TAS, AIS, Saigon Star, VAS, ISHCMC, BIS, Anne Hill trong bán kính 1-12 phút",
        ],
      },
      {
        title: "Trung tâm tài chính & hành chính lân cận",
        paragraphs: [
          "Palm River chỉ cách Trung tâm Tài chính Thủ Thiêm (IFC) 10 phút, Trung tâm Hành chính TP.HCM 10 phút và Khu trung tâm (Quận 1 cũ) 12 phút di chuyển.",
        ],
        footer: "Vị trí lý tưởng cho cả nhu cầu an cư và công việc tại trung tâm thành phố.",
      },
    ],
  },
  differences: {
    title: "3 ĐIỂM NỔI BẬT",
    items: [
      {
        title: "Giao điểm trung tâm kết nối mọi nơi",
        description: "Tọa lạc tại khu vực phát triển trọng điểm khu Đông thành phố, hạ tầng giao thông hiện đại kết nối nhanh chóng mọi tiện ích.",
      },
      {
        title: "Cảm hứng từ dòng chảy của nước",
        description: "Thiết kế lấy cảm hứng từ biểu tượng của nước, không gian sống rộng mở hòa nhịp cùng dòng sông.",
      },
      {
        title: "Đa dạng loại hình sản phẩm",
        description: "Từ Studio, 1PN, 2PN đến Duplex, Penthouse và Shophouse - đáp ứng mọi nhu cầu an cư và đầu tư.",
      },
    ],
  },
  amenities: {
    title: "HỆ TIỆN ÍCH",
    paragraphs: [
      "Palm River kiến tạo hệ sinh thái tiện ích 2 tầng độc đáo - tiện ích ngoài trời tầng 1 và tiện ích nội khu tầng 2 - mang đến trải nghiệm nghỉ dưỡng ngay tại nhà.",
    ],
    images: [
      { src: "/images/tien-ich-1", caption: "Hồ bơi dài 70m" },
      { src: "/images/tien-ich-2", caption: "Sân Pickleball" },
      { src: "/images/tien-ich-3", caption: "Vườn cảnh quan thác nước" },
      { src: "/images/tien-ich-4", caption: "Khu vui chơi trẻ em" },
      { src: "/images/tien-ich-5", caption: "Thảm Yoga ngoài trời" },
      { src: "/images/tien-ich-6", caption: "Sân chơi cho thú cưng" },
      { src: "/images/tien-ich-7", caption: "Phòng Massage trị liệu" },
      { src: "/images/tien-ich-8", caption: "Rạp chiếu phim tại gia" },
      { src: "/images/tien-ich-9", caption: "Phòng Karaoke" },
    ],
  },
  floorPlan: {
    title: "MẶT BẰNG TỔNG THỂ",
    paragraphs: [
      "Palm River được quy hoạch với 4 tòa tháp cao 36 tầng nổi, 2 tầng hầm, thiết kế tối ưu công năng, đón trọn ánh sáng tự nhiên và luồng gió mát từ dòng sông.",
      "Các căn hộ được bố trí đa dạng loại hình - từ căn góc view sông đến căn nội khu - đáp ứng nhu cầu đa dạng của cư dân.",
    ],
    image: "/images/mat-bang",
  },
  perspectiveShowcase: {
    title: "PHỐI CẢNH DỰ ÁN",
    subtitle: "Chiêm ngưỡng phối cảnh tổng thể và các góc nhìn ấn tượng của Palm River.",
    images: [
      { src: "/images/phoi-canh-1", caption: "Phối cảnh tổng thể Palm River bên dòng sông" },
      { src: "/images/phoi-canh-2", caption: "Cung đường tản bộ ven sông" },
      { src: "/images/phoi-canh-3", caption: "Khu vực đón tiếp rộng rãi" },
      { src: "/images/phoi-canh-4", caption: "Ốc đảo xanh giữa không gian sống" },
    ],
  },
  design: {
    title: "THIẾT KẾ SẢN PHẨM",
    paragraphs: [
      "Thiết kế đương đại giao hòa với thiên nhiên - mỗi căn hộ Palm River được chăm chút từ không gian phòng khách, bếp, phòng ngủ đến phòng tắm, mang phong cách sang trọng, ấm áp và tinh tế.",
      "Vật liệu cao cấp, ánh sáng tự nhiên và view sông được tối ưu trong từng căn hộ, tạo nên trải nghiệm sống đẳng cấp và bền vững theo thời gian.",
    ],
    images: ["/images/thiet-ke-1", "/images/thiet-ke-2"],
  },
  pricing: {
    title: "GIÁ BÁN",
    units: [
      {
        type: "Căn hộ Studio",
        area: "41,3 m²",
        price: "Đang cập nhật",
        payment: "Liên hệ để nhận chính sách thanh toán mới nhất",
        image: "/images/anh-render-studio",
      },
      {
        type: "Căn hộ 1 Phòng ngủ",
        area: "65,9 m²",
        price: "Đang cập nhật",
        payment: "Liên hệ để nhận chính sách thanh toán mới nhất",
        image: "/images/anh-render-1pn",
      },
      {
        type: "Căn hộ 2 Phòng ngủ góc",
        area: "84,9 m²",
        price: "Đang cập nhật",
        payment: "Liên hệ để nhận chính sách thanh toán mới nhất",
        image: "/images/anh-render-2pn",
      },
      {
        type: "Căn hộ 2 Phòng ngủ đặc biệt",
        area: "120,2 m²",
        price: "Đang cập nhật",
        payment: "Liên hệ để nhận chính sách thanh toán mới nhất",
        image: "/images/anh-render-2pn-dac-biet",
      },
    ],
    note: "Giá bán trên có thể thay đổi theo từng thời điểm mở bán. Vui lòng liên hệ hotline để được cập nhật bảng giá mới nhất.",
  },
  productTypes: {
    title: "CÁC LOẠI HÌNH SẢN PHẨM",
    intro: "Palm River đa dạng hoá loại hình căn hộ, đáp ứng nhu cầu an cư và đầu tư của nhiều đối tượng khách hàng khác nhau.",
    items: [
      {
        title: "Căn hộ Studio",
        description: "Thiết kế tối ưu công năng trong không gian gọn gàng, phù hợp cho người độc thân hoặc nhà đầu tư khai thác cho thuê.",
        specs: [
          { label: "Diện tích", value: "41,3 m²" },
          { label: "Loại hình", value: "Studio" },
          { label: "Giá bán", value: "Đang cập nhật" },
        ],
        image: "/images/anh-render-studio",
        ctaLabel: "Nhận báo giá Căn hộ Studio",
      },
      {
        title: "Căn hộ 1 Phòng ngủ",
        description: "Không gian sống riêng tư trọn vẹn, phù hợp cho cặp đôi trẻ hoặc gia đình nhỏ mới bắt đầu an cư.",
        specs: [
          { label: "Diện tích", value: "65,9 m²" },
          { label: "Loại hình", value: "1 Phòng ngủ" },
          { label: "Giá bán", value: "Đang cập nhật" },
        ],
        image: "/images/anh-render-1pn",
        ctaLabel: "Nhận báo giá Căn hộ 1PN",
      },
      {
        title: "Căn hộ 2 Phòng ngủ góc",
        description: "Căn góc đón trọn ánh sáng và view sông hai mặt thoáng, phù hợp cho gia đình cần không gian riêng tư và rộng rãi hơn.",
        specs: [
          { label: "Diện tích", value: "84,9 m²" },
          { label: "Loại hình", value: "2 Phòng ngủ góc" },
          { label: "Giá bán", value: "Đang cập nhật" },
        ],
        image: "/images/anh-render-2pn",
        ctaLabel: "Nhận báo giá Căn hộ 2PN",
      },
      {
        title: "Căn hộ 2 Phòng ngủ đặc biệt",
        description: "Phiên bản cao cấp nhất trong dòng 2 phòng ngủ, diện tích rộng rãi 120,2m² với thiết kế đặc biệt, view sông trọn vẹn.",
        specs: [
          { label: "Diện tích", value: "120,2 m²" },
          { label: "Loại hình", value: "2 Phòng ngủ đặc biệt" },
          { label: "Giá bán", value: "Đang cập nhật" },
        ],
        image: "/images/anh-render-2pn-dac-biet",
        ctaLabel: "Nhận báo giá Căn hộ 2PN đặc biệt",
      },
    ],
  },
  reasons: {
    title: "LÝ DO NÊN ĐẦU TƯ",
    items: [
      {
        title: "Vị trí giao điểm trung tâm khu Đông TP.HCM",
        description: "Kết nối nhanh chóng tới trung tâm tài chính Thủ Thiêm, sân bay Long Thành và các trục giao thông trọng điểm.",
      },
      {
        title: "Chủ đầu tư uy tín, đội ngũ phát triển chuyên nghiệp",
        description: "Hướng Việt Properties cùng các đối tác thiết kế - thi công hàng đầu: DPA, Dark Horse, LJ Group, Core Project Management.",
      },
      {
        title: "Hệ tiện ích nghỉ dưỡng đẳng cấp resort",
        description: "Hồ bơi dài 70m, công viên xanh, sân thể thao và tiện ích nội khu đầy đủ ngay trong khuôn viên dự án.",
      },
      {
        title: "Đa dạng sản phẩm, phù hợp mọi nhu cầu",
        description: "Từ Studio, căn hộ gia đình đến Penthouse, Shophouse - linh hoạt cho cả nhu cầu ở thực và đầu tư khai thác.",
      },
    ],
  },
  buyers: {
    title: "AI PHÙ HỢP",
    items: [
      {
        title: "Gia đình trẻ thành phố",
        description: "Cần không gian sống hiện đại, tiện ích đầy đủ, gần trung tâm và thuận tiện di chuyển đi làm.",
      },
      {
        title: "Nhà đầu tư khai thác cho thuê",
        description: "Vị trí giao điểm trung tâm, gần khu tài chính Thủ Thiêm - tiềm năng cho thuê và tăng giá dài hạn.",
      },
      {
        title: "Chuyên gia, nhà quản lý cấp cao",
        description: "Tìm kiếm không gian sống đẳng cấp, riêng tư, gần trung tâm tài chính và các tiện ích cao cấp.",
      },
    ],
  },
  faq: {
    title: "CÂU HỎI THƯỜNG GẶP",
    items: [
      {
        question: "Palm River có những loại hình căn hộ nào?",
        answer: "Palm River đa dạng loại hình: Studio (41,3m²), 1 Phòng ngủ (65,9m²), 2 Phòng ngủ góc (84,9m²), 2 Phòng ngủ đặc biệt (120,2m²), cùng Duplex, Penthouse và Shophouse.",
      },
      {
        question: "Hình thức sở hữu của dự án như thế nào?",
        answer: "Dự án áp dụng hình thức sở hữu lâu dài đối với khách hàng có quốc tịch Việt Nam.",
      },
      {
        question: "Palm River cách trung tâm TP.HCM bao xa?",
        answer: "Dự án cách Trung tâm Tài chính Thủ Thiêm (IFC) 10 phút, Trung tâm Hành chính TP.HCM 10 phút và khu trung tâm Quận 1 cũ khoảng 12 phút di chuyển.",
      },
      {
        question: "Tôi có thể nhận báo giá chi tiết ở đâu?",
        answer: "Quý khách vui lòng để lại thông tin liên hệ tại các form đăng ký trên website, chuyên viên tư vấn sẽ liên hệ hỗ trợ trong thời gian sớm nhất.",
      },
    ],
  },
  consultant: {
    title: "NGƯỜI TƯ VẤN",
    image: "/images/tu-van",
    name: "[ĐIỀN: Họ và tên]",
    role: "Chuyên viên tư vấn dự án Palm River",
    phone: "[ĐIỀN: số điện thoại thật]",
    description: [
      "Với kinh nghiệm tư vấn bất động sản khu Đông TP.HCM, tôi cam kết đồng hành và mang đến những thông tin chính xác, minh bạch nhất về dự án Palm River.",
      "Hãy liên hệ để được tư vấn chi tiết về chính sách bán hàng, bảng giá và pháp lý dự án.",
    ],
  },
  popup: {
    title: ["CHUẨN SỐNG MỚI", "BÊN DÒNG SÔNG PALM RIVER"],
    cards: [
      { label: "Sở hữu", value: "Lâu dài", sub: "khách hàng Việt Nam" },
      { label: "Quy mô", value: "4 tòa", sub: "36 tầng nổi" },
      { label: "Vị trí", value: "10 phút", sub: "tới Thủ Thiêm IFC" },
    ],
  },
  zalo: "https://zalo.me/[ĐIỀN số điện thoại]",
  footer: {
    company: "Hướng Việt Properties",
    address: "Dự án Palm River, Phường Bình Trưng, TP. Hồ Chí Minh",
    hotline: "[ĐIỀN: số hotline thật]",
    copyright: "© 2026 Palm River. Mọi quyền được bảo lưu.",
  },
  theme: {
    brand: "#1c3a2e",
    brandLight: "#2f5443",
    gold: "#c9a24b",
    goldDark: "#a9822f",
    nav: "#ffffff",
  },
};

export default mockData;
```

**Lưu ý về placeholder còn thiếu**: leaflet PDF không có giá bán VNĐ cụ thể, hotline, tên người tư vấn - giữ nguyên các placeholder `[ĐIỀN: ...]` và `"Đang cập nhật"` cho tới khi có thông tin thật (đây là quy ước đã thống nhất: chỗ nào chưa có giá thì ghi **"Đang cập nhật"**, không để trống hay ghi số giả).

## 7. Nút "Nhận báo giá chi tiết" trong Pricing - style viền dash động chính xác

```jsx
function DashedCTA({ children }) {
  return (
    <div className="relative block w-full">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <rect
          x="2.5" y="2.5"
          width="calc(100% - 5px)" height="calc(100% - 5px)"
          rx="9"
          fill="none"
          stroke="#fff" strokeOpacity="0.85" strokeWidth="1.5"
          strokeDasharray="5 4"
          className="marching-ants"
        />
      </svg>
      {children}
    </div>
  );
}
```

Nút bên trong: `relative block w-full text-center rounded-xl py-3 mt-2 text-sm font-semibold text-white hover:brightness-110 transition`, nền `style={{ backgroundColor: "var(--color-gold)" }}` (không dùng class `bg-gold` trực tiếp để tránh xung đột, dùng inline style). CSS animation `marching-ants` (đã khai báo trong `index.css`, 2.5s linear infinite, dịch chuyển `stroke-dashoffset`).

## 8. Footer - bỏ Email, chỉ giữ Hotline

```jsx
<div className="text-left md:text-right">
  <p className="text-brand/60 text-sm">Hotline</p>
  <a href={`tel:${data.hotline}`} className="text-gold-dark font-bold text-lg">
    {data.hotline}
  </a>
</div>
```

KHÔNG có field `email` trong `mockData.js` và không có dòng "Email" trong Footer JSX - đã bỏ hẳn theo yêu cầu thực tế của dự án trước.

## 8b. PopupForm - style chi tiết chính xác

```jsx
// Overlay
<div
  className="fixed inset-0 z-[150] flex items-center justify-center px-4 fade-in"
  style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
  onClick={onClose}
>
  {/* Card */}
  <div
    className="relative w-full max-w-2xl bg-brand border-2 border-dashed border-white/40 rounded-2xl p-8 md:p-10"
    onClick={(e) => e.stopPropagation()}
  >
    {/* Nút đóng */}
    <button onClick={onClose} className="absolute top-4 right-5 text-3xl leading-none text-white/70 hover:text-white cursor-pointer">
      &times;
    </button>

    {/* Tiêu đề 2 dòng */}
    <div className="text-center mb-7">
      <p className="text-white/80 text-sm uppercase tracking-widest">{data.title[0]}</p>
      <p className="font-serif text-white text-2xl md:text-3xl font-bold mt-2">{data.title[1]}</p>
    </div>

    {/* 3 card ưu đãi */}
    <div className="grid grid-cols-3 gap-4 mb-7">
      {data.cards.map((c) => (
        <div key={c.label} className="rounded-xl p-4 text-center bg-gold">
          <p className="text-xs font-bold text-white/90 uppercase tracking-wide">{c.label}</p>
          <p className="font-serif text-3xl font-bold text-white my-2">{c.value}</p>
          <p className="text-white/80 text-xs">{c.sub}</p>
        </div>
      ))}
    </div>

    {/* Form hoặc trạng thái thành công */}
    {status === "success" ? (
      <div className="text-center text-white py-6">
        <p className="font-serif text-xl font-bold">Cảm ơn quý khách!</p>
        <p className="text-white/80 text-sm mt-1">Chuyên viên tư vấn sẽ liên hệ với bạn trong thời gian sớm nhất.</p>
      </div>
    ) : (
      <form onSubmit={handleSubmit} className="rounded-xl p-6 space-y-4">
        <input type="text" placeholder="Họ và tên" className="w-full px-4 py-3.5 rounded-lg border border-gray-200 bg-white text-gray-800 text-base outline-none" />
        <input type="tel" placeholder="Số điện thoại" className="w-full px-4 py-3.5 rounded-lg border border-gray-200 bg-white text-gray-800 text-base outline-none" />
        {/* checkbox custom 16x16px, tick SVG trắng khi active, bg-gold khi checked / border-white/40 khi chưa check */}
        <button type="submit" className="w-full py-4 rounded-lg font-bold text-white text-base tracking-wider bg-gold hover:brightness-110 transition cursor-pointer">
          TÔI MUỐN NHẬN NGAY
        </button>
      </form>
    )}
  </div>
</div>
```

State `visible`/`onOpen`/`onClose` được **quản lý ở component gốc `LandingPage`** (không nội bộ trong PopupForm), truyền xuống qua props, để cả Header (nút "Nhận báo giá") và FloatingCTAs (nút "Tải giỏ hàng độc quyền") đều gọi mở chung 1 popup duy nhất:

```jsx
export default function LandingPage() {
  const [popupVisible, setPopupVisible] = useState(false);
  const openPopup = useCallback(() => setPopupVisible(true), []);
  const closePopup = useCallback(() => setPopupVisible(false), []);
  // ...
  <Header data={data} onOpenPopup={openPopup} />
  <FloatingCTAs zalo={data.zalo} onOpenPopup={openPopup} />
  <PopupForm data={data.popup} visible={popupVisible} onOpen={openPopup} onClose={closePopup} />
}
```

PopupForm vẫn giữ logic tự động mở sau 10 giây nếu chưa tương tác (gọi `onOpen()` trong `useEffect` với `setTimeout`), cộng thêm khả năng được trigger thủ công từ ngoài.

## 9. Custom scrollbar (tránh thanh scroll xám thô nổi bật trên nền ảnh tối)

```css
html {
  scrollbar-width: thin;
  scrollbar-color: var(--color-brand-light) transparent;
}
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: var(--color-brand-light);
  border-radius: 999px;
  border: 2px solid transparent;
  background-clip: padding-box;
}
```

## 10. FloatingCTAs - kích thước chính xác

- Container ngoài: `fixed bottom-4 left-4 z-40`, `w-[calc(100%-2rem)] max-w-sm`.
- Card kính mờ: `relative rounded-3xl bg-white/20 backdrop-blur-md ring-1 ring-white/30 shadow-xl p-3 pt-5`, `flex flex-col gap-2`.
- Nút mũi tên thu gọn/mở (SVG chevron, KHÔNG dùng Font Awesome `<i>` để khớp đúng `stroke-width 2.5`): `absolute -top-3 left-1/2 -translate-x-1/2`, `h-7 w-12 rounded-full bg-black/35 hover:bg-black/50 backdrop-blur-md ring-1 ring-white/30`, icon `h-4 w-4`, thêm `cursor-pointer transition-colors` (button mặc định Tailwind có `cursor: default`, PHẢI thêm `cursor-pointer` thủ công).
- Nút "TƯ VẤN QUA ZALO VỚI CEO": `w-full flex items-center justify-center gap-2.5 py-2.5 px-5 rounded-full text-base font-bold text-white shadow-lg shadow-black/30 hover:brightness-110 transition`, nền `style={{ backgroundColor: "#0068ff" }}`, icon Zalo SVG `h-6 w-6`.
- Nút "TẢI GIỎ HÀNG ĐỘC QUYỀN ĐỢT 1": cùng kích thước/layout, nền `#e11d2a`, icon tài liệu SVG outline `h-6 w-6 stroke-width 2`, **onClick gọi `onOpenPopup` (mở PopupForm), KHÔNG phải link scroll** - dùng `<button type="button" onClick={onOpenPopup}>` thay vì `<a href="#lead-1">`, thêm `cursor-pointer`.

## 11. Favicon - không dùng nguyên logo dọc

Nếu logo Palm River là dạng dọc (icon + chữ bên dưới, giống cấu trúc logo Genera/Solia đã gặp), viện KHÔNG dùng trực tiếp `logo.png` làm favicon vì browser sẽ scale méo/lệch khi hiển thị ở kích thước nhỏ (16-32px). Thay vào đó:
1. Crop riêng phần icon/biểu tượng (không lấy phần chữ) thành ảnh vuông, có padding đều quanh icon.
2. Lưu thành `logo-web.png` riêng.
3. Trỏ `<link rel="icon" type="image/png" href="/images/logo-web.png" />` trong `index.html`.

Nếu logo Palm River vốn đã là dạng icon vuông độc lập (không kèm chữ), có thể dùng thẳng logo đó cho cả navbar và favicon.

## 12. Component dùng chung / kỹ thuật khác - giữ nguyên y hệt bản mẫu

- **`Img`**: nhận `src` không đuôi, tự thử `jpg, jpeg, png, webp, avif, gif`, có prop `zoomable` mở lightbox. **Toàn bộ ảnh cuối cùng nên là WebP đã nén** (xem mục 13 tối ưu ảnh) - nhưng component vẫn phải tự dò đuôi để linh hoạt.
- **`LightboxContext`**: `z-[100]`, overlay đen 70%, đóng bằng Esc/click nền/nút ×.
- **`LeadForm`**: validate tên không rỗng, SĐT regex `^\d{9,11}$`, checkbox bắt buộc, POST `/api/lead` (nuốt lỗi network), gọi `fbq('track','Lead')` nếu có, hiện thành công 5s rồi reset. Link "Chính sách bảo mật" trong form **KHÔNG có `target="_blank"` / `rel="noreferrer"`** - mở cùng tab (đã sửa theo yêu cầu thực tế, xem mục 14).
- **`Particles`**: canvas 130 hạt trắng, ResizeObserver, devicePixelRatio.
- **`PerspectiveShowcase`**, **`FAQ`**: giữ nguyên state pattern như mô tả mục 3.

## 13. Tối ưu dung lượng ảnh - BẮT BUỘC trước khi deploy

Đây là bài học quan trọng từ dự án trước: ảnh gốc từ thiết kế/leaflet thường rất nặng (PNG/JPG chưa nén, độ phân giải in ấn 6000×4000px trở lên, có thể lên tới 10-30MB/ảnh). Nếu để nguyên và chạy quảng cáo, lượng truy cập đồng thời cao sẽ gây tràn băng thông/bộ nhớ hosting (Vercel/Netlify).

**Quy tắc bắt buộc cho MỌI ảnh trước khi đưa vào `public/images/`:**
- Resize chiều rộng tối đa theo mục đích: ảnh hero/phối cảnh full-width ~1920px, ảnh card/thumbnail ~1200-1400px, logo ~400px, favicon-source ~256px.
- Convert sang **WebP, quality 75, method 6** (dùng Pillow: `img.save(out, "WEBP", quality=75, method=6)`).
- Xóa file gốc nặng sau khi có bản WebP, chỉ giữ lại bản đã nén.
- Mục tiêu: mỗi ảnh landing page nên dưới 300-500KB, tổng thư mục `public/images/` nên dưới 5MB.

## 14. Trang phụ & hành vi khác cần giữ nguyên

- `public/chinh-sach-bao-mat.html` và `public/dieu-khoan.html`: mỗi trang có **nút "Quay lại"** ở đầu trang (icon mũi tên trái SVG + chữ "Quay lại"), dùng `history.back()` khi có lịch sử điều hướng, fallback về `/`. Đồng bộ màu theme (dùng `--color-brand`/`--color-gold-dark` tương ứng của Palm River, không copy nguyên mã màu xanh navy cũ).
- Tất cả link tới 2 trang trên (trong LeadForm, Footer, PopupForm) **mở cùng tab**, không có `target="_blank"` / `rel="noreferrer"`.
- `.gitignore` phải có ngay từ đầu, tối thiểu: `node_modules/`, `dist/`, `.env`, `.env.local`, `.DS_Store`.
- `netlify/functions/lead.js`: nhận POST `{ projectName, createdAt, name, phone, source }`, trả về `{ ok: true }`, log ra console (để nối tiếp email/CRM sau).

## 15. index.html

- Title: "Palm River" (không phải tên chung chung).
- Meta description mô tả đúng Palm River (căn hộ cao tầng, khu Đông TP.HCM, view sông).
- Meta Pixel script với `PIXEL_ID` placeholder, đặt `<noscript><img>` fallback trong `<body>` (KHÔNG đặt trong `<head>` - HTML5 spec không cho phép `<img>` bên trong `<noscript>` nằm trong `<head>`, sẽ gây lỗi build Vite `disallowed-content-in-noscript-in-head`).
- Font Awesome CDN link giữ lại nếu còn dùng icon `<i className="fa-solid...">` ở đâu đó (Intro icon lá cây, SalesPolicy icon tick...).

---

Build đúng cấu trúc, đúng class Tailwind, đúng animation/component/cơ chế đã mô tả ở trên. Nội dung đã có sẵn thật từ leaflet Palm River - chỉ còn thiếu: giá bán VNĐ cụ thể (ghi "Đang cập nhật"), hotline, tên người tư vấn (giữ `[ĐIỀN: ...]`), và toàn bộ hình ảnh thật (ảnh có sẵn dùng luôn từ file leaflet gốc nếu tách được, ảnh còn thiếu để `Img` component tự hiện placeholder "Hình ảnh đang cập nhật" cho tới khi có ảnh thật).
