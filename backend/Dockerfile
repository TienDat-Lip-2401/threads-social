# ---- Build ----
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
# Restore riêng để Docker cache lại lớp package khi chỉ sửa code
COPY Pharse2.csproj ./
RUN dotnet restore Pharse2.csproj
COPY . .
RUN dotnet publish Pharse2.csproj -c Release -o /app/publish --no-restore /p:UseAppHost=false

# ---- Runtime ----
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
# Serilog ghi log vào ./Logs; tạo sẵn và cấp quyền cho user không phải root
RUN mkdir -p /app/Logs && chown app /app/Logs
USER app
# Image .NET 8 mặc định lắng nghe HTTP cổng 8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "Pharse2.dll"]
