# Kết nối backend Supabase với MIRA RENT

Code đã có hai backend modes. Không có env thì ứng dụng giữ demo. Supabase mode dùng Auth thật, snapshot RPC, write commands và ảnh Storage; không lưu ShopState vào localStorage và không có thao tác reset production.

## 1. Chuẩn bị database

Trên project test/mới, chạy migrations theo thứ tự:

1. `20261012000001_mira_schema.sql`
2. `20261012000002_mira_commands.sql`
3. `20261012000003_mira_storage.sql`
4. `20261012000004_mira_admin_access.sql`

Nếu đã áp dụng 01–03, chỉ áp dụng 04. Migration 04 bổ sung get_admin_access và load_shop_snapshot. Không chạy lại các migrations đã áp dụng. [README](README.md) có ERD, bootstrap admin và seed tùy chọn cho catalogue test rỗng.

Tạo user trong Supabase Auth rồi thêm UUID đó vào mira_private.admin_members. Tài khoản Auth tồn tại chưa đủ quyền quản trị.

## 2. Cấu hình frontend

Trong thư mục project:

```powershell
Copy-Item .env.example .env.local
```

Điền vào `.env.local`:

```dotenv
VITE_BACKEND_MODE=supabase
VITE_SUPABASE_URL=https://PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Key legacy có role anon cũng được chấp nhận qua biến publishable-key này. Không đặt secret/service-role key trong frontend. Cấu hình live không hợp lệ hiển thị lỗi; không fallback sang demo.

Khởi động lại dev server sau khi thay env:

```powershell
pnpm dev
```

Ở Supabase mode, đăng nhập bằng email/password Auth thật. Nhãn mode và lưu trữ đổi theo chế độ, layout giữ nguyên. Khách đọc catalogue/settings; admin được xác nhận membership mới đọc orders và gọi writes.

## Deploy trên Vercel

Trong Vercel project, vào Settings → Environment Variables và thêm `VITE_BACKEND_MODE=supabase`, `VITE_SUPABASE_URL` và `VITE_SUPABASE_PUBLISHABLE_KEY` cho môi trường Production. URL/key phải thuộc cùng project Supabase đã chạy đủ bốn migrations. `.env.local` chỉ cấu hình trên máy phát triển; không được đưa lên GitHub.

Sau khi thay đổi env, Redeploy để Vite build lại với cấu hình mới. Chỉ dùng publishable/anon key; không dùng secret/service-role key trong các biến `VITE_*`.

`vercel.json` ở thư mục gốc cấu hình rewrite các deep links về `/index.html`, theo [hướng dẫn Vite SPA của Vercel](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas). React tiếp tục xử lý URL hiện tại; mở trực tiếp hoặc refresh `/admin`, `/admin/login`, `/san-pham/1` và các route khác phải tải được ứng dụng. Cấu hình này không thay thế Supabase Auth hoặc quyền admin trong database.

Sau deployment, kiểm tra HTTP bằng `node scripts/check-routes.mjs https://TEN-PROJECT.vercel.app`; script xác minh status thành công và HTML có React root. Sau đó kiểm tra đăng nhập và các thao tác bằng tài khoản Auth thật.

## 3. Implementation hiện có

| File | Trách nhiệm |
| --- | --- |
| src/services/config.ts | Chọn mode, kiểm tra URL/public key |
| src/services/supabase/client.ts | SDK client chung, được lazy-load khi dùng live mode |
| database.types.ts | Types sinh từ schema đã migrate local |
| auth-adapter.ts | Password auth, self-access, auth events, signout |
| read-repository.ts | Một snapshot RPC để trạng thái sản phẩm và đơn thống nhất |
| commands.ts | Các write RPC, expected version, request ID |
| mappers.ts | Rows/snapshots → domain models, URL ảnh, legacy IDs |
| image-storage.ts | Upload UUID paths, MIME/size, cleanup upload mới |
| SupabaseShopProvider.tsx | Async actions, pending state, refresh, lỗi và clear private cache |
| DemoShopProvider.tsx | Demo persistence hiện có, tách khỏi live backend |

Supabase services không có repository.save(ShopState). UI chờ command và reload snapshot trước khi báo thành công. Lỗi VERSION_CONFLICT giữ form và refresh dữ liệu; create request ID ổn định trong cùng modal khi retry.

Nếu write đã commit nhưng reload thất bại, ứng dụng báo trạng thái đã lưu/chưa tải lại. Tải lại và kiểm tra trước khi làm tiếp. Khi kết quả save/upload còn không chắc chắn, giữ blob chưa được đối chiếu; cleanup tự động không được làm hỏng ảnh đã lưu. Một job cleanup orphan dài hạn chưa được triển khai.

Snapshot bootstrap hiện lấy tất cả catalogue và các đơn của admin để phục vụ UI hiện tại. Với dữ liệu lịch sử lớn, tách history/analytics thành queries có phân trang trong giai đoạn tiếp theo; không dùng bootstrap cho export không giới hạn.

## 4. Types và kiểm thử

Types đã được sinh bằng introspection của PostgreSQL áp dụng đủ 01–04, không phải khai báo schema tự đoán. Khi project cloud thay đổi, generate lại types bằng CLI của Supabase hoặc introspection cùng schema, rồi chạy typecheck. Các scripts local nằm trong `supabase/scripts/introspect-types.sql` và `generate-database-types.mjs`; generated types không khẳng định cloud đã migrate.

```powershell
pnpm typecheck
pnpm test
pnpm build
```

Đã chạy 71 tests ứng dụng (có SDK với HTTP transport giả lập, timezone và render regression) và 67 SQL assertions (Auth/Storage metadata giả lập trên PostgreSQL local). Chạy tests/database.sql và tests/access.sql trên Supabase test để kiểm chứng schema/project thực tế. Không chạy local-bootstrap.sql trên Supabase.

Kiểm tra tiếp bằng session thật: guest và admin, login/logout/refresh, upload/reload ảnh, lưu product/settings, reserve/start/cancel/complete, stale version, retry và hai admin cùng đặt. Chưa xác minh Auth/Storage HTTP của một project cloud vì chưa có cấu hình project thật trong workspace.

## 5. Phạm vi

SDK, adapters, providers, mappers, migration và tests đã có code. Cloud provisioning/deployment, notification/payment integrations, Edge Functions, CRM và import dữ liệu vận hành chưa được triển khai. Không tự seed/import localStorage của người dùng vào database live.

API được đối chiếu với [Supabase JavaScript SDK](https://supabase.com/docs/reference/javascript/initializing), [RPC](https://supabase.com/docs/reference/javascript/rpc) và [Auth state changes](https://supabase.com/docs/reference/javascript/auth-onauthstatechange).
