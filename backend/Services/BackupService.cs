using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.IO.Compression;

namespace Backend.Services
{
    public interface IBackupService
    {
        Task<string> CreateBackupAsync();
        Task<List<BackupInfo>> GetBackupsAsync();
        Task<bool> DownloadBackupAsync(string backupName, Stream outputStream);
    }

    public class BackupService : IBackupService
    {
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<BackupService> _logger;

        public BackupService(IConfiguration configuration, IWebHostEnvironment environment, ILogger<BackupService> logger)
        {
            _configuration = configuration;
            _environment = environment;
            _logger = logger;
        }

        public async Task<string> CreateBackupAsync()
        {
            try
            {
                var backupDir = Path.Combine(_environment.ContentRootPath, "Backups");
                if (!Directory.Exists(backupDir))
                    Directory.CreateDirectory(backupDir);

                // Ищем файл базы данных
                var dbPath = FindDatabaseFile();
                if (!File.Exists(dbPath))
                {
                    throw new FileNotFoundException("Database file not found");
                }

                var backupFileName = $"backup_{DateTime.Now:yyyyMMdd_HHmmss}.zip";
                var backupPath = Path.Combine(backupDir, backupFileName);

                using (var zip = ZipFile.Open(backupPath, ZipArchiveMode.Create))
                {
                    zip.CreateEntryFromFile(dbPath, "construction.db");
                    
                    // Добавляем информацию о бэкапе
                    var infoEntry = zip.CreateEntry("backup_info.txt");
                    using (var writer = new StreamWriter(infoEntry.Open()))
                    {
                        await writer.WriteLineAsync($"Backup created: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
                        await writer.WriteLineAsync($"Database size: {new FileInfo(dbPath).Length} bytes");
                        await writer.WriteLineAsync($"Version: 1.0");
                    }
                }

                _logger.LogInformation($"Backup created: {backupPath}");

                // Очистка старых бэкапов (оставляем последние 10)
                await CleanOldBackupsAsync(backupDir);

                return backupPath;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating backup");
                throw;
            }
        }

        public async Task<List<BackupInfo>> GetBackupsAsync()
        {
            var backupDir = Path.Combine(_environment.ContentRootPath, "Backups");
            if (!Directory.Exists(backupDir))
                return new List<BackupInfo>();

            var backups = Directory.GetFiles(backupDir, "backup_*.zip")
                .Select(f => new BackupInfo
                {
                    Name = Path.GetFileName(f),
                    Size = new FileInfo(f).Length,
                    Created = new FileInfo(f).CreationTime,
                    Path = f
                })
                .OrderByDescending(f => f.Created)
                .ToList();

            return await Task.FromResult(backups);
        }

        public async Task<bool> DownloadBackupAsync(string backupName, Stream outputStream)
        {
            try
            {
                var backupPath = Path.Combine(_environment.ContentRootPath, "Backups", backupName);
                if (!File.Exists(backupPath))
                    return false;

                using var fileStream = new FileStream(backupPath, FileMode.Open, FileAccess.Read);
                await fileStream.CopyToAsync(outputStream);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading backup");
                return false;
            }
        }

        private string FindDatabaseFile()
        {
            var possiblePaths = new[]
            {
                Path.Combine(_environment.ContentRootPath, "data", "construction.db"),
                Path.Combine(_environment.ContentRootPath, "construction.db"),
                Path.Combine(Directory.GetCurrentDirectory(), "construction.db"),
                Path.Combine(AppContext.BaseDirectory, "construction.db")
            };

            return possiblePaths.FirstOrDefault(File.Exists) ?? possiblePaths[0];
        }

        private async Task CleanOldBackupsAsync(string backupDir)
        {
            var retentionCount = _configuration.GetValue<int>("Backup:RetentionCount", 10);
            var oldBackups = Directory.GetFiles(backupDir, "backup_*.zip")
                .OrderByDescending(f => new FileInfo(f).CreationTime)
                .Skip(retentionCount);

            foreach (var oldBackup in oldBackups)
            {
                try
                {
                    File.Delete(oldBackup);
                    _logger.LogInformation($"Old backup deleted: {oldBackup}");
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, $"Failed to delete old backup: {oldBackup}");
                }
            }

            await Task.CompletedTask;
        }
    }

    public class BackupInfo
    {
        public string Name { get; set; } = string.Empty;
        public long Size { get; set; }
        public DateTime Created { get; set; }
        public string Path { get; set; } = string.Empty;
    }
}