using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Data;

namespace Backend.Services;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;

    public UserService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<User?> LoginAsync(string email, string password)
    {
        // Для демо - проверяем email и пароль "password"
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);
            
        if (user != null && password == "password")
        {
            return user;
        }
        
        return null;
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