using Backend.Models;

namespace Backend.Services;

public interface IUserService
{
    Task<User?> LoginAsync(string email, string password);
    Task<User?> GetUserAsync(string id);
    Task<List<User>> GetAllUsersAsync();
}