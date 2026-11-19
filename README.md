# Threads Social

Mạng xã hội chia sẻ bài viết lấy cảm hứng từ Threads. Người dùng đăng bài kèm ảnh, bình luận, thích, đăng lại, trích dẫn bài viết và theo dõi nhau.

| Phần | Công nghệ | Thư mục |
| --- | --- | --- |
| Backend | ASP.NET Core 8 Web API, Entity Framework Core 8, SQL Server, Docker | [`backend/`](backend/) |
| Frontend | React 19, Vite, Redux Toolkit, Tailwind CSS, shadcn/ui | [`frontend/`](frontend/) |

## Chức năng chính

- **Tài khoản:** đăng ký, đăng nhập bằng username hoặc email, xác thực email, quên và đặt lại mật khẩu, đăng xuất mọi phiên.
- **Bài viết:** đăng bài kèm ảnh, trích dẫn bài khác, xóa mềm, nhúng bài viết.
- **Tương tác:** thích, bình luận và trả lời kèm ảnh, đăng lại.
- **Bảng tin:** "Dành cho bạn" và "Đang theo dõi", cuộn vô hạn; bài được đăng lại sẽ được đẩy lên đầu.
- **Trang cá nhân:** các tab Bài viết, Trả lời, File phương tiện, Bài đăng lại; sửa hồ sơ; theo dõi và danh sách người theo dõi.
- **Quản trị:** phân quyền theo vai trò, admin cấp hoặc gỡ tích xanh.
- **Khác:** giao diện tiếng Việt và tiếng Anh, chế độ sáng và tối.

## Chạy nhanh

Cần Docker Desktop và Node.js 20+.

```bash
# 1. Backend + SQL Server + Mailpit
cd backend
cp .env.example .env          # sửa MSSQL_SA_PASSWORD, JWT_KEY
docker compose up -d --build  # API: http://localhost:5080/api/  Swagger: http://localhost:5080/swagger

# 2. Frontend
cd ../frontend
cp .env.example .env          # đặt VITE_BASE_API=http://localhost:5080/api/
npm install
npm run dev                   # http://localhost:5173
```

Email xác thực và đặt lại mật khẩu ở môi trường dev được gửi vào Mailpit: http://localhost:8025.

Chi tiết cấu hình, danh sách API và cấu trúc thư mục xem trong [README backend](backend/README.md) và [README frontend](frontend/README.md).
