using Pharse2.Models.EntityModels;
using Pharse2.Services.Interfaces;

namespace Pharse2.Services.Implement
{
    public class CommonService : ICommonService
    {
        private readonly AppDbContext _context;
        private int _userId;
        public CommonService(AppDbContext context)
        {
            _context = context;
        }

        public void SetUserId(int userId)
        {
            _userId = userId;
        }

        public int GetUserId()
        {
            return _userId;
        }

        private int _refreshTokenId;
        public void SetRefreshTokenId(int refreshTokenId) => _refreshTokenId = refreshTokenId;
        public int GetRefreshTokenId() => _refreshTokenId;
    }
}
