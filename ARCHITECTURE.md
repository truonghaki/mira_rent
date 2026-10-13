# MIRA RENT frontend

Frontend được refactor từ source Figma Make hiện có, dùng React 19, TypeScript strict, Vite 8 và Tailwind CSS 4. Backend foundation bổ sung SDK Supabase v2 cho Auth/Data/Storage; không thêm thư viện kiểm thử.

## Cấu trúc và trách nhiệm

| Thư mục | Trách nhiệm |
| --- | --- |
| `src/app` | Router, initialization, composition của providers và adapters |
| `src/layouts` | CustomerLayout và AdminLayout; giữ cấu trúc DOM gốc |
| `src/pages/customer` | Home, Collection, Product Detail, Rental Guide, Care, Contact |
| `src/pages/admin` | Login, Dashboard, Products, Product Editor, Rentals, History, Revenue, Settings |
| `src/components/ui` | Button, Icon, Field, CurrencyInput, Empty, Confirm, Toast |
| `src/components/common` | Header, Footer, Brand, sidebar, mobile navigation, search, loading |
| `src/components/product` | Card và nhãn trạng thái customer/admin |
| `src/features/products` | CRUD, selectors, validation, form mapping, image handling và editor hook |
| `src/features/rentals` | State transitions, pricing, completion, deep links và rental sheets |
| `src/features/revenue` | Hàm tính thuần, selectors và biểu đồ |
| `src/features/auth` | Demo credentials validation và auth hook |
| `src/features/settings` | Hook đọc/cập nhật cấu hình shop |
| `src/services` | Contracts, adapters demo, notifications và hàng đợi persistence |
| `src/types` | Product, RentalOrder, ProductSnapshot, ShopSettings, ShopState |
| `src/hooks` | Shared context và toast lifecycle |
| `src/utils` | Currency, calendar dates và slug |
| `src/data` | Demo fixtures và các URL ảnh gốc |
| `src/styles` | CSS tokens và global rules |

`src/App.tsx`, `src/AdminApp.tsx`, `src/store.tsx` và `src/data.ts` là các entry tương thích nhỏ. Module mới import trực tiếp nơi sở hữu chức năng. Không còn UI hoặc nghiệp vụ lớn trong các entry này.

Thêm features auth/settings vì source gốc có state và luồng tương ứng. Giữ trang Care ngoài năm trang customer chính để bảo toàn `/luu-y`. Chưa tạo thư mục assets rỗng: source gốc sử dụng URL ảnh ngoài; favicon vẫn ở `public/`. Khi có file được import vào code, đặt chúng trong `src/assets/`.

## Luồng dữ liệu

Pages/components đọc các feature hooks. Hooks quản lý state của form và gọi các hàm nghiệp vụ thuần. ShopProvider cập nhật một ShopState chung, nên trạng thái sản phẩm và đơn thuê đổi trong cùng một lần cập nhật React. Services thực hiện đọc/ghi dữ liệu, auth và quản lý URL ảnh.

Các module tính giá, chuyển trạng thái, lọc sản phẩm và doanh thu không phụ thuộc React, DOM hoặc browser storage. Thời gian và order ID của state transitions được truyền vào để kiểm thử xác định.

ShopProvider gọi repository.load trước khi ghi; dữ liệu tải về muộn không ghi đè thay đổi đã thực hiện trong UI. PersistenceQueue ghi theo thứ tự, cho phép lần ghi sau tiếp tục khi lần trước thất bại, và bỏ các snapshot đang chờ khi reset demo. Lỗi đồng bộ từ adapter được hiển thị qua Toast hiện có.

## Quy tắc nghiệp vụ được giữ lại

- Số ngày thuê bao gồm ngày bắt đầu và ngày trả. Giá = giá ngày đầu + giá ngày thêm × số ngày thêm.
- Giá trong đơn là snapshot, không đổi khi giá sản phẩm được sửa.
- Đơn đặt chuyển sang đang thuê hoặc đã hủy. Chỉ đơn đang thuê được hoàn tất.
- Hoàn tất ghi actualReturnDate, completedAt, actualRevenue và trả sản phẩm về available. Thao tác hoàn tất lần hai không tạo thêm doanh thu.
- Doanh thu chỉ lấy actualRevenue của đơn completed. Tiền cọc, đơn đặt, đơn đang thuê và đơn hủy không được cộng.
- Form hoàn tất vẫn cho phép nhập doanh thu thực tế thủ công; phụ phí/giảm giá chỉ tự tính khi người dùng chưa ghi đè khoản này.
- Không xóa sản phẩm có đơn reserved/active. Xóa sản phẩm không xóa snapshot của lịch sử.
- Thay đổi trạng thái trong Product Editor sử dụng cùng luồng rental sheet như danh sách sản phẩm; cập nhật thông tin sản phẩm không tự thay thế trạng thái của một đơn thuê.
- Date input dùng ngày lịch của shop tại Việt Nam để tránh lệch ngày do UTC.

## Routing

Router vẫn sử dụng History API và popstate, không thêm router library. Navigation tập trung trong `src/app/router/navigation.ts`.

Customer: `/`, `/bo-suu-tap`, `/san-pham/:id`, `/quy-trinh`, `/luu-y`, `/lien-he`.

Admin: `/admin`, `/admin/login`, `/admin/products`, `/admin/products/new`, `/admin/products/:id/edit`, `/admin/rentals`, `/admin/history`, `/admin/revenue`, `/admin/settings`.

Giữ các query `product`, `action`, `order`; query thay đổi trên cùng trang cũng được xử lý. Giữ fallback URL không biết của source gốc. Trang sản phẩm với ID không tìm thấy vẫn fallback sang sản phẩm đầu tiên; danh sách rỗng có empty state an toàn dùng nội dung hiện có.

Header/Footer/mobile navigation khách hàng vẫn ẩn ở Product Detail. Sidebar/mobile navigation admin vẫn sử dụng đúng class và breakpoints gốc.

Khi host bản build trên static hosting, cấu hình fallback các URL của SPA về `index.html` để refresh deep link hoạt động. Vite dev/preview đã cung cấp fallback này.

## Thay adapter để tích hợp backend

Các interface nằm trong `src/services/contracts/index.ts`. Inject một AppServices ổn định vào AppProviders:

```tsx
<AppProviders services={services}>
  <App />
</AppProviders>
```

Demo services dùng initialState/initialSession và repository persistence. Supabase services bootstrap public state, xác nhận getAccess rồi load_shop_snapshot; dữ liệu riêng của admin không lưu trong ShopState localStorage.

- DataRepository chỉ phục vụ demo snapshot. BackendCommands và Supabase reads dùng RPC nguyên tử cùng version/request IDs; không upsert toàn ShopState.
- AuthAdapter: thay session demo bằng xác thực backend; credentials đã được truyền qua contract.
- ImageStorageAdapter: thay Object URL tạm bằng URL từ storage, giữ ProductImage và coverImage contracts.
- Giữ snapshot giá/sản phẩm cùng đơn để sửa/xóa catalogue không thay đổi lịch sử.

Source này vẫn sử dụng demo auth và demo storage như bản export. Session demo không bảo vệ backend. Ảnh upload trong demo vẫn là Object URL tạm, không phải upload bền vững; chỉ metadata được lưu qua `mira-rent-demo-v2`. Supabase mode đã có SDK/adapters Auth/Storage, nhưng chưa kiểm chứng dịch vụ cloud khi chưa cấu hình project.

## Bảo toàn giao diện

Font imports và Tailwind ở `src/index.css`. CSS tokens tách vào `styles/tokens.css`; các global rules, responsive overrides và animation nằm trong `styles/global.css` theo đúng thứ tự gốc. Không chuyển sang CSS Modules hoặc đổi tên class vì selector phụ thuộc DOM và thứ tự cascade. Loại riêng tài liệu này khỏi quét Tailwind để nội dung hướng dẫn không sinh thêm utility CSS.

SVG paths được gom lại, giữ hai biến thể menu customer/admin và hai bộ nhãn trạng thái khác nhau. Nội dung, ảnh, font, màu sắc, animation, hero timing và media queries giữ nguyên. Chỉ bổ sung nhãn ARIA cho một số nút icon và hỗ trợ Enter trên product cards.

## Lệnh kiểm tra

```text
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm dev
pnpm check:routes
```

`check:routes` cần dev/preview đang chạy; có thể truyền URL khác bằng `pnpm check:routes http://localhost:8443`.

Test runner dùng node:test và compiler TypeScript sẵn có. Tests chạy trong cùng process vì môi trường hiện tại chặn tạo subprocess. Typecheck bật noUnusedLocals, noUnusedParameters và verbatimModuleSyntax.

Vite dùng configLoader native để nạp plugin native trên Windows, JSON import attributes và projectDirectory từ import.meta.url. Toolchain vẫn là Node 22 theo `.mise.toml`; đã kiểm tra với Node 22.23.2. Không đổi Vite/Figma plugins hoặc dependency versions.

## Kết quả kiểm chứng

- TypeScript strict, production build và development preview build đạt.
- 55 tests: pricing, transitions, snapshot preservation, revenue, product/image validation, filtering, routing, demo persistence/auth, serial writes, và render regression.
- 21 HTML render snapshots lấy từ checkpoint gốc: các trang customer/admin và rental/history modals. Markup khớp sau khi loại các annotation accessibility đã thêm.
- Stylesheet source được tái ghép và kiểm tra hash, bảo toàn font imports, CSS rules, media queries và animations theo thứ tự gốc.
- CSS production có SHA-256 `b4c6b09e3d01afe792ffe97feabdf7c855de264b182822f4213de21f505e1402`, trùng baseline.
- HTTP smoke check cho 15 URL/deep links đạt; route resolution được kiểm thử riêng.
- Chưa xác minh bằng screenshot hoặc browser interactions thật: browser tích hợp không có phiên, trình duyệt local bị môi trường chặn khởi tạo. HTML/CSS regression không thay thế hoàn toàn kiểm chứng pixel và responsive bằng trình duyệt.

Checkpoint trước refactor ở `D:\Downloads - Copy\MIRA RENT checkpoints\before-refactor-20261012-014244`, kèm `manifest.json` SHA-256. Workspace ban đầu không có Git repository nên sử dụng checkpoint filesystem.

## Schema Supabase

Thiết kế database, ERD, bốn migrations, demo seed và SQL tests nằm trong [supabase/README.md](supabase/README.md). Schema dùng RPC theo từng nghiệp vụ; boundary ghi toàn bộ ShopState đã được tách: demo persistence và Supabase commands. Frontend mặc định dùng demo adapters; các migrations chưa được áp dụng lên một Supabase project cloud.

Kế hoạch phát triển backend, contracts, auth flow và các giai đoạn nghiệm thu nằm trong [BACKEND.md](BACKEND.md).

Backend foundation đã có adapters Supabase và provider theo mode; xem [supabase/SETUP.md](supabase/SETUP.md). DemoShopProvider giữ snapshot persistence demo; SupabaseShopProvider gọi commands và refresh snapshot từ server, không ghi toàn ShopState. Bật live mode bằng `.env.local` sau khi migrate đủ 01–04; hiện chưa kết nối cloud thật.
