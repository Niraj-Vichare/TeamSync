using Enterprise.Flowstate.BAL.DTOs;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Enums;
using Enterprise.Flowstate.DAL.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class TaskService : ITaskService
    {
        private IOmniRepository _omniRepository;
        public TaskService(IOmniRepository omniRepository)
        {
            // Initialize any required services or repositories here
            _omniRepository = omniRepository;   
        }
        public Task<bool> CreateTask(TaskDto task)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteTask(int taskId)
        {
            throw new NotImplementedException();
        }

        public Task<TaskDto> GetTaskById(int taskId)
        {
            throw new NotImplementedException();
        }

        public Task<List<Task>> GetTaskList()
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateTask(TaskDto task)
        {
            throw new NotImplementedException();
        }
    }
}
