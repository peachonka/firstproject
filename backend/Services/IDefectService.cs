// Services/IDefectService.cs
using Microsoft.EntityFrameworkCore;
namespace Backend.Services;
using Backend.Models;

public interface IDefectService
{
    Task<Defect> AddDefectAsync(Defect defect);
    Task UpdateDefectAsync(string id, Defect updatedDefect);
    Task<Defect?> GetDefectAsync(string id);
    Task<List<Defect>> GetAllDefectsAsync();
    Task<List<Defect>> GetDefectsByProjectAsync(string projectId);
    Task DeleteDefectAsync(string id);
    Task AddCommentAsync(string defectId, string content, string userId, string userName);
}