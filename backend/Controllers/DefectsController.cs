// Controllers/DefectsController.cs
using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Services;

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
    public async Task<ActionResult<Defect>> CreateDefect([FromBody] Defect defect)
    {
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