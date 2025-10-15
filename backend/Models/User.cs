// Models/User.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Backend.Models;

public class User
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    public UserRole Role { get; set; }
    
    public string? Avatar { get; set; }
    
    // Navigation properties
    [JsonIgnore]
    public virtual ICollection<Defect> AssignedDefects { get; set; } = new List<Defect>();
    
    [JsonIgnore]
    public virtual ICollection<Defect> ReportedDefects { get; set; } = new List<Defect>();
    
    [JsonIgnore]
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
}