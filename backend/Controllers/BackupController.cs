using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Backend.Services;

[ApiController]
[Route("api/[controller]")]
public class BackupController : ControllerBase
{
    private readonly IBackupService _backupService;
    private readonly ILogger<BackupController> _logger;

    public BackupController(IBackupService backupService, ILogger<BackupController> logger)
    {
        _backupService = backupService;
        _logger = logger;
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreateBackup()
    {
        try
        {
            _logger.LogInformation("Creating backup...");
            var backupPath = await _backupService.CreateBackupAsync();
            
            return Ok(new { 
                message = "Backup created successfully", 
                path = backupPath,
                fileName = Path.GetFileName(backupPath)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating backup");
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("list")]
    public async Task<IActionResult> GetBackups()
    {
        try
        {
            var backups = await _backupService.GetBackupsAsync();
            return Ok(backups);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting backups list");
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("download/{backupName}")]
    public async Task<IActionResult> DownloadBackup(string backupName)
    {
        try
        {
            // Проверяем безопасность имени файла
            if (backupName.Contains("..") || !backupName.StartsWith("backup_") || !backupName.EndsWith(".zip"))
            {
                return BadRequest("Invalid backup name");
            }

            var memoryStream = new MemoryStream();
            var success = await _backupService.DownloadBackupAsync(backupName, memoryStream);
            
            if (!success)
            {
                return NotFound("Backup file not found");
            }

            memoryStream.Position = 0;

            // Определяем Content-Type
            var provider = new FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(backupName, out var contentType))
            {
                contentType = "application/zip";
            }

            return File(memoryStream, contentType, backupName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading backup");
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{backupName}")]
    public async Task<IActionResult> DeleteBackup(string backupName)
    {
        try
        {
            // Проверяем безопасность имени файла
            if (backupName.Contains("..") || !backupName.StartsWith("backup_") || !backupName.EndsWith(".zip"))
            {
                return BadRequest("Invalid backup name");
            }

            var backupDir = Path.Combine(Directory.GetCurrentDirectory(), "Backups");
            var backupPath = Path.Combine(backupDir, backupName);

            if (!System.IO.File.Exists(backupPath))
            {
                return NotFound("Backup file not found");
            }

            System.IO.File.Delete(backupPath);
            _logger.LogInformation($"Backup deleted: {backupName}");

            return Ok(new { message = "Backup deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting backup");
            return BadRequest(new { error = ex.Message });
        }
    }
}