namespace Pharse2.Models.DtoModels.Auth
{
    public class LoginResponseDto
    {
        public int user_id { get; set; }
        public string user_name { get; set; }
        public string access_token { get; set; }
        public string refresh_token { get; set; }
        public DateTime expires_at { get; set; }
    }
}
