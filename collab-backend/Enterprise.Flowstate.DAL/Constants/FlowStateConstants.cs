namespace Enterprise.Flowstate.DAL.Constants
{
    public static class FlowStateConstants
    {
        #region RabbitMQ
        public const string RANKING_EXCHANGE = "ranking.exchange";
        public const string NOTIFICATION_EXCHANGE = "notification.exchange";
        public const string RANKING_QUEUE = "ranking.queue";
        public const string RANKING_ROUTING_KEY = "ranking.update";
        public const string RANKING_RETRY_EXCHANGE = "ranking.retry.exchange";
        public const string RANKING_RETRY_QUEUE = "ranking.retry.queue";
        public const string RANKING_RETRY_ROUTING_KEY = "ranking.retry";
        public const string RANKING_DLX_EXCHANGE = "ranking.dlx.exchange";
        public const string RANKING_DLX_QUEUE = "ranking.dlq";
        public const string RANKING_DLX_ROUTING_KEY = "ranking.dlq";
        #endregion

        #region Misc
        public const int WORK_DAY_SECONDS = 9 * 60 * 60;
        public const int MAX_AUTO_CLOCKOUTS = 3;
        public const int SCORE_PENALTY = 1;
        #endregion

        #region Cache Keys
        public static class Cache
        {
            // workspace:{guid}:ranking
            public const string WorkspaceRanking = "workspace:{0}:ranking";
            // workspace:{guid}:ranking:previous
            public const string WorkspaceRankingPrevious = "workspace:{0}:ranking:previous";
            // workspace:{guid}:pending_updates
            public const string WorkspacePendingUpdates = "workspace:{0}:pending_updates";
            // workspace:{guid}:projects
            public const string WorkspaceProjects = "workspace:{0}:projects";

            // workspace:{guid}:user:{userId}:metric
            public const string UserMetric = "workspace:{0}:user:{1}:metric";
            // workspace:{guid}:user:{userId}:metric:previous
            public const string UserMetricPrevious = "workspace:{0}:user:{1}:previous";
            // workspace:{guid}:user:{userId}:role
            public const string UserRole = "workspace:{0}:user:{1}:role";
            public const string UserId = "workspace:{0}:user:{1}:userId";
            // workspace:{guid}:user:{userId}:permissions
            public const string UserPermissions = "workspace:{0}:user:{1}:permissions";

            // user:{userId}:info
            public const string UserInfo = "user:{0}:info";
            // user:{userId}:workspace
            public const string UserWorkspace = "user:{0}:workspace";

            // workspace:{guid}:project:{projectId}:sprints
            public const string ProjectSprints = "workspace:{0}:project:{1}:sprints";
            // sprint:{sprintId}:tickets
            public const string SprintTickets = "sprint:{0}:tickets";
        }
        #endregion
    }
}