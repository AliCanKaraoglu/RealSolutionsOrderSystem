using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Concrete
{
    public class Product: BaseEntity      

    {
        public string Name { get; set; }
        public int ColorId { get; set; }
        public SizeEnum Size  { get; set; }
    }
}
