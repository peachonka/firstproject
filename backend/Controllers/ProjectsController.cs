// Controllers/ProjectsController.cs

using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Services;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Project>>> GetAllProjects()
    {
        var projects = await _projectService.GetAllProjectsAsync();
        return Ok(projects);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Project>> GetProject(string id)
    {
        var project = await _projectService.GetProjectAsync(id);
        if (project == null)
            return NotFound();

        return Ok(project);
    }

    [HttpPost]
    public async Task<ActionResult<Project>> CreateProject([FromBody] Project project)
    {
        var createdProject = await _projectService.AddProjectAsync(project);
        return CreatedAtAction(nameof(GetProject), new { id = createdProject.Id }, createdProject);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProject(string id, [FromBody] Project project)
    {
        try
        {
            await _projectService.UpdateProjectAsync(id, project);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProject(string id)
    {
        await _projectService.DeleteProjectAsync(id);
        return NoContent();
    }
}