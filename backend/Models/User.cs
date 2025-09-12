// Models/User.cs
namespace Backend.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class User
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    public UserRole Role { get; set; }
    
    public string? Avatar { get; set; }
    
    public virtual ICollection<Defect> AssignedDefects { get; set; } = new List<Defect>();
    public virtual ICollection<Defect> ReportedDefects { get; set; } = new List<Defect>();
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
}