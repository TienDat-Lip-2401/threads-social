namespace Pharse2.Models.DtoModels.User
{
    // Body PUT admin/users/{username}/verified: { "verified": true | false }
    public class SetVerifiedRequestDto
    {
        public bool Verified { get; set; }
    }
}
