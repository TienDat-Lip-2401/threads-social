namespace Pharse2.Services.Interfaces
{
    public interface ICommonService
    {
        void SetUserId(int userId);
        int GetUserId();
        // Id của phiên đăng nhập (refresh token) gắn với access token hiện tại
        void SetRefreshTokenId(int refreshTokenId);
        int GetRefreshTokenId();
    }
}
