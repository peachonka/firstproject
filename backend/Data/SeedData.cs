using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public static class SeedData
{
    public static async Task Initialize(ApplicationDbContext context)
    {
        // Сначала очистим базу (опционально)
        context.Users.RemoveRange(context.Users);
        context.Projects.RemoveRange(context.Projects);
        context.Defects.RemoveRange(context.Defects);
        context.Comments.RemoveRange(context.Comments);
        context.Phases.RemoveRange(context.Phases);
        await context.SaveChangesAsync();

        // Добавляем пользователей
        if (!context.Users.Any())
        {
            var users = new List<User>
            {
                new User 
                { 
                    Id = "1", 
                    Email = "manager@construction.ru", 
                    Name = "Анна Петрова", 
                    Role = UserRole.Manager,
                    Avatar = null
                },
                new User 
                { 
                    Id = "2", 
                    Email = "engineer@construction.ru", 
                    Name = "Дмитрий Иванов", 
                    Role = UserRole.Engineer,
                    Avatar = null
                },
                new User 
                { 
                    Id = "3", 
                    Email = "observer@construction.ru", 
                    Name = "Елена Сидорова", 
                    Role = UserRole.Observer,
                    Avatar = null
                }
            };
            
            await context.Users.AddRangeAsync(users);
            await context.SaveChangesAsync();
        }

        // Добавляем проекты и фазы
        if (!context.Projects.Any())
        {
            var projects = new List<Project>
            {
                new Project
                {
                    Id = "1",
                    Name = "ЖК \"Северный\"",
                    Description = "Жилой комплекс на 300 квартир",
                    Status = ProjectStatus.Active,
                    StartDate = new DateTime(2024, 1, 15),
                    Phases = new List<Phase>
                    {
                        new Phase
                        {
                            Id = "1-1",
                            ProjectId = "1",
                            Name = "Фундамент",
                            Description = "Возведение фундамента",
                            StartDate = new DateTime(2024, 1, 15),
                            Status = PhaseStatus.Completed
                        },
                        new Phase
                        {
                            Id = "1-2",
                            ProjectId = "1",
                            Name = "Стены и перекрытия",
                            Description = "Строительство несущих конструкций",
                            StartDate = new DateTime(2024, 3, 1),
                            Status = PhaseStatus.Active
                        }
                    }
                },
                new Project
                {
                    Id = "2",
                    Name = "Торговый центр \"Алмаз\"",
                    Description = "Торговый комплекс площадью 15000 м²",
                    Status = ProjectStatus.Active,
                    StartDate = new DateTime(2024, 2, 1),
                    Phases = new List<Phase>
                    {
                        new Phase
                        {
                            Id = "2-1",
                            ProjectId = "2",
                            Name = "Каркас",
                            Description = "Металлический каркас здания",
                            StartDate = new DateTime(2024, 2, 1),
                            Status = PhaseStatus.Active
                        }
                    }
                }
            };
            
            await context.Projects.AddRangeAsync(projects);
            await context.SaveChangesAsync();
        }

        // Добавляем дефекты и комментарии
        if (!context.Defects.Any())
        {
            var defects = new List<Defect>
            {
                new Defect
                {
                    Id = "1",
                    Title = "Трещина в бетонной плите",
                    Description = "Обнаружена трещина длиной 50 см в плите перекрытия на 3 этаже",
                    Status = DefectStatus.New,
                    Priority = DefectPriority.High,
                    ProjectId = "1",
                    PhaseId = "1-2",
                    AssigneeId = "2", // Инженер
                    ReporterId = "3", // Наблюдатель
                    CreatedAt = DateTime.Parse("2024-12-20T09:30:00Z"),
                    UpdatedAt = DateTime.Parse("2024-12-20T09:30:00Z"),
                    DueDate = DateTime.Parse("2024-12-25T18:00:00Z"),
                    Attachments = new List<string>(),
                    Comments = new List<Comment>()
                },
                new Defect
                {
                    Id = "2",
                    Title = "Неправильная укладка арматуры",
                    Description = "Арматура уложена с нарушением проектных требований",
                    Status = DefectStatus.InProgress,
                    Priority = DefectPriority.Critical,
                    ProjectId = "1",
                    PhaseId = "1-2",
                    AssigneeId = "2", // Инженер
                    ReporterId = "1", // Менеджер
                    CreatedAt = DateTime.Parse("2024-12-19T14:15:00Z"),
                    UpdatedAt = DateTime.Parse("2024-12-20T11:20:00Z"),
                    DueDate = DateTime.Parse("2024-12-22T18:00:00Z"),
                    Attachments = new List<string>(),
                    Comments = new List<Comment>
                    {
                        new Comment
                        {
                            Id = "1",
                            DefectId = "2",
                            UserId = "2",
                            UserName = "Дмитрий Иванов",
                            Content = "Начинаю исправление дефекта. Потребуется дополнительная арматура.",
                            CreatedAt = DateTime.Parse("2024-12-20T11:20:00Z")
                        }
                    }
                }
            };
            
            await context.Defects.AddRangeAsync(defects);
            await context.SaveChangesAsync();
        }
    }
}