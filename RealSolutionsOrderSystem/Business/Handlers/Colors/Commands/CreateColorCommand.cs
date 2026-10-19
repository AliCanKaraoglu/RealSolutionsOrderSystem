
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
using Business.Handlers.Colors.ValidationRules;

namespace Business.Handlers.Colors.Commands
{
    /// <summary>
    /// 
    /// </summary>
    public class CreateColorCommand : IRequest<IResult>
    {

        public int CreatedUserId { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public int LastUpdatedUserId { get; set; }
        public System.DateTime LastUpdatedDate { get; set; }
        public bool Status { get; set; }
        public bool IsDeleted { get; set; }
        public string Name { get; set; }


        public class CreateColorCommandHandler : IRequestHandler<CreateColorCommand, IResult>
        {
            private readonly IColorRepository _colorRepository;
            private readonly IMediator _mediator;
            public CreateColorCommandHandler(IColorRepository colorRepository, IMediator mediator)
            {
                _colorRepository = colorRepository;
                _mediator = mediator;
            }

            [ValidationAspect(typeof(CreateColorValidator), Priority = 1)]
            [CacheRemoveAspect("Get")]
            [LogAspect(typeof(FileLogger))]
            [SecuredOperation(Priority = 1)]
            public async Task<IResult> Handle(CreateColorCommand request, CancellationToken cancellationToken)
            {
                var isThereColorRecord = _colorRepository.Query().Any(u => u.CreatedUserId == request.CreatedUserId);

                if (isThereColorRecord == true)
                    return new ErrorResult(Messages.NameAlreadyExist);

                var addedColor = new Color
                {
                    CreatedUserId = request.CreatedUserId,
                    CreatedDate = request.CreatedDate,
                    LastUpdatedUserId = request.LastUpdatedUserId,
                    LastUpdatedDate = request.LastUpdatedDate,
                    Status = request.Status,
                    IsDeleted = request.IsDeleted,
                    Name = request.Name,

                };

                _colorRepository.Add(addedColor);
                await _colorRepository.SaveChangesAsync();
                return new SuccessResult(Messages.Added);
            }
        }
    }
}