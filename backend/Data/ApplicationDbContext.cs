// Data/ApplicationDbContext.cs
using Microsoft.EntityFrameworkCore;
using Backend.Models;
namespace Backend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }
    
    public DbSet<Project> Projects { get; set; }
    public DbSet<Phase> Phases { get; set; }
    public DbSet<Defect> Defects { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Attachment> Attachments { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Конфигурация отношений
        modelBuilder.Entity<Defect>()
            .HasOne(d => d.Project)
            .WithMany(p => p.Defects)
            .HasForeignKey(d => d.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);
            
        modelBuilder.Entity<Defect>()
            .HasOne(d => d.Phase)
            .WithMany(p => p.Defects)
            .HasForeignKey(d => d.PhaseId)
            .OnDelete(DeleteBehavior.SetNull);
            
        modelBuilder.Entity<Defect>()
            .HasOne(d => d.Assignee)
            .WithMany(u => u.AssignedDefects)
            .HasForeignKey(d => d.AssigneeId)
            .OnDelete(DeleteBehavior.Restrict);
            
        modelBuilder.Entity<Defect>()
            .HasOne(d => d.Reporter)
            .WithMany(u => u.ReportedDefects)
            .HasForeignKey(d => d.ReporterId)
            .OnDelete(DeleteBehavior.Restrict);
            
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.Defect)
            .WithMany(d => d.Comments)
            .HasForeignKey(c => c.DefectId)
            .OnDelete(DeleteBehavior.Cascade);
            
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.User)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);
            
        modelBuilder.Entity<Phase>()
            .HasOne(p => p.Project)
            .WithMany(p => p.Phases)
            .HasForeignKey(p => p.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);
   
        modelBuilder.Entity<Attachment>()
            .HasOne(a => a.Defect)
            .WithMany(d => d.Attachments)
            .HasForeignKey(a => a.DefectId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}