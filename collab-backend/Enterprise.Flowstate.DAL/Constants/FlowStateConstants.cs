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


    }
}
