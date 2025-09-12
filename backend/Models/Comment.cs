// Models/Comment.cs
namespace Backend.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Comment
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [ForeignKey("Defect")]
    public string DefectId { get; set; } = string.Empty;
    
    [Required]
    [ForeignKey("User")]
    public string UserId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string UserName { get; set; } = string.Empty;
    
    [Required]
    public string Content { get; set; } = string.Empty;
    
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public virtual Defect Defect { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}