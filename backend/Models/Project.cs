// Models/Project.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Backend.Models;

public class Project
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;
    
    [Required]
    public ProjectStatus Status { get; set; }
    
    [Required]
    public DateTime StartDate { get; set; }
    
    public DateTime? EndDate { get; set; }
    
    [JsonIgnore]
    public virtual ICollection<Phase> Phases { get; set; } = new List<Phase>();
    
    [JsonIgnore]
    public virtual ICollection<Defect> Defects { get; set; } = new List<Defect>();
}