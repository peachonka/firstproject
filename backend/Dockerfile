FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Копируем файлы проекта и восстанавливаем зависимости
COPY *.csproj .
RUN dotnet restore

# Копируем весь код и собираем приложение
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Финальный образ
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .

# Создаем папку для базы данных
RUN mkdir -p /app/data

EXPOSE 8080
EXPOSE 8081

ENTRYPOINT ["dotnet", "Backend.dll"]