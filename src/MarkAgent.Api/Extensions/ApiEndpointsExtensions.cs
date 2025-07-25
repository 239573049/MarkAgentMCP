using Microsoft.AspNetCore.Authorization;
using MarkAgent.Application.DTOs.Authentication;
using MarkAgent.Application.DTOs.Todo;
using MarkAgent.Application.Services;
using MarkAgent.Domain.Enums;
using System.Security.Claims;
using System.Text.Json;

namespace MarkAgent.Api.Extensions;

public static class ApiEndpointsExtensions
{
    public static void MapApiEndpoints(this WebApplication app)
    {
        var api = app.MapGroup("/api").WithOpenApi();

        // Authentication endpoints
        MapAuthenticationEndpoints(api);
        
        // Todo endpoints
        MapTodoEndpoints(api);
        
        // Statistics endpoints
        MapStatisticsEndpoints(api);
        
        // SSE endpoints
        MapSseEndpoints(api);
    }

    private static void MapAuthenticationEndpoints(RouteGroupBuilder api)
    {
        var auth = api.MapGroup("/auth");

        auth.MapPost("/register", async (RegisterRequest request, IAuthenticationService authService) =>
        {
            try
            {
                var response = await authService.RegisterAsync(request);
                return Results.Ok(response);
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        }).WithTags("Authentication");

        auth.MapPost("/login", async (LoginRequest request, IAuthenticationService authService) =>
        {
            try
            {
                var response = await authService.LoginAsync(request);
                return Results.Ok(response);
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        }).WithTags("Authentication");

        auth.MapPost("/forgot-password", async (ForgotPasswordRequest request, IAuthenticationService authService) =>
        {
            try
            {
                await authService.ForgotPasswordAsync(request);
                return Results.Ok(new { message = "Password reset email sent" });
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        }).WithTags("Authentication");

        auth.MapPost("/reset-password", async (ResetPasswordRequest request, IAuthenticationService authService) =>
        {
            try
            {
                await authService.ResetPasswordAsync(request);
                return Results.Ok(new { message = "Password reset successfully" });
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        }).WithTags("Authentication");
    }

    private static void MapTodoEndpoints(RouteGroupBuilder api)
    {
        var todos = api.MapGroup("/todos").RequireAuthorization();

        todos.MapGet("/", async (ITodoService todoService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            var todos = await todoService.GetUserTodosAsync(userId);
            return Results.Ok(todos);
        }).WithTags("Todos");

        todos.MapGet("/{id:guid}", async (Guid id, ITodoService todoService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            var todo = await todoService.GetTodoAsync(id, userId);
            return todo != null ? Results.Ok(todo) : Results.NotFound();
        }).WithTags("Todos");

        todos.MapPost("/", async (CreateTodoRequest request, ITodoService todoService, ClaimsPrincipal user) =>
        {
            try
            {
                var userId = GetUserId(user);
                var todo = await todoService.CreateTodoAsync(request, userId);
                return Results.Created($"/api/todos/{todo.Id}", todo);
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        }).WithTags("Todos");

        todos.MapPut("/{id:guid}", async (Guid id, UpdateTodoRequest request, ITodoService todoService, ClaimsPrincipal user) =>
        {
            try
            {
                var userId = GetUserId(user);
                var todo = await todoService.UpdateTodoAsync(id, request, userId);
                return Results.Ok(todo);
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        }).WithTags("Todos");

        todos.MapPatch("/{id:guid}/status", async (Guid id, TodoStatus status, ITodoService todoService, ClaimsPrincipal user) =>
        {
            try
            {
                var userId = GetUserId(user);
                var todo = await todoService.UpdateTodoStatusAsync(id, status, userId);
                return Results.Ok(todo);
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        }).WithTags("Todos");

        todos.MapDelete("/{id:guid}", async (Guid id, ITodoService todoService, ClaimsPrincipal user) =>
        {
            try
            {
                var userId = GetUserId(user);
                await todoService.DeleteTodoAsync(id, userId);
                return Results.NoContent();
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        }).WithTags("Todos");
    }

    private static void MapStatisticsEndpoints(RouteGroupBuilder api)
    {
        var stats = api.MapGroup("/statistics").RequireAuthorization();

        stats.MapGet("/user", async (IStatisticsService statisticsService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            var statistics = await statisticsService.GetUserStatisticsAsync(userId);
            return Results.Ok(statistics);
        }).WithTags("Statistics");

        stats.MapGet("/system", async (IStatisticsService statisticsService) =>
        {
            var statistics = await statisticsService.GetSystemStatisticsAsync();
            return Results.Ok(statistics);
        }).WithTags("Statistics");
    }

    private static void MapSseEndpoints(RouteGroupBuilder api)
    {
        var sse = api.MapGroup("/sse").RequireAuthorization();

        sse.MapGet("/todos", async (HttpContext context, ITodoRealtimeService realtimeService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            
            context.Response.Headers.Add("Content-Type", "text/event-stream");
            context.Response.Headers.Add("Cache-Control", "no-cache");
            context.Response.Headers.Add("Connection", "keep-alive");

            var stream = realtimeService.GetTodoUpdatesStreamAsync(userId, context.RequestAborted);
            
            await foreach (var update in stream)
            {
                await context.Response.WriteAsync($"data: {update}\n\n");
                await context.Response.Body.FlushAsync();
            }
        }).WithTags("SSE");
    }

    private static Guid GetUserId(ClaimsPrincipal user)
    {
        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim ?? throw new UnauthorizedAccessException("User ID not found"));
    }
}