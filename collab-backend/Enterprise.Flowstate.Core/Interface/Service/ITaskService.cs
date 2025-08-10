using Enterprise.Flowstate.BAL.DTOs;
using Enterprise.Flowstate.DAL.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.Interface.Service
{
    public interface ITaskService
    {
        public Task<List<Task>> GetTaskList();
        public Task<bool> CreateTask(TaskDto task);
        public Task<bool> DeleteTask(int taskId);
        public Task<bool> UpdateTask(TaskDto task);
        public Task<TaskDto> GetTaskById(int taskId);

    }
}
