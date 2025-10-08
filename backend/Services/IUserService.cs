// Services/IUserService.cs
using Microsoft.EntityFrameworkCore;
namespace Backend.Services;

using Backend.Models;
using Backend.Data;

public interface IUserService
{
    Task<User?> LoginAsync(string email, string password);
    Task<User?> GetUserAsync(string id);
    Task<List<User>> GetAllUsersAsync();
}