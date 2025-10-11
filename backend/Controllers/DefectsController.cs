// Controllers/DefectsController.cs
using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Services;
using System.ComponentModel.DataAnnotations;

[ApiController]
[Route("api/[controller]")]
public class DefectsController : ControllerBase
{
    private readonly IDefectService _defectService;

    public DefectsController(IDefectService defectService)
    {
        _defectService = defectService;
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
    public async Task<IActionResult> UpdateDefect(string id, [FromBody] Defect defect)
    {
        try
        {
            await _defectService.UpdateDefectAsync(id, defect);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
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
}

public class CommentRequest
{
    public string Content { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
}

// CreateDefectDto.cs
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