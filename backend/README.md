# SocialNetWork-BackEnd (Pharse2)

Backend REST API cho bản clone Threads. Frontend nằm ở repo [CloneThread](https://github.com/TienDat-Lip-2401/CloneThread).

- ASP.NET Core 8 (Web API), Entity Framework Core 8, SQL Server
- Xác thực bằng JWT (access token + refresh token), middleware tự viết
- Gửi email qua SMTP (dev dùng Mailpit)
- Docker Compose: SQL Server + API + Mailpit

## Chức năng đã có

| Nhóm | Chức năng |
| --- | --- |
| Tài khoản | Đăng ký, đăng nhập bằng username hoặc email, refresh token, đăng xuất, đăng xuất mọi phiên |
| Email | Xác thực email (bắt buộc trước khi đăng nhập), gửi lại email xác thực, quên / đặt lại mật khẩu |
| Hồ sơ | Xem hồ sơ theo username, sửa tên / bio / avatar, số người theo dõi / đang theo dõi |
| Bài viết | Đăng bài kèm ảnh (multipart), sửa, xóa mềm, xem chi tiết, trích dẫn (quote) bài khác |
| Feed | `for_you`: mọi bài, mới nhất trước. `following`: bài của người mình theo dõi và của chính mình. Bài được đăng lại sẽ được đẩy lên đầu và mỗi bài chỉ xuất hiện một lần |
| Tương tác | Thích bài / bình luận, đăng lại (repost), bình luận và trả lời bình luận kèm ảnh |
| Theo dõi | Theo dõi / bỏ theo dõi, danh sách người theo dõi / đang theo dõi |
| Trang cá nhân | Các tab Bài viết, Trả lời, File phương tiện, Bài đăng lại |
| Tích xanh | `User.IsVerified`, admin cấp hoặc gỡ qua API |

## Chạy bằng Docker (khuyên dùng)

Cần Docker Desktop.

```bash
cp .env.example .env      # rồi sửa MSSQL_SA_PASSWORD, JWT_KEY
docker compose up -d --build
```

| Dịch vụ | Địa chỉ |
| --- | --- |
| API | http://localhost:5080/api/ |
| Swagger | http://localhost:5080/swagger (chỉ khi `ASPNETCORE_ENVIRONMENT=Development`) |
| SQL Server | `localhost,14333`, user `sa`, mật khẩu là `MSSQL_SA_PASSWORD` |
| Mailpit (xem email) | http://localhost:8025 |

Migration được áp dụng tự động khi API khởi động (`Database__MigrateOnStartup=true`). Ảnh upload được lưu trong volume `uploads`, nên không mất khi build lại container.

Sau khi sửa code, build lại API bằng `docker compose up -d --build api`.

### Biến môi trường (`.env`)

| Biến | Ý nghĩa |
| --- | --- |
| `MSSQL_SA_PASSWORD` | Mật khẩu `sa` của SQL Server (>= 8 ký tự, có hoa, thường, số, ký tự đặc biệt) |
| `JWT_KEY` | Khóa ký JWT, chuỗi ngẫu nhiên >= 32 ký tự |
| `API_PORT` | Cổng API trên máy (mặc định 5080) |
| `ASPNETCORE_ENVIRONMENT` | `Development` bật Swagger |
| `FRONTEND_BASE_URL` | Địa chỉ FE, dùng để tạo link trong email |
| `SMTP_*` | Để trống thì email sẽ vào Mailpit. Điền vào (ví dụ Gmail App Password) để gửi email thật |

`.env` đã có trong `.gitignore`. **Không commit file này** và không đưa secret vào `appsettings.json`.

## Chạy bằng Visual Studio / `dotnet run`

1. Cần SQL Server (có thể chỉ bật container: `docker compose up -d sqlserver mailpit`).
2. Đặt secret bằng user-secrets:
   ```bash
   dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost,14333;Database=Pharse2;User Id=sa;Password=<...>;TrustServerCertificate=True;"
   dotnet user-secrets set "JwtSettings:Key" "<chuỗi ngẫu nhiên >= 32 ký tự>"
   dotnet user-secrets set "Smtp:Host" "localhost"
   ```
3. Cập nhật DB: `dotnet ef database update` (hoặc `Update-Database` trong Package Manager Console).
4. Chạy `dotnet run`, hoặc nhấn F5.

## Quy ước database

- Mọi thay đổi DB (bảng, cột, index, khóa, dữ liệu seed) đều phải qua **EF Core migration**. Không sửa DB bằng SQL tay.
- Không sửa migration đã commit. Cần thay đổi thì tạo migration mới:
  ```bash
  dotnet ef migrations add <TenMigration>
  ```
- Dữ liệu seed được viết bằng `migrationBuilder.Sql(...)` trong migration.

### Tài khoản admin

Migration `AddUserVerified` tạo sẵn tài khoản `admin` (`admin@threadclone.local`, role `Admin`, đã xác thực email, có tích xanh). Repo chỉ lưu hash BCrypt, không lưu mật khẩu, nên hãy hỏi chủ dự án để lấy mật khẩu. Chưa có chức năng đổi mật khẩu.

## Cấu trúc thư mục

```
Controllers/     Auth, Posts, Comments, Users, LikePost, LikeComment, Admin
Services/        Logic nghiệp vụ (Interfaces/ + Implement/)
Repositories/    Truy vấn EF Core (Interfaces/ + Implement/)
Models/
  EntityModels/  Entity + AppDbContext
  DtoModels/     Request / response DTO
  CommonModels/  ApiResponse, phân trang
MiddleWares/     CustomAuthorizeMiddleware (đọc JWT)
Filters/         [AuthorizeRole], Swagger filter
Helper/          ToPageResultAsync
Migrations/      EF Core migrations
```

## Quy ước API

- Base URL `/api/`, JSON dùng **snake_case**.
- Response bọc trong `ApiResponse` (`status_code`, `message`, `data`). Danh sách có phân trang dùng `page` / `per_page`.
- Lỗi validate trả **422** với lỗi theo từng field.
- Mọi endpoint đều cần `Authorization: Bearer <access_token>`, trừ endpoint có `[AllowAnonymous]`. Ở endpoint `[AllowAnonymous]`, nếu gửi token hợp lệ thì API biết người đang xem (để trả `is_liked`, `is_following`...).
- Endpoint quản trị dùng `[AuthorizeRole("Admin")]`.

## Danh sách endpoint chính

**Auth** (`/api/auth`)

| Method | Path | Ghi chú |
| --- | --- | --- |
| POST | `register`, `login`, `refresh` | công khai |
| POST | `forgot-password`, `reset-password` | công khai |
| POST | `verify-email`, `resend-verification-email` | công khai |
| POST | `logout`, `revoke-all-sessions` | |
| GET / PUT | `user` | thông tin / sửa hồ sơ người đang đăng nhập |

**Posts** (`/api/posts`)

| Method | Path | Ghi chú |
| --- | --- | --- |
| GET | `feed?type=for_you\|following&page=&per_page=` | khách gọi được `for_you`; khách gọi `following` nhận 401 |
| GET | `{id}` | công khai |
| POST / PUT / DELETE | `/`, `{id}` | tạo (multipart, có `quoted_post_id`), sửa, xóa mềm |
| POST | `{id}/like`, `{id}/repost` | bật / tắt |
| GET / POST | `{id}/comments` | GET công khai |

**Comments** (`/api/comments`): `GET {id}/replies`, `PUT {id}`, `DELETE {id}`. **LikeComment** (`/api/likecomment`): `POST toggle`, `GET {commentId}/likers`.

**Users** (`/api/users`)

| Method | Path | Ghi chú |
| --- | --- | --- |
| GET | `{username}` | hồ sơ + số người theo dõi |
| GET | `{username}/posts`, `/replies`, `/media`, `/reposts` | các tab trang cá nhân |
| GET | `{username}/followers`, `{username}/following` | danh sách theo dõi |
| POST | `{username}/follow` | bật / tắt theo dõi |

**Admin** (`/api/admin`, role Admin)

| Method | Path | Ghi chú |
| --- | --- | --- |
| PUT | `users/{username}/verified` | body `{ "verified": true }` để cấp / gỡ tích xanh |

Xem đầy đủ trên Swagger.

## Việc còn lại

- Tự xóa tài khoản chưa xác thực email sau 7 ngày
- Xóa file ảnh trên đĩa và dọn dữ liệu đã xóa mềm
- Đổi mật khẩu
- Giao diện quản trị
