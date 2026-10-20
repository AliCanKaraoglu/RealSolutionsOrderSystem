
using Business.BusinessAspects;
using Business.Constants;
using Core.Aspects.Autofac.Caching;
using Core.Aspects.Autofac.Logging;
using Core.Aspects.Autofac.Validation;
using Core.CrossCuttingConcerns.Logging.Serilog.Loggers;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Concrete;
using MediatR;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using Business.Handlers.Orders.ValidationRules;

namespace Business.Handlers.Orders.Commands
{
    /// <summary>
    /// 
    /// </summary>
    public class CreateOrderCommand : IRequest<IResult>
    {

        public int CreatedUserId { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public int LastUpdatedUserId { get; set; }
        public System.DateTime LastUpdatedDate { get; set; }
        public bool Status { get; set; }
        public bool IsDeleted { get; set; }
        public int CustomerId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }


        public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, IResult>
        {
            private readonly IOrderRepository _orderRepository;
            private readonly IWarehouseRepository _warehouseRepository;
            private readonly IMediator _mediator;

            public CreateOrderCommandHandler(
                IOrderRepository orderRepository,
                IWarehouseRepository warehouseRepository,
                IMediator mediator)
            {
                _orderRepository = orderRepository;
                _warehouseRepository = warehouseRepository;
                _mediator = mediator;
            }

            [ValidationAspect(typeof(CreateOrderValidator), Priority = 1)]
            [CacheRemoveAspect("Get")]
            [LogAspect(typeof(FileLogger))]
            [SecuredOperation(Priority = 1)]
            public async Task<IResult> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
            {
               var depo = _warehouseRepository.Get(x => x.ProductId == request.ProductId && x.IsDeleted == false);

                if (depo == null)
                {
                    return new ErrorResult("Bu ürün depoda bulunamadı.");
                }

                if (depo.IsReadyForSale == false)
                {
                    return new ErrorResult("Bu ürün satışa hazır değil.");
                }

                if (depo.Quantity < request.Quantity)
                {
                    return new ErrorResult("Depoda yeterli stok yok.");
                }

                depo.Quantity = depo.Quantity - request.Quantity;
                _warehouseRepository.Update(depo);
                await _warehouseRepository.SaveChangesAsync();

                var addedOrder = new Order
                {
                    CustomerId = request.CustomerId,
                    ProductId = request.ProductId,
                    Quantity = request.Quantity,
                    CreatedUserId = request.CreatedUserId,
                    CreatedDate = request.CreatedDate,
                    LastUpdatedUserId = request.LastUpdatedUserId,
                    LastUpdatedDate = request.LastUpdatedDate,
                    Status = request.Status,
                    IsDeleted = request.IsDeleted,
                };

                _orderRepository.Add(addedOrder);
                await _orderRepository.SaveChangesAsync();
                return new SuccessResult(Messages.Added);
            }
        }
    }
}