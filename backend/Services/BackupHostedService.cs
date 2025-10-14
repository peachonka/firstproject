using Microsoft.Extensions.Hosting;

namespace Backend.Services
{
    public class BackupHostedService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<BackupHostedService> _logger;
        private readonly IConfiguration _configuration;

        public BackupHostedService(IServiceProvider serviceProvider, ILogger<BackupHostedService> logger, IConfiguration configuration)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _configuration = configuration;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // Ждем запуска приложения
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

            _logger.LogInformation("Backup Hosted Service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    if (!_configuration.GetValue<bool>("Backup:AutoBackupEnabled", true))
                    {
                        _logger.LogInformation("Auto backup is disabled");
                        await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
                        continue;
                    }

                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var backupService = scope.ServiceProvider.GetRequiredService<IBackupService>();
                        
                        _logger.LogInformation("Starting automatic backup...");
                        var backupPath = await backupService.CreateBackupAsync();
                        
                        _logger.LogInformation($"Automatic backup completed: {backupPath}");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error creating automatic backup");
                }

                // Бэкап каждые 24 часа
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }
    }
}