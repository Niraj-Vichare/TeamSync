using Enterprise.Flowstate.DAL.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.Interface.Service
{
    public interface IEventPublisher
    {
        Task<bool> PublishAsync(EventsLogDto body,int initalizeRetryCount);
    }
}
