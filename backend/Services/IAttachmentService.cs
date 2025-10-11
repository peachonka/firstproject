// Services/IAttachmentService.cs
namespace Backend.Services;

using Backend.Models;
public interface IAttachmentService
{
    Task<Attachment> UploadAttachmentAsync(string defectId, IFormFile file);
    Task<(byte[] Data, string ContentType, string FileName)> DownloadAttachmentAsync(string id);
    Task DeleteAttachmentAsync(string id);
    Task<List<Attachment>> GetDefectAttachmentsAsync(string defectId);
}