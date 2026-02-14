using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Constants
{
    public class FlowStateConstants
    {
        // Queue when the message is sent for processing
        public const string RANKING_EXCHANGE = "ranking.exchange";
        public const string NOTIFICATION_EXCHANGE = "notification.exchange";
        public const string RANKING_QUEUE = "ranking.queue";
        public const string RANKING_ROUTING_KEY = "ranking.update";


        // Queue when the message fails and needs to be retried
        public const string RANKING_RETRY_EXCHANGE = "ranking.retry.exchange";
        public const string RANKING_RETRY_QUEUE = "ranking.retry.queue";
        public const string RANKING_RETRY_ROUTING_KEY = "ranking.retry";

        // Queue when the message fails permanently
        public const string RANKING_DLX_EXCHANGE = "ranking.dlx.exchange";
        public const string RANKING_DLX_QUEUE = "ranking.dlq";
        public const string RANKING_DLX_ROUTING_KEY = "ranking.dlq";

        public const string USER_METRIC_KEY = "user_metric:{0}:{1}";
        public const string WORKSPACE_RANKING_KEY = "workspace_ranking:{0}";

        // Cache Keys:
        public const string WORKSPACE_RANKING = "workspace_ranking:{0}";
        public const string USER_METRIC = "user_metric:{0}:{1}";
        public const string PENDING_DB_UPDATES = "pending_updates:{0}";
        public const string PREVIOUS_WEEK_RANKING_KEY = "workspace_ranking:previous:{0}";
        public const string PREVIOUS_WEEK_METRIC_KEY = "user_metric:previous:{0}:{1}";
        public const string USER_INFO_KEY = "user_info:{0}";
        public const string WORKSPACE_PROJECTS_KEY = "workspace_projects:{0}";
        public const string PROJECT_SPRINTS_KEY = "workspace_project_sprints:{0}:{1}";
        public const string SPRINT_TICKETS_KEY = "sprint_tickets:{0}";
        public const string USER_ROLE = "user:{0}:workspace:{1}:role";
        public const string USER_WORKSPACE = "user:{0}:workspace";
        public const int WORK_DAY_SECONDS = 9 * 60 * 60;
        public const int MAX_AUTO_CLOCKOUTS = 3;
        public const int SCORE_PENALTY = 1;

    }
}
