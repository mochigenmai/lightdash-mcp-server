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
        name: 'lightdash_list_projects',
        description: 'List all projects in the Lightdash organization',
        inputSchema: zodToJsonSchema(ListProjectsRequestSchema),
      },
      {
        name: 'lightdash_get_project',
        description: 'Get details of a specific project',
        inputSchema: zodToJsonSchema(GetProjectRequestSchema),
      },
      {
        name: 'lightdash_list_spaces',
        description: 'List all spaces in a project',
        inputSchema: zodToJsonSchema(ListSpacesRequestSchema),
      },
      {
        name: 'lightdash_list_charts',
        description: 'List all charts in a project',
        inputSchema: zodToJsonSchema(ListChartsRequestSchema),
      },
      {
        name: 'lightdash_list_dashboards',
        description: 'List all dashboards in a project',
        inputSchema: zodToJsonSchema(ListDashboardsRequestSchema),
      },
      {
        name: 'lightdash_get_custom_metrics',
        description: 'Get custom metrics for a project',
        inputSchema: zodToJsonSchema(GetCustomMetricsRequestSchema),
      },
      {
        name: 'lightdash_get_catalog',
        description: 'Get catalog for a project',
        inputSchema: zodToJsonSchema(GetCatalogRequestSchema),
      },
      {
        name: 'lightdash_get_metrics_catalog',
        description: 'Get metrics catalog for a project',
        inputSchema: zodToJsonSchema(GetMetricsCatalogRequestSchema),
      },
      {
        name: 'lightdash_get_charts_as_code',
        description: 'Get charts as code for a project',
        inputSchema: zodToJsonSchema(GetChartsAsCodeRequestSchema),
      },
      {
        name: 'lightdash_get_dashboards_as_code',
        description: 'Get dashboards as code for a project',
        inputSchema: zodToJsonSchema(GetDashboardsAsCodeRequestSchema),
      },
      {
        name: 'lightdash_get_metadata',
        description: 'Get metadata for a specific table in the data catalog',
        inputSchema: zodToJsonSchema(GetMetadataRequestSchema),
      },
      {
        name: 'lightdash_get_analytics',
        description: 'Get analytics for a specific table in the data catalog',
        inputSchema: zodToJsonSchema(GetAnalyticsRequestSchema),
      },
      {
        name: 'lightdash_get_user_attributes',
        description: 'Get organization user attributes',
        inputSchema: zodToJsonSchema(GetUserAttributesRequestSchema),
      },
      {
        name: 'lightdash_list_explores',
        description:
          'List all explores (tables) available in a project. Each explore contains dimensions and metrics that can be queried.',
        inputSchema: zodToJsonSchema(ListExploresRequestSchema),
      },
      {
        name: 'lightdash_get_explore',
        description:
          'Get detailed information about a specific explore, including all dimensions, metrics, and their definitions. Use this to understand what fields are available for querying.',
        inputSchema: zodToJsonSchema(GetExploreRequestSchema),
      },
      {
        name: 'lightdash_run_query',
        description:
          'Execute a query against an explore with specified dimensions and metrics. Returns the query results as data rows. Use lightdash_get_explore first to understand available fields.',
        inputSchema: zodToJsonSchema(RunQueryRequestSchema),
      },
      {
        name: 'lightdash_compile_query',
        description:
          'Compile a query to SQL without executing it. Useful for previewing the generated SQL before running a query.',
        inputSchema: zodToJsonSchema(CompileQueryRequestSchema),
      },
      {
        name: 'lightdash_run_underlying_data_query',
        description:
          'Run a query to get the underlying row-level data for an explore. Returns detailed data rows rather than aggregated results.',
        inputSchema: zodToJsonSchema(RunUnderlyingDataQueryRequestSchema),
      },
      {
        name: 'lightdash_run_sql_query',
        description:
          'Execute a raw SQL query against the data warehouse. Use with caution - this runs arbitrary SQL.',
        inputSchema: zodToJsonSchema(RunSqlQueryRequestSchema),
      },
      {
        name: 'lightdash_calculate_total',
        description:
          'Calculate the total values for metrics in a query. Returns aggregated totals for the specified metrics.',
        inputSchema: zodToJsonSchema(CalculateTotalRequestSchema),
      },
      {
        name: 'lightdash_run_metric_explorer_query',
        description:
          'Run a time-series query for a specific metric using the Metrics Explorer. Useful for analyzing metric trends over time.',
        inputSchema: zodToJsonSchema(RunMetricExplorerQueryRequestSchema),
      },
      {
        name: 'lightdash_run_metric_total',
        description:
          'Get the total value for a metric over a time period. Optionally compare with previous period.',
        inputSchema: zodToJsonSchema(RunMetricTotalRequestSchema),
      },
      {
        name: 'lightdash_get_metrics_tree',
        description:
          'Get the hierarchical tree structure of metrics relationships.',
        inputSchema: zodToJsonSchema(GetMetricsTreeRequestSchema),
      },
      {
        name: 'lightdash_run_saved_chart',
        description:
          'Execute a saved chart and return its query results. The chart must already exist in Lightdash.',
        inputSchema: zodToJsonSchema(RunSavedChartRequestSchema),
      },
      {
        name: 'lightdash_get_chart_history',
        description:
          'Get the version history of a saved chart from the last 30 days.',
        inputSchema: zodToJsonSchema(GetChartHistoryRequestSchema),
      },
      {
        name: 'lightdash_get_chart_version',
        description: 'Get details of a specific version of a saved chart.',
        inputSchema: zodToJsonSchema(GetChartVersionRequestSchema),
      },
    ],
  };
});

server.setRequestHandler(
  CallToolRequestSchema,
  async (request: CallToolRequest) => {
    try {
      if (!request.params) {
        throw new Error('Params are required');
      }

      switch (request.params.name) {
        case 'lightdash_list_projects': {
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
        case 'lightdash_get_project': {
          const args = GetProjectRequestSchema.parse(request.params.arguments);
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}',
            {
              params: {
                path: {
                  projectUuid: args.projectUuid,
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
        case 'lightdash_list_spaces': {
          const args = ListSpacesRequestSchema.parse(request.params.arguments);
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}/spaces',
            {
              params: {
                path: {
                  projectUuid: args.projectUuid,
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
        case 'lightdash_list_charts': {
          const args = ListChartsRequestSchema.parse(request.params.arguments);
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}/charts',
            {
              params: {
                path: {
                  projectUuid: args.projectUuid,
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
        case 'lightdash_list_dashboards': {
          const args = ListDashboardsRequestSchema.parse(
            request.params.arguments
          );
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}/dashboards',
            {
              params: {
                path: {
                  projectUuid: args.projectUuid,
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
        case 'lightdash_get_custom_metrics': {
          const args = GetCustomMetricsRequestSchema.parse(
            request.params.arguments
          );
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}/custom-metrics',
            {
              params: {
                path: {
                  projectUuid: args.projectUuid,
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
        case 'lightdash_get_catalog': {
          const args = GetCatalogRequestSchema.parse(request.params.arguments);
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}/dataCatalog',
            {
              params: {
                path: {
                  projectUuid: args.projectUuid,
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
        case 'lightdash_get_metrics_catalog': {
          const args = GetMetricsCatalogRequestSchema.parse(
            request.params.arguments
          );
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}/dataCatalog/metrics',
            {
              params: {
                path: {
                  projectUuid: args.projectUuid,
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
        case 'lightdash_get_charts_as_code': {
          const args = GetChartsAsCodeRequestSchema.parse(
            request.params.arguments
          );
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}/charts/code',
            {
              params: {
                path: {
                  projectUuid: args.projectUuid,
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
        case 'lightdash_get_dashboards_as_code': {
          const args = GetDashboardsAsCodeRequestSchema.parse(
            request.params.arguments
          );
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}/dashboards/code',
            {
              params: {
                path: {
                  projectUuid: args.projectUuid,
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
        case 'lightdash_get_metadata': {
          const args = GetMetadataRequestSchema.parse(request.params.arguments);
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}/dataCatalog/{table}/metadata',
            {
              params: {
                path: {
                  projectUuid: args.projectUuid,
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
        case 'lightdash_get_analytics': {
          const args = GetAnalyticsRequestSchema.parse(
            request.params.arguments
          );
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}/dataCatalog/{table}/analytics',
            {
              params: {
                path: {
                  projectUuid: args.projectUuid,
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
        case 'lightdash_get_user_attributes': {
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
        case 'lightdash_list_explores': {
          const args = ListExploresRequestSchema.parse(
            request.params.arguments
          );
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}/explores',
            {
              params: {
                path: {
                  projectUuid: args.projectUuid,
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
        case 'lightdash_get_explore': {
          const args = GetExploreRequestSchema.parse(request.params.arguments);
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}/explores/{exploreId}',
            {
              params: {
                path: {
                  projectUuid: args.projectUuid,
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
        case 'lightdash_run_query': {
          const args = RunQueryRequestSchema.parse(request.params.arguments);
          const { data, error } = await lightdashClient.POST(
            '/api/v1/projects/{projectUuid}/explores/{exploreId}/runQuery',
            {
              params: {
                path: {
                  projectUuid: args.projectUuid,
                  exploreId: args.exploreId,
                },
              },
              body: {
                exploreName: args.exploreId,
                dimensions: args.dimensions,
                metrics: args.metrics,
                filters: args.filters ?? { dimensions: {}, metrics: {} },
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
        case 'lightdash_compile_query': {
          const args = CompileQueryRequestSchema.parse(
            request.params.arguments
          );
          const { data, error } = await lightdashClient.POST(
            '/api/v1/projects/{projectUuid}/explores/{exploreId}/compileQuery',
            {
              params: {
                path: {
                  projectUuid: args.projectUuid,
                  exploreId: args.exploreId,
                },
              },
              body: {
                exploreName: args.exploreId,
                dimensions: args.dimensions,
                metrics: args.metrics,
                filters: args.filters ?? { dimensions: {}, metrics: {} },
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
        case 'lightdash_run_underlying_data_query': {
          const args = RunUnderlyingDataQueryRequestSchema.parse(
            request.params.arguments
          );
          const { data, error } = await lightdashClient.POST(
            '/api/v1/projects/{projectUuid}/explores/{exploreId}/runUnderlyingDataQuery',
            {
              params: {
                path: {
                  projectUuid: args.projectUuid,
                  exploreId: args.exploreId,
                },
              },
              body: {
                exploreName: args.exploreId,
                dimensions: args.dimensions,
                metrics: args.metrics,
                filters: args.filters ?? { dimensions: {}, metrics: {} },
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
        case 'lightdash_run_sql_query': {
          const args = RunSqlQueryRequestSchema.parse(request.params.arguments);
          const { data, error } = await lightdashClient.POST(
            '/api/v1/projects/{projectUuid}/sqlQuery',
            {
              params: {
                path: {
                  projectUuid: args.projectUuid,
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
        case 'lightdash_calculate_total': {
          const args = CalculateTotalRequestSchema.parse(
            request.params.arguments
          );
          const { data, error } = await lightdashClient.POST(
            '/api/v1/projects/{projectUuid}/calculate-total',
            {
              params: {
                path: {
                  projectUuid: args.projectUuid,
                },
              },
              body: {
                explore: args.exploreId,
                metricQuery: {
                  exploreName: args.exploreId,
                  dimensions: args.dimensions,
                  metrics: args.metrics,
                  filters: args.filters ?? { dimensions: {}, metrics: {} },
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
        case 'lightdash_run_metric_explorer_query': {
          const args = RunMetricExplorerQueryRequestSchema.parse(
            request.params.arguments
          );
          const { data, error } = await lightdashClient.POST(
            '/api/v1/projects/{projectUuid}/metricsExplorer/{explore}/{metric}/runMetricExplorerQuery',
            {
              params: {
                path: {
                  projectUuid: args.projectUuid,
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
        case 'lightdash_run_metric_total': {
          const args = RunMetricTotalRequestSchema.parse(
            request.params.arguments
          );
          const { data, error } = await lightdashClient.POST(
            '/api/v1/projects/{projectUuid}/metricsExplorer/{explore}/{metric}/runMetricTotal',
            {
              params: {
                path: {
                  projectUuid: args.projectUuid,
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
        case 'lightdash_get_metrics_tree': {
          const args = GetMetricsTreeRequestSchema.parse(
            request.params.arguments
          );
          const { data, error } = await lightdashClient.GET(
            '/api/v1/projects/{projectUuid}/dataCatalog/metrics/tree',
            {
              params: {
                path: {
                  projectUuid: args.projectUuid,
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
        case 'lightdash_run_saved_chart': {
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
        case 'lightdash_get_chart_history': {
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
        case 'lightdash_get_chart_version': {
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
