// Models/Enums.cs
namespace Backend.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public enum DefectStatus
{
    New,
    InProgress,
    UnderReview,
    Closed,
    Cancelled
}

public enum DefectPriority
{
    Low,
    Medium,
    High,
    Critical
}

public enum ProjectStatus
{
    Active,
    Completed,
    Paused
}

public enum PhaseStatus
{
    Planned,
    Active,
    Completed
}

public enum UserRole
{
    Manager,
    Engineer,
    Observer
}