using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.DTOs
{
    public class UserWorkMetric
    {
        [JsonProperty("project_name")]
        public string ProjectName { get; set; }

        [JsonProperty("project_id")]
        public int ProjectId { get; set; }

        [JsonProperty("number_of_tasks")]
        public int NumberOfTasks { get; set; }

        [JsonProperty("number_of_sprints_included")]
        public int NumberOfSprintIncluded { get; set; }

        [JsonProperty("total_number_sprints")]
        public int TotalNumberSprints { get; set; }

        [JsonProperty("number_of_tickets_assigned")]
        public int NumberOfTicketsAssigned { get; set; }

        [JsonProperty("total_ticket_points")]
        public int TotalTicketPoints { get; set; }

        [JsonProperty("total_project_points")]
        public int TotalProjectPoints { get; set; }
        [JsonIgnore]
        public float Contribution => CalculateContribution();

        private float CalculateContribution()
        {
            float sprintParticipation = TotalNumberSprints > 0
                ? ((float)NumberOfSprintIncluded / TotalNumberSprints) * 100
                : 0;

            float pointsContribution = TotalProjectPoints > 0
                ? ((float)TotalTicketPoints / TotalProjectPoints) * 100
                : 0;

            // If user has high ticket points, weight it more
            float pointsWeight = TotalTicketPoints > 50 ? 0.7f : 0.5f;
            float sprintWeight = 1 - pointsWeight;

            return (float)Math.Round(
                (sprintParticipation * sprintWeight) + (pointsContribution * pointsWeight),
                2
            );
        }
    }
}
