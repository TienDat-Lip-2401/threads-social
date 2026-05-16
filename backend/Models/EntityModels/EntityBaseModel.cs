namespace Pharse2.Models.EntityModels
{
    public class EntityBaseModel
    {
        public int Id { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public bool DeleteFlg { get; set; }
    }
}
