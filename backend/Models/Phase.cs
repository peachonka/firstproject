// Models/Phase.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Backend.Models;

public class Phase
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [ForeignKey("Project")]
    public string ProjectId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;
    
    [Required]
    public DateTime StartDate { get; set; }
    
    public DateTime? EndDate { get; set; }
    
    [Required]
    public PhaseStatus Status { get; set; }
    
    [JsonIgnore]
    public virtual Project Project { get; set; } = null!;
    
    [JsonIgnore]
    public virtual ICollection<Defect> Defects { get; set; } = new List<Defect>();
}