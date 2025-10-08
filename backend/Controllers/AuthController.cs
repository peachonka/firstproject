using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;

    public AuthController(IUserService userService)
    {
        _userService = userService;
    }

    // POST: api/auth/login
    [HttpPost("login")]
    public async Task<ActionResult<User>> Login([FromBody] LoginRequest request)
    {
        try
        {
            var user = await _userService.LoginAsync(request.Email, request.Password);
            if (user == null)
                return Unauthorized(new { message = "Invalid credentials" });

            return Ok(user);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in Login: {ex.Message}");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    // GET: api/auth/users
    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        try
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetUsers: {ex.Message}");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    // GET: api/auth/users/{id}
    [HttpGet("users/{id}")]
    public async Task<ActionResult<User>> GetUser(string id)
    {
        try
        {
            var user = await _userService.GetUserAsync(id);
            if (user == null)
                return NotFound();

            return Ok(user);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetUser: {ex.Message}");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}