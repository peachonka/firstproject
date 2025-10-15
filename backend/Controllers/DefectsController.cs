// Controllers/DefectsController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Services;
using Backend.Data;
using System.ComponentModel.DataAnnotations;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DefectsController : ControllerBase
    {
        private readonly IDefectService _defectService;
        private readonly ApplicationDbContext _context;

        public DefectsController(IDefectService defectService, ApplicationDbContext context)
        {
            _defectService = defectService;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<Defect>>> GetAllDefects()
        {
            var defects = await _defectService.GetAllDefectsAsync();
            return Ok(defects);
        }

        [HttpGet("project/{projectId}")]
        public async Task<ActionResult<List<Defect>>> GetDefectsByProject(string projectId)
        {
            var defects = await _defectService.GetDefectsByProjectAsync(projectId);
            return Ok(defects);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Defect>> GetDefect(string id)
        {
            var defect = await _defectService.GetDefectAsync(id);
            if (defect == null)
                return NotFound();

            return Ok(defect);
        }

        [HttpPost]
        public async Task<ActionResult<Defect>> CreateDefect([FromBody] CreateDefectDto dto)
        {
            var defect = new Defect
            {
                Id = Guid.NewGuid().ToString(),
                Title = dto.Title,
                Description = dto.Description,
                Status = (DefectStatus)dto.Status,
                Priority = (DefectPriority)dto.Priority,
                ProjectId = dto.ProjectId,
                PhaseId = dto.PhaseId,
                AssigneeId = dto.AssigneeId,
                ReporterId = dto.ReporterId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                DueDate = dto.DueDate != null ? DateTime.Parse(dto.DueDate) : null,
                Attachments = new List<Attachment>(),
                Comments = new List<Comment>()
            };

            var createdDefect = await _defectService.AddDefectAsync(defect);
            return CreatedAtAction(nameof(GetDefect), new { id = createdDefect.Id }, createdDefect);
        }

        [HttpPut("{id}")]
public async Task<IActionResult> UpdateDefect(string id, [FromBody] UpdateDefectDto dto)
{
    try
    {
        // Получаем дефект через контекст, а не через сервис
        var existingDefect = await _context.Defects.FindAsync(id);
        if (existingDefect == null)
            return NotFound($"Defect with id {id} not found");

        // Сохраняем изменения для истории
        var changes = new List<(string field, string oldValue, string newValue)>();

        // Обновляем только переданные поля
        if (dto.Title != null && existingDefect.Title != dto.Title)
        {
            changes.Add(("Title", existingDefect.Title, dto.Title));
            existingDefect.Title = dto.Title;
        }
        
        if (dto.Description != null && existingDefect.Description != dto.Description)
        {
            changes.Add(("Description", existingDefect.Description ?? "", dto.Description));
            existingDefect.Description = dto.Description;
        }
        
        if (dto.Status.HasValue && existingDefect.Status != (DefectStatus)dto.Status.Value)
        {
            changes.Add(("Status", existingDefect.Status.ToString(), ((DefectStatus)dto.Status.Value).ToString()));
            existingDefect.Status = (DefectStatus)dto.Status.Value;
        }
        
        if (dto.Priority.HasValue && existingDefect.Priority != (DefectPriority)dto.Priority.Value)
        {
            changes.Add(("Priority", existingDefect.Priority.ToString(), ((DefectPriority)dto.Priority.Value).ToString()));
            existingDefect.Priority = (DefectPriority)dto.Priority.Value;
        }
        
        if (dto.ProjectId != null && existingDefect.ProjectId != dto.ProjectId)
        {
            changes.Add(("ProjectId", existingDefect.ProjectId, dto.ProjectId));
            existingDefect.ProjectId = dto.ProjectId;
        }
        
        if (dto.PhaseId != null && existingDefect.PhaseId != dto.PhaseId)
        {
            changes.Add(("PhaseId", existingDefect.PhaseId ?? "", dto.PhaseId));
            existingDefect.PhaseId = dto.PhaseId;
        }
        
        if (dto.AssigneeId != null && existingDefect.AssigneeId != dto.AssigneeId)
        {
            changes.Add(("AssigneeId", existingDefect.AssigneeId ?? "", dto.AssigneeId));
            existingDefect.AssigneeId = dto.AssigneeId;
        }
        
        if (dto.DueDate != null)
        {
            var newDueDate = DateTime.Parse(dto.DueDate);
            if (existingDefect.DueDate != newDueDate)
            {
                changes.Add(("DueDate", existingDefect.DueDate?.ToString("yyyy-MM-dd") ?? "", newDueDate.ToString("yyyy-MM-dd")));
                existingDefect.DueDate = newDueDate;
            }
        }

        existingDefect.UpdatedAt = DateTime.UtcNow;

        // Сохраняем изменения
        await _context.SaveChangesAsync();

        // Добавляем записи в историю изменений
        foreach (var change in changes)
        {
            var history = new DefectHistory
            {
                Id = Guid.NewGuid().ToString(),
                DefectId = id,
                FieldName = change.field,
                OldValue = change.oldValue,
                NewValue = change.newValue,
                ChangedBy = "current-user-id", // TODO: Замените на реального пользователя
                ChangedByName = "Current User", // TODO: Замените на реальное имя
                ChangedAt = DateTime.UtcNow
            };
            _context.DefectHistories.Add(history);
        }

        if (changes.Any())
        {
            await _context.SaveChangesAsync();
        }

        return NoContent();
    }
    catch (DbUpdateException ex)
    {
        return BadRequest($"Database error: {ex.Message}");
    }
    catch (Exception ex)
    {
        return BadRequest($"Error updating defect: {ex.Message}");
    }
}

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDefect(string id)
        {
            await _defectService.DeleteDefectAsync(id);
            return NoContent();
        }

        [HttpPost("{defectId}/comments")]
        public async Task<IActionResult> AddComment(string defectId, [FromBody] CommentRequest request)
        {
            try
            {
                await _defectService.AddCommentAsync(defectId, request.Content, request.UserId, request.UserName);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet("{id}/history")]
        public async Task<ActionResult<IEnumerable<DefectHistory>>> GetDefectHistory(string id)
        {
            var history = await _context.DefectHistories
                .Where(h => h.DefectId == id)
                .OrderByDescending(h => h.ChangedAt)
                .ToListAsync();

            return Ok(history);
        }

        [HttpPost("history")]
        public async Task<ActionResult> AddDefectHistory([FromBody] CreateDefectHistoryRequest request)
        {
            var history = new DefectHistory
            {
                Id = Guid.NewGuid().ToString(),
                DefectId = request.DefectId,
                FieldName = request.FieldName,
                OldValue = request.OldValue,
                NewValue = request.NewValue,
                ChangedBy = request.ChangedBy,
                ChangedByName = request.ChangedByName,
                ChangedAt = DateTime.UtcNow
            };

            _context.DefectHistories.Add(history);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }

    public class CommentRequest
    {
        public string Content { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
    }

    public class CreateDefectDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public int Status { get; set; }

        [Required]
        public int Priority { get; set; }

        [Required]
        public string ProjectId { get; set; } = string.Empty;

        public string? PhaseId { get; set; }

        [Required]
        public string AssigneeId { get; set; } = string.Empty;

        [Required]
        public string ReporterId { get; set; } = string.Empty;

        public string? DueDate { get; set; }
    }

    public class CreateDefectHistoryRequest
    {
        public string DefectId { get; set; } = string.Empty;
        public string FieldName { get; set; } = string.Empty;
        public string OldValue { get; set; } = string.Empty;
        public string NewValue { get; set; } = string.Empty;
        public string ChangedBy { get; set; } = string.Empty;
        public string ChangedByName { get; set; } = string.Empty;
    }
}

public class UpdateDefectDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public int? Status { get; set; }
    public int? Priority { get; set; }
    public string? ProjectId { get; set; }
    public string? PhaseId { get; set; }
    public string? AssigneeId { get; set; }
    public string? DueDate { get; set; }
}