// Services/DefectService.cs
using Microsoft.EntityFrameworkCore;
namespace Backend.Services;

using Backend.Models;
using Backend.Data;


public class DefectService : IDefectService
{
    private readonly ApplicationDbContext _context;

    public DefectService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Defect> AddDefectAsync(Defect defect)
    {
        // defect.Id = Guid.NewGuid().ToString();
        // defect.CreatedAt = DateTime.UtcNow;
        // defect.UpdatedAt = DateTime.UtcNow;

        _context.Defects.Add(defect);
        await _context.SaveChangesAsync();
        return defect;
    }

    // Services/DefectService.cs
public async Task UpdateDefectAsync(string id, Defect defect)
{
    var existingDefect = await _context.Defects.FindAsync(id);
    if (existingDefect == null)
        throw new ArgumentException($"Defect with id {id} not found");

    // Обновляем поля
    existingDefect.Title = defect.Title;
    existingDefect.Description = defect.Description;
    existingDefect.Status = defect.Status;
    existingDefect.Priority = defect.Priority;
    existingDefect.ProjectId = defect.ProjectId;
    existingDefect.PhaseId = defect.PhaseId;
    existingDefect.AssigneeId = defect.AssigneeId;
    existingDefect.DueDate = defect.DueDate;
    existingDefect.UpdatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();
}

   public async Task<List<Defect>> GetAllDefectsAsync()
{
    return await _context.Defects
        .Include(d => d.Project)
        .Include(d => d.Phase)
        .Include(d => d.Assignee)
        .Include(d => d.Reporter)
        .Include(d => d.Comments)
        .Include(d => d.Attachments)
        .ToListAsync();
}

    public async Task<Defect?> GetDefectAsync(string id)
    {
        return await _context.Defects
            .Include(d => d.Project)
            .Include(d => d.Phase)
            .Include(d => d.Assignee)
            .Include(d => d.Reporter)
            .Include(d => d.Comments)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<List<Defect>> GetDefectsByProjectAsync(string projectId)
    {
        return await _context.Defects
            .Include(d => d.Project)
            .Include(d => d.Phase)
            .Include(d => d.Assignee)
            .Include(d => d.Reporter)
            .Include(d => d.Comments)
            .Where(d => d.ProjectId == projectId)
            .ToListAsync();
    }

    public async Task DeleteDefectAsync(string id)
    {
        var defect = await _context.Defects.FindAsync(id);
        if (defect != null)
        {
            _context.Defects.Remove(defect);
            await _context.SaveChangesAsync();
        }
    }

    public async Task AddCommentAsync(string defectId, string content, string userId, string userName)
    {
        var comment = new Comment
        {
            Id = Guid.NewGuid().ToString(),
            DefectId = defectId,
            UserId = userId,
            UserName = userName,
            Content = content,
            CreatedAt = DateTime.UtcNow
        };

        _context.Comments.Add(comment);

        var defect = await _context.Defects.FindAsync(defectId);
        if (defect != null)
        {
            defect.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }
}