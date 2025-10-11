using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AttachmentsController : ControllerBase
{
    private readonly IAttachmentService _attachmentService;

    public AttachmentsController(IAttachmentService attachmentService)
    {
        _attachmentService = attachmentService;
    }

    [HttpPost("{defectId}")]
    public async Task<ActionResult<Attachment>> UploadAttachment(string defectId, [FromForm] IFormFile file)
    {
        try
        {
            var attachment = await _attachmentService.UploadAttachmentAsync(defectId, file);
            return Ok(attachment);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> DownloadAttachment(string id)
    {
        try
        {
            var (data, contentType, fileName) = await _attachmentService.DownloadAttachmentAsync(id);
            return File(data, contentType, fileName);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAttachment(string id)
    {
        try
        {
            await _attachmentService.DeleteAttachmentAsync(id);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("defect/{defectId}")]
    public async Task<ActionResult<List<Attachment>>> GetDefectAttachments(string defectId)
    {
        var attachments = await _attachmentService.GetDefectAttachmentsAsync(defectId);
        return Ok(attachments);
    }
}

// Models/CreateAttachmentDto.cs
public class CreateAttachmentDto
{
    public IFormFile File { get; set; } = null!;
    public string DefectId { get; set; } = string.Empty;
}