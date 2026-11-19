using Microsoft.EntityFrameworkCore;
using Pharse2.Helper;
using Pharse2.Models;
using Pharse2.Models.CommonModels;
using Pharse2.Models.DtoModels;
using Pharse2.Models.DtoModels.User;
using Pharse2.Models.EntityModels;
using Pharse2.Repositories.Interfaces;

namespace Pharse2.Repositories.Implement
{
    public class FollowRepository : IFollowRepository
    {
        private readonly AppDbContext _context;
        public FollowRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Follow?> GetAsync(int followerId, int followeeId)
        {
            return await _context.Follows.FirstOrDefaultAsync(f => f.FollowerId == followerId && f.FolloweeId == followeeId);
        }

        public async Task AddAsync(Follow follow)
        {
            await _context.Follows.AddAsync(follow);
        }

        public void Remove(Follow follow)
        {
            _context.Follows.Remove(follow);
        }

        public async Task<bool> ExistsAsync(int followerId, int followeeId)
        {
            return await _context.Follows.AnyAsync(f => f.FollowerId == followerId && f.FolloweeId == followeeId);
        }

        public async Task<int> CountFollowersAsync(int userId)
        {
            return await _context.Follows.CountAsync(f => f.FolloweeId == userId && !f.Follower.DeleteFlg);
        }

        public async Task<int> CountFollowingAsync(int userId)
        {
            return await _context.Follows.CountAsync(f => f.FollowerId == userId && !f.Followee.DeleteFlg);
        }

        public async Task<List<PostUserDto>> GetFollowersPreviewAsync(int userId, int take)
        {
            return await _context.Follows
                .Where(f => f.FolloweeId == userId && !f.Follower.DeleteFlg)
                .OrderByDescending(f => f.CreatedAt)
                .Take(take)
                .Select(f => new PostUserDto { Id = f.Follower.Id, Username = f.Follower.Username, Name = f.Follower.Name, AvatarUrl = f.Follower.AvatarPath })
                .ToListAsync();
        }

        public async Task<PagedResult<FollowUserDto>> GetFollowersAsync(int userId, int pageNumber, int pageSize, int viewerId)
        {
            return await _context.Follows
                .Where(f => f.FolloweeId == userId && !f.Follower.DeleteFlg)
                .OrderByDescending(f => f.CreatedAt).ThenByDescending(f => f.FollowerId)
                .Select(f => f.Follower)
                .Select(ToFollowUser(viewerId))
                .ToPageResultAsync(pageNumber, pageSize);
        }

        public async Task<PagedResult<FollowUserDto>> GetFollowingAsync(int userId, int pageNumber, int pageSize, int viewerId)
        {
            return await _context.Follows
                .Where(f => f.FollowerId == userId && !f.Followee.DeleteFlg)
                .OrderByDescending(f => f.CreatedAt).ThenByDescending(f => f.FolloweeId)
                .Select(f => f.Followee)
                .Select(ToFollowUser(viewerId))
                .ToPageResultAsync(pageNumber, pageSize);
        }

        private static System.Linq.Expressions.Expression<Func<User, FollowUserDto>> ToFollowUser(int viewerId) => u => new FollowUserDto
        {
            Id = u.Id,
            Username = u.Username,
            Name = u.Name,
            AvatarUrl = u.AvatarPath,
            IsFollowing = u.Followers.Any(f => f.FollowerId == viewerId),
            IsMe = u.Id == viewerId,
        };

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
