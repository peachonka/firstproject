// Models/Defect.cs
namespace Backend.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

public class Attachment
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    public string FileName { get; set; } = string.Empty;
    
    [Required]
    public string ContentType { get; set; } = string.Empty;
    
    [Required]
    public byte[] Data { get; set; } = Array.Empty<byte>();
    
    public long Size { get; set; }
    
    [Required]
    [ForeignKey("Defect")]
    public string DefectId { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public virtual Defect Defect { get; set; } = null!;
}

public class Defect
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    [Required]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public DefectStatus Status { get; set; }

    [Required]
    [JsonConverter(typeof(JsonStringEnumConverter))]
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

    public virtual ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();

    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public virtual Project Project { get; set; } = null!;
    public virtual Phase? Phase { get; set; }
    public virtual User Assignee { get; set; } = null!;
    public virtual User Reporter { get; set; } = null!;
}