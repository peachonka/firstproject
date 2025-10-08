// Services/IProjectService.cs
using Microsoft.EntityFrameworkCore;
namespace Backend.Services;

using Backend.Models;
using Backend.Data;

public interface IProjectService
{
    Task<Project> AddProjectAsync(Project project);
    Task UpdateProjectAsync(string id, Project updatedProject);
    Task<Project?> GetProjectAsync(string id);
    Task<List<Project>> GetAllProjectsAsync();
    Task DeleteProjectAsync(string id);
}