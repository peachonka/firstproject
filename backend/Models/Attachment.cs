// Models/Attachment.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Backend.Models;

public class Attachment
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [ForeignKey("Defect")]
    public string DefectId { get; set; } = string.Empty;
    
    [Required]
    public string FileName { get; set; } = string.Empty;
    
    [Required]
    public string ContentType { get; set; } = string.Empty;
    
    [Required]
    public long Size { get; set; }
    
    [Required]
    public DateTime CreatedAt { get; set; }
    
    // Добавляем свойство для хранения данных файла
    public byte[] Data { get; set; } = Array.Empty<byte>();
    
    // Navigation property
    [JsonIgnore]
    public virtual Defect Defect { get; set; } = null!;
}