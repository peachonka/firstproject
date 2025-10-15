// Models/Defect.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;


namespace Backend.Models;

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
    [ForeignKey("Assignee")]
    public string AssigneeId { get; set; } = string.Empty;
    
    [Required]
    [ForeignKey("Reporter")]
    public string ReporterId { get; set; } = string.Empty;
    
    [Required]
    public DateTime CreatedAt { get; set; }
    
    [Required]
    public DateTime UpdatedAt { get; set; }
    
    public DateTime? DueDate { get; set; }
    
    // Navigation properties
    [JsonIgnore]
    public virtual Project Project { get; set; } = null!;
    
    [JsonIgnore]
    public virtual Phase? Phase { get; set; }
    
    [JsonIgnore]
    public virtual User Assignee { get; set; } = null!;
    
    [JsonIgnore]
    public virtual User Reporter { get; set; } = null!;
    
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public virtual ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
    
    [JsonIgnore]
    public virtual ICollection<DefectHistory> History { get; set; } = new List<DefectHistory>();
}