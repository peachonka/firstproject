// Models/DefectHistory.cs
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class DefectHistory
    {
        [Key]
        public string Id { get; set; } = string.Empty;
        
        [Required]
        public string DefectId { get; set; } = string.Empty;
        
        [Required]
        public string FieldName { get; set; } = string.Empty;
        
        public string OldValue { get; set; } = string.Empty;
        public string NewValue { get; set; } = string.Empty;
        
        [Required]
        public string ChangedBy { get; set; } = string.Empty;
        
        [Required]
        public string ChangedByName { get; set; } = string.Empty;
        
        [Required]
        public DateTime ChangedAt { get; set; }
    }

    public class CreateDefectHistoryRequest
    {
        public string DefectId { get; set; } = string.Empty;
        public string FieldName { get; set; } = string.Empty;
        public string OldValue { get; set; } = string.Empty;
        public string NewValue { get; set; } = string.Empty;
        public string ChangedBy { get; set; } = string.Empty;
        public string ChangedByName { get; set; } = string.Empty;
    }
}