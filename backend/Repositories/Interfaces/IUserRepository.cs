using Microsoft.EntityFrameworkCore.Storage;
using Pharse2.Models;

namespace Pharse2.Repositories.Interfaces
{
    public interface IUserRepository
    {
        //Check username trung lap
        Task<bool> ExistsByUserNameAsync(string userName);
        //Check Email trung lap
        Task<bool> ExistsByEmailAsync(string email);
        //Get ra User tu Username
        Task<User?> GetByUsernameAsync(string username);
        Task<User?> GetByEmailAsync(string email);
        Task CreateAsync(User user);
        Task<bool> SaveChangesAsync();
        Task<User?> GetByIdAsync(int id);
        Task<IDbContextTransaction> BeginTransactionAsync();
    }
}
