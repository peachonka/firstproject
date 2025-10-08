// Services/ProjectService.cs
using Microsoft.EntityFrameworkCore;
namespace Backend.Services;

using Backend.Models;
using Backend.Data;

public class ProjectService : IProjectService
{
    private readonly ApplicationDbContext _context;

    public ProjectService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Project> AddProjectAsync(Project project)
    {
        project.Id = Guid.NewGuid().ToString();

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();
        return project;
    }

    public async Task UpdateProjectAsync(string id, Project updatedProject)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project == null)
            throw new ArgumentException("Project not found");

        project.Name = updatedProject.Name;
        project.Description = updatedProject.Description;
        project.Status = updatedProject.Status;
        project.StartDate = updatedProject.StartDate;
        project.EndDate = updatedProject.EndDate;

        await _context.SaveChangesAsync();
    }

    public async Task<Project?> GetProjectAsync(string id)
    {
        return await _context.Projects
            .Include(p => p.Phases)
            // .Include(p => p.Defects)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<List<Project>> GetAllProjectsAsync()
    {
        return await _context.Projects
            .Include(p => p.Phases)
            // .Include(p => p.Defects)
            .ToListAsync();
    }

    public async Task DeleteProjectAsync(string id)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project != null)
        {
            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
        }
    }
}