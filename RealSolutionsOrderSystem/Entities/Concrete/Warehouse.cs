using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Entities;

namespace Entities.Concrete
{
    public class Warehouse: BaseEntity, IEntity


    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public int IsReadyForSale { get; set; }
    }
}
