// Services/UserService.cs
using Microsoft.EntityFrameworkCore;
namespace Backend.Services;
using Backend.Models;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;

    public UserService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<User?> LoginAsync(string email, string password)
    {
        // В реальном приложении здесь должна быть проверка хеша пароля
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email && password == "password");
    }

    public async Task<User?> GetUserAsync(string id)
    {
        return await _context.Users.FindAsync(id);
    }

    public async Task<List<User>> GetAllUsersAsync()
    {
        return await _context.Users.ToListAsync();
    }
}