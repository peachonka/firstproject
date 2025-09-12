// Models/Defect.cs
namespace Backend.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Defect
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;
    
    [Required]
    public DefectStatus Status { get; set; }
    
    [Required]
    public DefectPriority Priority { get; set; }
    
    [Required]
    [ForeignKey("Project")]
    public string ProjectId { get; set; } = string.Empty;
    
    [ForeignKey("Phase")]
    public string? PhaseId { get; set; }
    
    [Required]
    [ForeignKey("User")]
    public string AssigneeId { get; set; } = string.Empty;
    
    [Required]
    [ForeignKey("User")]
    public string ReporterId { get; set; } = string.Empty;
    
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [Required]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? DueDate { get; set; }
    
    public virtual ICollection<string> Attachments { get; set; } = new List<string>();
    
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
    
    public virtual Project Project { get; set; } = null!;
    public virtual Phase? Phase { get; set; }
    public virtual User Assignee { get; set; } = null!;
    public virtual User Reporter { get; set; } = null!;
}