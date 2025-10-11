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

    public async Task UpdateDefectAsync(string id, Defect updatedDefect)
    {
        var defect = await _context.Defects.FindAsync(id);
        if (defect == null)
            throw new ArgumentException("Defect not found");

        defect.Title = updatedDefect.Title;
        defect.Description = updatedDefect.Description;
        defect.Status = updatedDefect.Status;
        defect.Priority = updatedDefect.Priority;
        defect.ProjectId = updatedDefect.ProjectId;
        defect.PhaseId = updatedDefect.PhaseId;
        defect.AssigneeId = updatedDefect.AssigneeId;
        defect.DueDate = updatedDefect.DueDate;
        defect.Attachments = updatedDefect.Attachments;
        defect.UpdatedAt = DateTime.UtcNow;

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