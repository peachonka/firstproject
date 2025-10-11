using Microsoft.EntityFrameworkCore;
namespace Backend.Services;
using Backend.Models;
using Backend.Data;
public class AttachmentService : IAttachmentService
{
    private readonly ApplicationDbContext _context;

    public AttachmentService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Attachment> UploadAttachmentAsync(string defectId, IFormFile file)
    {
        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream);

        var attachment = new Attachment
        {
            Id = Guid.NewGuid().ToString(),
            FileName = file.FileName,
            ContentType = file.ContentType,
            Size = file.Length,
            Data = memoryStream.ToArray(),
            DefectId = defectId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Attachments.Add(attachment);
        await _context.SaveChangesAsync();

        return attachment;
    }

    public async Task<(byte[] Data, string ContentType, string FileName)> DownloadAttachmentAsync(string id)
    {
        var attachment = await _context.Attachments.FindAsync(id);
        if (attachment == null)
            throw new ArgumentException("Attachment not found");

        return (attachment.Data, attachment.ContentType, attachment.FileName);
    }

    public async Task DeleteAttachmentAsync(string id)
    {
        var attachment = await _context.Attachments.FindAsync(id);
        if (attachment != null)
        {
            _context.Attachments.Remove(attachment);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<List<Attachment>> GetDefectAttachmentsAsync(string defectId)
    {
        return await _context.Attachments
            .Where(a => a.DefectId == defectId)
            .ToListAsync();
    }
}