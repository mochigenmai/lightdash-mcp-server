import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  type CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { createLightdashClient } from 'lightdash-client-typescript-fetch';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  ListProjectsRequestSchema,
  GetProjectRequestSchema,
  ListSpacesRequestSchema,
  ListChartsRequestSchema,
  ListDashboardsRequestSchema,
  GetCustomMetricsRequestSchema,
  GetCatalogRequestSchema,
  GetMetricsCatalogRequestSchema,
  GetChartsAsCodeRequestSchema,
  GetDashboardsAsCodeRequestSchema,
  GetMetadataRequestSchema,
  GetAnalyticsRequestSchema,
  GetUserAttributesRequestSchema,
  ListExploresRequestSchema,
  GetExploreRequestSchema,
  RunQueryRequestSchema,
  CompileQueryRequestSchema,
  RunUnderlyingDataQueryRequestSchema,
  RunSqlQueryRequestSchema,
  CalculateTotalRequestSchema,
  RunMetricExplorerQueryRequestSchema,
  RunMetricTotalRequestSchema,
  GetMetricsTreeRequestSchema,
  RunSavedChartRequestSchema,
  GetChartHistoryRequestSchema,
  GetChartVersionRequestSchema,
} from './schemas.js';

const lightdashClient = createLightdashClient(
  process.env.LIGHTDASH_URL || 'https://app.lightdash.cloud',
  {
    headers: {
      Authorization: `ApiKey ${process.env.LIGHTDASH_API_KEY}`,
    },
  }
);

export const server = new Server(
  {
    name: 'lightdash-mcp-server',
    version: '0.0.1',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_projects',
        description: 'List all projects in the Lightdash organization',
        inputSchema: zodToJsonSchema(ListProjectsRequestSchema),
      },
      {
        name: 'get_project',
        description: 'Get details of a specific project',
        inputSchema: zodToJsonSchema(GetProjectRequestSchema),
      },
      {
        name: 'list_spaces',
        description: 'List all spaces in a project',
        inputSchema: zodToJsonSchema(ListSpacesRequestSchema),
      },
      {
        name: 'list_charts',
        description: 'List all charts in a project',
        inputSchema: zodToJsonSchema(ListChartsRequestSchema),
      },
      {
        name: 'list_dashboards',
        description: 'List all dashboards in a project',
        inputSchema: zodToJsonSchema(ListDashboardsRequestSchema),
      },
      {
        name: 'list_custom_metrics',
        description: 'List custom metrics for a project',
        inputSchema: zodToJsonSchema(GetCustomMetricsRequestSchema),
      },
      {
        name: 'get_catalog',
        description: 'Get catalog for a project',
        inputSchema: zodToJsonSchema(GetCatalogRequestSchema),
      },
      {
        name: 'list_metrics',
        description: 'List all metrics in a project from the metrics catalog',
        inputSchema: zodToJsonSchema(GetMetricsCatalogRequestSchema),
      },
      {
        name: 'get_charts_as_code',
        description: 'Get charts as code for a project',
        inputSchema: zodToJsonSchema(GetChartsAsCodeRequestSchema),
      },
      {
        name: 'get_dashboards_as_code',
        description: 'Get dashboards as code for a project',
        inputSchema: zodToJsonSchema(GetDashboardsAsCodeRequestSchema),
      },
      {
        name: 'get_table_metadata',
        description: 'Get metadata for a specific table in the data catalog',
        inputSchema: zodToJsonSchema(GetMetadataRequestSchema),
      },
      {
        name: 'get_table_analytics',
        description: 'Get analytics for a specific table in the data catalog',
        inputSchema: zodToJsonSchema(GetAnalyticsRequestSchema),
      },
      {
        name: 'list_user_attributes',
        description: 'List organization user attributes',
        inputSchema: zodToJsonSchema(GetUserAttributesRequestSchema),
      },
      {
        name: 'list_explores',
        description:
          'List all explores (tables) available in a project. Each explore contains dimensions and metrics that can be queried.',
        inputSchema: zodToJsonSchema(ListExploresRequestSchema),
      },
      {
        name: 'get_explore',
        description:
          'Get detailed information about a specific explore, including all dimensions, metrics, and their definitions. Use this to understand what fields are available for querying.',
        inputSchema: zodToJsonSchema(GetExploreRequestSchema),
      },
      {
        name: 'run_query',
        description:
          'Execute a query against an explore with specified dimensions and metrics. Returns the query results as data rows. Use get_explore first to understand available fields.',
        inputSchema: zodToJsonSchema(RunQueryRequestSchema),
      },
      {
        name: 'compile_query',
        description:
          'Compile a query to SQL without executing it. Useful for previewing the generated SQL before running a query.',
        inputSchema: zodToJsonSchema(CompileQueryRequestSchema),
      },
      {
        name: 'run_raw_data_query',
        description:
          'Run a query to get the underlying row-level data for an explore. Returns detailed data rows rather than aggregated results.',
        inputSchema: zodToJsonSchema(RunUnderlyingDataQueryRequestSchema),
      },
      {
        name: 'run_sql_query',
        description:
          'Execute a raw SQL query against the data warehouse. Use with caution - this runs arbitrary SQL.',
        inputSchema: zodToJsonSchema(RunSqlQueryRequestSchema),
      },
      {
        name: 'calculate_metrics_total',
        description:
          'Calculate the total values for metrics in a query. Returns aggregated totals for the specified metrics.',
        inputSchema: zodToJsonSchema(CalculateTotalRequestSchema),
      },
      {
        name: 'run_metric_timeseries',
        description:
          'Run a time-series query for a specific metric using the Metrics Explorer. Useful for analyzing metric trends over time.',
        inputSchema: zodToJsonSchema(RunMetricExplorerQueryRequestSchema),
      },
      {
        name: 'get_metric_total',
        description:
          'Get the total value for a metric over a time period. Optionally compare with previous period.',
        inputSchema: zodToJsonSchema(RunMetricTotalRequestSchema),
      },
      {
        name: 'get_metrics_tree',
        description:
          'Get the hierarchical tree structure of metrics relationships.',
        inputSchema: zodToJsonSchema(GetMetricsTreeRequestSchema),
      },
      {
        name: 'run_saved_chart',
        description:
          'Execute a saved chart and return its query results. The chart must already exist in Lightdash.',
        inputSchema: zodToJsonSchema(RunSavedChartRequestSchema),
      },
      {
        name: 'get_chart_history',
        description:
          'Get the version history of a saved chart from the last 30 days.',
        inputSchema: zodToJsonSchema(GetChartHistoryRequestSchema),
      },
      {
        name: 'get_chart_version',
        description: 'Get details of a specific version of a saved chart.',
        inputSchema: zodToJsonSchema(GetChartVersionRequestSchema),
      },
    ],
  };
});

const validateProjectUuid = (projectUuid: string): string => {
  if (!projectUuid) {
    throw new Error(
      'projectUuid is required. Either provide it in the request or set LIGHTDASH_PROJECT_UUID environment variable.'
    );
  }
  return projectUuid;
};

server.setRequestHandler(
  CallToolRequestSchema,
  async (request: CallToolRequest) => {
    try {
      if (!request.params) {
        throw new Error('Params are required');
      }

      switch (request.params.name) {
        case 'list_projects': {
          const { data, error } = await lightdashClient.GET(
            '/api/v1/org/projects',
            {}
          );
          if (error) {
            throw new Error(
              `Lightdash API error: ${error.error.name}, ${
                error.error.message ?? 'no message'
              }`
            );
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data.results, null, 2),
              },
            ],
          };
        }
        case 'get_project': {
          const args = GetProjectRequestSchema.parse(request.params.arguments);
          const projectUuid = validateProjectUuid(args.projectUuid);
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}',
            {
              params: {
                path: {
                  projectUuid,
                },
              },
            }
          );
          if (error) {
            throw new Error(
              `Lightdash API error: ${error.error.name}, ${
                error.error.message ?? 'no message'
              }`
            );
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data.results, null, 2),
              },
            ],
          };
        }
        case 'list_spaces': {
          const args = ListSpacesRequestSchema.parse(request.params.arguments);
          const projectUuid = validateProjectUuid(args.projectUuid);
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}/spaces',
            {
              params: {
                path: {
                  projectUuid,
                },
              },
            }
          );
          if (error) {
            throw new Error(
              `Lightdash API error: ${error.error.name}, ${
                error.error.message ?? 'no message'
              }`
            );
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data.results, null, 2),
              },
            ],
          };
        }
        case 'list_charts': {
          const args = ListChartsRequestSchema.parse(request.params.arguments);
          const projectUuid = validateProjectUuid(args.projectUuid);
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}/charts',
            {
              params: {
                path: {
                  projectUuid,
                },
              },
            }
          );
          if (error) {
            throw new Error(
              `Lightdash API error: ${error.error.name}, ${
                error.error.message ?? 'no message'
              }`
            );
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data.results, null, 2),
              },
            ],
          };
        }
        case 'list_dashboards': {
          const args = ListDashboardsRequestSchema.parse(
            request.params.arguments
          );
          const projectUuid = validateProjectUuid(args.projectUuid);
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}/dashboards',
            {
              params: {
                path: {
                  projectUuid,
                },
              },
            }
          );
          if (error) {
            throw new Error(
              `Lightdash API error: ${error.error.name}, ${
                error.error.message ?? 'no message'
              }`
            );
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data.results, null, 2),
              },
            ],
          };
        }
        case 'list_custom_metrics': {
          const args = GetCustomMetricsRequestSchema.parse(
            request.params.arguments
          );
          const projectUuid = validateProjectUuid(args.projectUuid);
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}/custom-metrics',
            {
              params: {
                path: {
                  projectUuid,
                },
              },
            }
          );
          if (error) {
            throw new Error(
              `Lightdash API error: ${error.error.name}, ${
                error.error.message ?? 'no message'
              }`
            );
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data.results, null, 2),
              },
            ],
          };
        }
        case 'get_catalog': {
          const args = GetCatalogRequestSchema.parse(request.params.arguments);
          const projectUuid = validateProjectUuid(args.projectUuid);
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}/dataCatalog',
            {
              params: {
                path: {
                  projectUuid,
                },
              },
            }
          );
          if (error) {
            throw new Error(
              `Lightdash API error: ${error.error.name}, ${
                error.error.message ?? 'no message'
              }`
            );
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data.results, null, 2),
              },
            ],
          };
        }
        case 'list_metrics': {
          const args = GetMetricsCatalogRequestSchema.parse(
            request.params.arguments
          );
          const projectUuid = validateProjectUuid(args.projectUuid);
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}/dataCatalog/metrics',
            {
              params: {
                path: {
                  projectUuid,
                },
              },
            }
          );
          if (error) {
            throw new Error(
              `Lightdash API error: ${error.error.name}, ${
                error.error.message ?? 'no message'
              }`
            );
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data.results, null, 2),
              },
            ],
          };
        }
        case 'get_charts_as_code': {
          const args = GetChartsAsCodeRequestSchema.parse(
            request.params.arguments
          );
          const projectUuid = validateProjectUuid(args.projectUuid);
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}/charts/code',
            {
              params: {
                path: {
                  projectUuid,
                },
              },
            }
          );
          if (error) {
            throw new Error(
              `Lightdash API error: ${error.error.name}, ${
                error.error.message ?? 'no message'
              }`
            );
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data.results, null, 2),
              },
            ],
          };
        }
        case 'get_dashboards_as_code': {
          const args = GetDashboardsAsCodeRequestSchema.parse(
            request.params.arguments
          );
          const projectUuid = validateProjectUuid(args.projectUuid);
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}/dashboards/code',
            {
              params: {
                path: {
                  projectUuid,
                },
              },
            }
          );
          if (error) {
            throw new Error(
              `Lightdash API error: ${error.error.name}, ${
                error.error.message ?? 'no message'
              }`
            );
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data.results, null, 2),
              },
            ],
          };
        }
        case 'get_table_metadata': {
          const args = GetMetadataRequestSchema.parse(request.params.arguments);
          const projectUuid = validateProjectUuid(args.projectUuid);
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}/dataCatalog/{table}/metadata',
            {
              params: {
                path: {
                  projectUuid,
                  table: args.table,
                },
              },
            }
          );
          if (error) {
            throw new Error(
              `Lightdash API error: ${error.error.name}, ${
                error.error.message ?? 'no message'
              }`
            );
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data.results, null, 2),
              },
            ],
          };
        }
        case 'get_table_analytics': {
          const args = GetAnalyticsRequestSchema.parse(
            request.params.arguments
          );
          const projectUuid = validateProjectUuid(args.projectUuid);
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}/dataCatalog/{table}/analytics',
            {
              params: {
                path: {
                  projectUuid,
                  table: args.table,
                },
              },
            }
          );
          if (error) {
            throw new Error(
              `Lightdash API error: ${error.error.name}, ${
                error.error.message ?? 'no message'
              }`
            );
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data.results, null, 2),
              },
            ],
          };
        }
        case 'list_user_attributes': {
          const { data, error } = await lightdashClient.GET(
            '/api/v1/org/attributes',
            {}
          );
          if (error) {
            throw new Error(
              `Lightdash API error: ${error.error.name}, ${
                error.error.message ?? 'no message'
              }`
            );
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data.results, null, 2),
              },
            ],
          };
        }
        case 'list_explores': {
          const args = ListExploresRequestSchema.parse(
            request.params.arguments
          );
          const projectUuid = validateProjectUuid(args.projectUuid);
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}/explores',
            {
              params: {
                path: {
                  projectUuid,
                },
              },
            }
          );
          if (error) {
            throw new Error(
              `Lightdash API error: ${error.error.name}, ${
                error.error.message ?? 'no message'
              }`
            );
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data.results, null, 2),
              },
            ],
          };
        }
        case 'get_explore': {
          const args = GetExploreRequestSchema.parse(request.params.arguments);
          const projectUuid = validateProjectUuid(args.projectUuid);
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}/explores/{exploreId}',
            {
              params: {
                path: {
                  projectUuid,
                  exploreId: args.exploreId,
                },
              },
            }
          );
          if (error) {
            throw new Error(
              `Lightdash API error: ${error.error.name}, ${
                error.error.message ?? 'no message'
              }`
            );
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data.results, null, 2),
              },
            ],
          };
        }
        case 'run_query': {
          const args = RunQueryRequestSchema.parse(request.params.arguments);
          const projectUuid = validateProjectUuid(args.projectUuid);
          const { data, error } = await lightdashClient.POST(
            '/api/v1/projects/{projectUuid}/explores/{exploreId}/runQuery',
            {
              params: {
                path: {
                  projectUuid,
                  exploreId: args.exploreId,
                },
              },
              body: {
                exploreName: args.exploreId,
                dimensions: args.dimensions,
                metrics: args.metrics,
                filters: args.filters ?? {
                  dimensions: { and: [], id: 'root' },
                  metrics: { and: [], id: 'root' },
                },
                sorts: args.sorts ?? [],
                limit: args.limit ?? 500,
                tableCalculations: args.tableCalculations ?? [],
              },
            }
          );
          if (error) {
            throw new Error(
              `Lightdash API error: ${error.error.name}, ${
                error.error.message ?? 'no message'
              }`
            );
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data.results, null, 2),
              },
            ],
          };
        }
        case 'compile_query': {
          const args = CompileQueryRequestSchema.parse(
            request.params.arguments
          );
          const projectUuid = validateProjectUuid(args.projectUuid);
          const { data, error } = await lightdashClient.POST(
            '/api/v1/projects/{projectUuid}/explores/{exploreId}/compileQuery',
            {
              params: {
                path: {
                  projectUuid,
                  exploreId: args.exploreId,
                },
              },
              body: {
                exploreName: args.exploreId,
                dimensions: args.dimensions,
                metrics: args.metrics,
                filters: args.filters ?? {
                  dimensions: { and: [], id: 'root' },
                  metrics: { and: [], id: 'root' },
                },
                sorts: args.sorts ?? [],
                limit: args.limit ?? 500,
                tableCalculations: args.tableCalculations ?? [],
              },
            }
          );
          if (error) {
            throw new Error(
              `Lightdash API error: ${error.error.name}, ${
                error.error.message ?? 'no message'
              }`
            );
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data.results, null, 2),
              },
            ],
          };
        }
        case 'run_raw_data_query': {
          const args = RunUnderlyingDataQueryRequestSchema.parse(
            request.params.arguments
          );
          const projectUuid = validateProjectUuid(args.projectUuid);
          const { data, error } = await lightdashClient.POST(
            '/api/v1/projects/{projectUuid}/explores/{exploreId}/runUnderlyingDataQuery',
            {
              params: {
                path: {
                  projectUuid,
                  exploreId: args.exploreId,
                },
              },
              body: {
                exploreName: args.exploreId,
                dimensions: args.dimensions,
                metrics: args.metrics,
                filters: args.filters ?? {
                  dimensions: { and: [], id: 'root' },
                  metrics: { and: [], id: 'root' },
                },
                sorts: args.sorts ?? [],
                limit: args.limit ?? 500,
                tableCalculations: args.tableCalculations ?? [],
              },
            }
          );
          if (error) {
            throw new Error(
              `Lightdash API error: ${error.error.name}, ${
                error.error.message ?? 'no message'
              }`
            );
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data.results, null, 2),
              },
            ],
          };
        }
        case 'run_sql_query': {
          const args = RunSqlQueryRequestSchema.parse(request.params.arguments);
          const projectUuid = validateProjectUuid(args.projectUuid);
          const { data, error } = await lightdashClient.POST(
            '/api/v1/projects/{projectUuid}/sqlQuery',
            {
              params: {
                path: {
                  projectUuid,
                },
              },
              body: {
                sql: args.sql,
              },
            }
          );
          if (error) {
            throw new Error(
              `Lightdash API error: ${error.error.name}, ${
                error.error.message ?? 'no message'
              }`
            );
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data.results, null, 2),
              },
            ],
          };
        }
        case 'calculate_metrics_total': {
          const args = CalculateTotalRequestSchema.parse(
            request.params.arguments
          );
          const projectUuid = validateProjectUuid(args.projectUuid);
          const { data, error } = await lightdashClient.POST(
            '/api/v1/projects/{projectUuid}/calculate-total',
            {
              params: {
                path: {
                  projectUuid,
                },
              },
              body: {
                explore: args.exploreId,
                metricQuery: {
                  exploreName: args.exploreId,
                  dimensions: args.dimensions,
                  metrics: args.metrics,
                  filters: args.filters ?? {
                  dimensions: { and: [], id: 'root' },
                  metrics: { and: [], id: 'root' },
                },
                  sorts: args.sorts ?? [],
                  limit: args.limit ?? 500,
                  tableCalculations: args.tableCalculations ?? [],
                },
              },
            }
          );
          if (error) {
            throw new Error(
              `Lightdash API error: ${error.error.name}, ${
                error.error.message ?? 'no message'
              }`
            );
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data.results, null, 2),
              },
            ],
          };
        }
        case 'run_metric_timeseries': {
          const args = RunMetricExplorerQueryRequestSchema.parse(
            request.params.arguments
          );
          const projectUuid = validateProjectUuid(args.projectUuid);
          const { data, error } = await lightdashClient.POST(
            '/api/v1/projects/{projectUuid}/metricsExplorer/{explore}/{metric}/runMetricExplorerQuery',
            {
              params: {
                path: {
                  projectUuid,
                  explore: args.explore,
                  metric: args.metric,
                },
                query: {
                  startDate: args.startDate,
                  endDate: args.endDate,
                },
              },
              body: {
                query: args.query ?? { comparison: 'none' },
                timeDimensionOverride: args.timeDimensionOverride,
              },
            }
          );
          if (error) {
            throw new Error(
              `Lightdash API error: ${error.error.name}, ${
                error.error.message ?? 'no message'
              }`
            );
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data.results, null, 2),
              },
            ],
          };
        }
        case 'get_metric_total': {
          const args = RunMetricTotalRequestSchema.parse(
            request.params.arguments
          );
          const projectUuid = validateProjectUuid(args.projectUuid);
          const { data, error } = await lightdashClient.POST(
            '/api/v1/projects/{projectUuid}/metricsExplorer/{explore}/{metric}/runMetricTotal',
            {
              params: {
                path: {
                  projectUuid,
                  explore: args.explore,
                  metric: args.metric,
                },
                query: {
                  startDate: args.startDate,
                  endDate: args.endDate,
                  timeFrame: args.timeFrame,
                },
              },
              body: args.comparisonType
                ? { comparisonType: args.comparisonType }
                : undefined,
            }
          );
          if (error) {
            throw new Error(
              `Lightdash API error: ${error.error.name}, ${
                error.error.message ?? 'no message'
              }`
            );
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data.results, null, 2),
              },
            ],
          };
        }
        case 'get_metrics_tree': {
          const args = GetMetricsTreeRequestSchema.parse(
            request.params.arguments
          );
          const projectUuid = validateProjectUuid(args.projectUuid);
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}/dataCatalog/metrics/tree',
            {
              params: {
                path: {
                  projectUuid,
                },
                query: {
                  metricUuids: args.metricUuids,
                },
              },
            }
          );
          if (error) {
            throw new Error(
              `Lightdash API error: ${error.error.name}, ${
                error.error.message ?? 'no message'
              }`
            );
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data.results, null, 2),
              },
            ],
          };
        }
        case 'run_saved_chart': {
          const args = RunSavedChartRequestSchema.parse(
            request.params.arguments
          );
          const { data, error } = await lightdashClient.POST(
            '/api/v1/saved/{chartUuid}/results',
            {
              params: {
                path: {
                  chartUuid: args.chartUuid,
                },
              },
              body: {
                invalidateCache: args.invalidateCache ?? false,
              },
            }
          );
          if (error) {
            throw new Error(
              `Lightdash API error: ${error.error.name}, ${
                error.error.message ?? 'no message'
              }`
            );
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data.results, null, 2),
              },
            ],
          };
        }
        case 'get_chart_history': {
          const args = GetChartHistoryRequestSchema.parse(
            request.params.arguments
          );
          const { data, error } = await lightdashClient.GET(
            '/api/v1/saved/{chartUuid}/history',
            {
              params: {
                path: {
                  chartUuid: args.chartUuid,
                },
              },
            }
          );
          if (error) {
            throw new Error(
              `Lightdash API error: ${error.error.name}, ${
                error.error.message ?? 'no message'
              }`
            );
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data.results, null, 2),
              },
            ],
          };
        }
        case 'get_chart_version': {
          const args = GetChartVersionRequestSchema.parse(
            request.params.arguments
          );
          const { data, error } = await lightdashClient.GET(
            '/api/v1/saved/{chartUuid}/version/{versionUuid}',
            {
              params: {
                path: {
                  chartUuid: args.chartUuid,
                  versionUuid: args.versionUuid,
                },
              },
            }
          );
          if (error) {
            throw new Error(
              `Lightdash API error: ${error.error.name}, ${
                error.error.message ?? 'no message'
              }`
            );
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data.results, null, 2),
              },
            ],
          };
        }
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    } catch (error) {
      console.error('Error handling request:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(errorMessage);
    }
  }
);
