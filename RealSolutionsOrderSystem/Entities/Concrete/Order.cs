using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Entities;

namespace Entities.Concrete
{
    public class Order: BaseEntity, IEntity

    {
        public int CustomerId { get; set; }
        public int ProductId { get; set; }
        public int  Quantity { get; set; }
    }
}
