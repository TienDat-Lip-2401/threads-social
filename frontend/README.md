# CloneThread

Frontend cho bản clone Threads, viết bằng React. Backend nằm ở thư mục [`../backend`](../backend) (ASP.NET Core 8).

- React 19, Vite 7, React Router 7
- Redux Toolkit (redux-persist cho auth), axios (tự refresh token)
- Tailwind CSS 4, shadcn/ui (Radix UI), react-icons, lucide-react
- react-hook-form + yup, i18next (tiếng Việt / English), next-themes (sáng / tối)

## Chức năng đã có

| Nhóm | Chức năng |
| --- | --- |
| Tài khoản | Đăng ký, đăng nhập (username hoặc email), đăng xuất, quên / đặt lại mật khẩu, xác thực email qua link |
| Feed | `/` Dành cho bạn, `/following` Đang theo dõi (cần đăng nhập). Đổi feed bằng menu ▾ trên desktop hoặc bằng tab trên mobile. Cuộn vô hạn |
| Bài viết | Đăng bài kèm ảnh, trích dẫn bài khác, nhúng bài (embed) |
| Tương tác | Thích, đăng lại (nhãn "X đã đăng lại" trên feed), trả lời / bình luận kèm ảnh. Cập nhật lạc quan (optimistic), lỗi thì hoàn tác |
| Trang cá nhân | `/profile/:username` có các tab Bài viết, Trả lời, File phương tiện, Bài đăng lại. Có sửa hồ sơ (tên, bio, avatar) |
| Theo dõi | Nút theo dõi trên trang cá nhân và nút "+" trên avatar bài viết. Modal danh sách người theo dõi / đang theo dõi |
| Tích xanh | Hiện huy hiệu verified lấy từ API |
| Khác | Đa ngôn ngữ vi / en, dark mode. Khách chưa đăng nhập sẽ thấy hộp thoại yêu cầu đăng nhập khi tương tác |

## Chạy dự án

Cần Node.js 20+ và backend đang chạy (xem README của backend, cách nhanh nhất là `docker compose up -d` trong thư mục `backend/`).

```bash
npm install
cp .env.example .env
npm run dev          # http://localhost:5173
```

`.env`:

```bash
# URL gốc của API, PHẢI kết thúc bằng "/"
VITE_BASE_API=http://localhost:5080/api/      # BE chạy bằng Docker
# VITE_BASE_API=https://localhost:7066/api/   # BE chạy bằng Visual Studio
```

Email xác thực và email đặt lại mật khẩu ở môi trường dev nằm trong Mailpit: http://localhost:8025.

| Lệnh | Tác dụng |
| --- | --- |
| `npm run dev` | Chạy dev server |
| `npm run build` | Build production vào `dist/` |
| `npm run preview` | Xem bản build |
| `npm run lint` | ESLint |

## Cấu trúc thư mục

```
src/
  pages/        Home (feed), Profile (+ các tab, modal theo dõi), Auth, Embed, NotFound
  layouts/      DefaultLayout (sidebar, header feed), AuthLayout, EmbedLayout
  components/   PostCard, PostComposer, QuotedPostCard, BaseThreadModal, VerifiedBadge, ui/ (shadcn)...
  features/     Redux slice + selector + hook: auth, posts, follows
  services/     Thunk gọi API: auth, posts, users
  store/        Cấu hình Redux store
  router/       AppRouter, PrivateRoute, PublicRoute
  constants/    ROUTES...
  locales/      vi/, en/ translation.json
  utils/        http (axios + refresh token), authStorage, i18n, timeStamp
```

## Routes

| Path | Trang |
| --- | --- |
| `/` | Feed Dành cho bạn |
| `/following` | Feed Đang theo dõi (khách bị chuyển về `/`) |
| `/profile`, `/profile/:username` | Trang cá nhân (`/replies`, `/media`, `/reposts`) |
| `/:username/post/:postId/embed` | Bài viết dạng nhúng |
| `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email` | Xác thực |

## Ghi chú

- State theo dõi nằm trong slice `follows` dưới dạng override theo `userId`, nên mọi nơi hiển thị cùng một trạng thái. Slice này được reset khi đăng xuất.
- `posts.feedType` cho biết đang xem feed nào. Response của feed cũ về trễ sẽ bị bỏ qua.

## Việc còn lại

- Giao diện quản trị (cấp / gỡ tích xanh)
- Đổi mật khẩu
- Sửa / xóa bài viết trên giao diện (backend đã có API)
- Một số chỗ chưa đồng bộ:
  - Số "đang theo dõi" trên trang của mình chưa cập nhật khi theo dõi / bỏ theo dõi trong modal.
  - Khách không thấy nút theo dõi trong modal.
  - Bỏ theo dõi khi đang ở feed Following thì bài của người đó chưa tự ẩn.
