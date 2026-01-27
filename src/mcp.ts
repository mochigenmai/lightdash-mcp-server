import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  type CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { createLightdashClient } from 'lightdash-client-typescript-fetch';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Logging } from '@google-cloud/logging';

// Google Cloud Logging クライアント
const logging = new Logging();
const log = logging.log('lightdash-mcp-server');

// API request logging helper
const logApiRequest = async <T>(
  method: string,
  endpoint: string,
  params: unknown,
  apiCall: () => Promise<T>
): Promise<T> => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  // Log request start
  const startLogMessage = {
    requestId,
    event: 'api_request_start',
    method,
    endpoint,
    params: JSON.stringify(params),
    timestamp: new Date().toISOString(),
  };
  const startEntry = log.entry({ severity: 'INFO' }, startLogMessage);
  log.write(startEntry).catch((err) => {
    console.error('[INFO] API Request Start:', JSON.stringify(startLogMessage));
  });

  try {
    const result = await apiCall();
    const duration = Date.now() - startTime;

    // Log request success
    const successLogMessage = {
      requestId,
      event: 'api_request_success',
      method,
      endpoint,
      durationMs: duration,
      timestamp: new Date().toISOString(),
    };
    const successEntry = log.entry({ severity: 'INFO' }, successLogMessage);
    log.write(successEntry).catch((err) => {
      console.error('[INFO] API Request Success:', JSON.stringify(successLogMessage));
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log request failure
    const errorLogMessage = {
      requestId,
      event: 'api_request_error',
      method,
      endpoint,
      durationMs: duration,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
    const errorEntry = log.entry({ severity: 'ERROR' }, errorLogMessage);
    log.write(errorEntry).catch((err) => {
      console.error('[ERROR] API Request Error:', JSON.stringify(errorLogMessage));
    });

    throw error;
  }
};
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
  toFieldId,
  normalizeFilters,
  type FieldReference,
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
      // ===== ORGANIZATION & PROJECT DISCOVERY =====
      // Entry point tools - no dependencies, call these first
      {
        name: 'list_projects',
        description: `List all projects in the Lightdash organization.

**Category:** Discovery (no dependencies)

**This is typically the first tool to call** when you don't know the projectUuid.

**Response includes:** Project UUIDs, names, and metadata.

**Next steps:** Use the returned projectUuid in any project-scoped tool.`,
        inputSchema: zodToJsonSchema(ListProjectsRequestSchema),
      },
      {
        name: 'get_project',
        description: `Get detailed information about a specific project.

**Category:** Discovery

**Dependency:** Requires projectUuid (from list_projects or environment variable)

**Response includes:** Project settings, warehouse connection info, dbt connection details.`,
        inputSchema: zodToJsonSchema(GetProjectRequestSchema),
      },
      {
        name: 'list_spaces',
        description: `List all spaces (folders) in a project that organize charts and dashboards.

**Category:** Discovery

**Dependency:** Requires projectUuid

**Response includes:** Space UUIDs, names, and access information.`,
        inputSchema: zodToJsonSchema(ListSpacesRequestSchema),
      },
      // ===== CHARTS & DASHBOARDS =====
      // Chart workflow: list_charts → run_saved_chart / get_chart_history → get_chart_version
      {
        name: 'list_charts',
        description: `List all saved charts in a project.

**Category:** Chart Discovery

**Dependency:** Requires projectUuid

**Enables these tools (provides chartUuid):**
- run_saved_chart: Execute the chart's query
- get_chart_history: Get version history (last 30 days)

**Response includes:** Chart UUIDs (uuid field), names, space information.

**Workflow example:**
1. list_charts → get chartUuid
2. run_saved_chart(chartUuid) → execute and get results
   OR
2. get_chart_history(chartUuid) → get versionUuid
3. get_chart_version(chartUuid, versionUuid) → get specific version`,
        inputSchema: zodToJsonSchema(ListChartsRequestSchema),
      },
      {
        name: 'list_dashboards',
        description: `List all dashboards in a project.

**Category:** Dashboard Discovery

**Dependency:** Requires projectUuid

**Response includes:** Dashboard UUIDs, names, space information.`,
        inputSchema: zodToJsonSchema(ListDashboardsRequestSchema),
      },
      // ===== CATALOG & METRICS DISCOVERY =====
      // Metrics Explorer workflow: list_metrics → run_metric_timeseries / get_metric_total / get_metrics_tree
      {
        name: 'list_custom_metrics',
        description: `List custom metrics defined for a project.

**Category:** Catalog Discovery

**Dependency:** Requires projectUuid

**Response includes:** Custom metric definitions and configurations.`,
        inputSchema: zodToJsonSchema(GetCustomMetricsRequestSchema),
      },
      {
        name: 'get_catalog',
        description: `Get the full data catalog for a project, including all tables and their fields.

**Category:** Catalog Discovery

**Dependency:** Requires projectUuid

**Enables these tools (provides table names):**
- get_table_metadata: Get detailed table metadata
- get_table_analytics: Get table usage analytics

**Response includes:** Table names, field information, and catalog metadata.`,
        inputSchema: zodToJsonSchema(GetCatalogRequestSchema),
      },
      {
        name: 'list_metrics',
        description: `List all metrics from the metrics catalog. **REQUIRED before using Metrics Explorer tools.**

**Category:** Metrics Discovery

**Dependency:** Requires projectUuid

**Enables these tools (provides metric info):**
- run_metric_timeseries: Use "name" (metric) and "tableName" (explore) fields
- get_metric_total: Use "name" (metric) and "tableName" (explore) fields
- get_metrics_tree: Use "catalogSearchUuid" field

**Response fields to use:**
- name → metric parameter in Metrics Explorer tools
- tableName → explore parameter in Metrics Explorer tools
- catalogSearchUuid → metricUuids parameter in get_metrics_tree

**Workflow:**
1. list_metrics → get metric name and tableName
2. run_metric_timeseries or get_metric_total with values from step 1

**If you need run_query:** Call get_explore and use { table, field } objects from its response.`,
        inputSchema: zodToJsonSchema(GetMetricsCatalogRequestSchema),
      },
      // ===== CODE EXPORT =====
      {
        name: 'get_charts_as_code',
        description: `Export all charts in a project as code (YAML format).

**Category:** Code Export

**Dependency:** Requires projectUuid

**Use case:** Version control, backup, or migration of chart definitions.`,
        inputSchema: zodToJsonSchema(GetChartsAsCodeRequestSchema),
      },
      {
        name: 'get_dashboards_as_code',
        description: `Export all dashboards in a project as code (YAML format).

**Category:** Code Export

**Dependency:** Requires projectUuid

**Use case:** Version control, backup, or migration of dashboard definitions.`,
        inputSchema: zodToJsonSchema(GetDashboardsAsCodeRequestSchema),
      },
      // ===== TABLE METADATA & ANALYTICS =====
      // Depends on: get_catalog (to get table names)
      {
        name: 'get_table_metadata',
        description: `Get detailed metadata for a specific table in the data catalog.

**Category:** Table Metadata

**Dependencies:**
- Requires projectUuid
- Requires table name (from get_catalog response)

**Workflow:**
1. get_catalog → find table name
2. get_table_metadata(table=<table_name>) → get metadata

**Response includes:** Column definitions, data types, descriptions.`,
        inputSchema: zodToJsonSchema(GetMetadataRequestSchema),
      },
      {
        name: 'get_table_analytics',
        description: `Get usage analytics for a specific table in the data catalog.

**Category:** Table Analytics

**Dependencies:**
- Requires projectUuid
- Requires table name (from get_catalog response)

**Workflow:**
1. get_catalog → find table name
2. get_table_analytics(table=<table_name>) → get analytics

**Response includes:** Query counts, usage patterns, popular fields.`,
        inputSchema: zodToJsonSchema(GetAnalyticsRequestSchema),
      },
      // ===== USER & ORGANIZATION =====
      {
        name: 'list_user_attributes',
        description: `List all user attributes defined at the organization level.

**Category:** Organization Settings (no dependencies)

**Response includes:** Attribute names, types, and configurations.`,
        inputSchema: zodToJsonSchema(GetUserAttributesRequestSchema),
      },
      // ===== EXPLORE DISCOVERY =====
      // Query workflow: list_explores → get_explore → run_query / compile_query / run_raw_data_query / calculate_metrics_total
      {
        name: 'list_explores',
        description: `List all explores (data models) available in a project. **FIRST STEP for building queries.**

**Category:** Explore Discovery

**Dependency:** Requires projectUuid

**Enables these tools (provides explore names):**
- get_explore: Get field definitions (REQUIRED before run_query)
- run_query: Execute queries
- compile_query: Preview SQL
- run_raw_data_query: Get raw data
- calculate_metrics_total: Get totals

**Response includes:** Explore names (use as exploreId in subsequent tools).

**Query workflow:**
1. list_explores → get explore name
2. get_explore → get field IDs
3. run_query → get results`,
        inputSchema: zodToJsonSchema(ListExploresRequestSchema),
      },
      {
        name: 'get_explore',
        description: `Get detailed explore definition including all dimensions and metrics. **REQUIRED before using query tools.**

**Category:** Explore Details

**Dependencies:**
- Requires projectUuid
- Requires exploreId (from list_explores response)

**Enables these tools (provides table and field names):**
- run_query
- compile_query
- run_raw_data_query
- calculate_metrics_total

**How to extract table and field names from response:**

The response has this structure:
{
  "tables": {
    "<table_name>": {
      "dimensions": { "<field_name>": {...}, ... },
      "metrics": { "<field_name>": {...}, ... }
    }
  }
}

**Use in query tools:**
- table: The key under "tables"
- field: The key under "dimensions" or "metrics"

**Example:** { "table": "<table_name>", "field": "<field_name>" }`,
        inputSchema: zodToJsonSchema(GetExploreRequestSchema),
      },
      // ===== QUERY EXECUTION =====
      // All query tools depend on: list_explores → get_explore (for field IDs)
      {
        name: 'run_query',
        description: `Execute a query against an explore and return data rows.

**Category:** Query Execution

**Dependencies (MUST call in order):**
1. list_explores → get explore name
2. get_explore → get table names and field names

**Parameters (object format):**
- exploreId: From list_explores
- dimensions: Array of { table, field } objects from get_explore
- metrics: Array of { table, field } objects from get_explore
- sorts: Optional array of { table, field, descending } objects
- filters: Optional filter conditions
- limit: Number of rows (default: 500, max: 5000)

**Example:**
{
  "exploreId": "<explore_name>",
  "dimensions": [
    { "table": "<table_name>", "field": "<dimension_field>" }
  ],
  "metrics": [
    { "table": "<table_name>", "field": "<metric_field>" }
  ],
  "sorts": [
    { "table": "<table_name>", "field": "<field_name>", "descending": false }
  ]
}

**Constraints:**
- At least one dimension OR one metric is required
- Max limit: 5000 rows (default: 500)

**Complete workflow:**
1. list_explores → get explore name
2. get_explore → extract table and field names from response
3. run_query with { table, field } objects from step 2`,
        inputSchema: zodToJsonSchema(RunQueryRequestSchema),
      },
      {
        name: 'compile_query',
        description: `Compile a query to SQL without executing it. Preview the generated SQL.

**Category:** Query Preview

**Dependencies (MUST call in order):**
1. list_explores → get explore name
2. get_explore → get table names and field names

**Same parameters as run_query (uses { table, field } objects).**

**Constraints:**
- At least one dimension OR one metric is required

**Use case:** Verify the SQL before running run_query.`,
        inputSchema: zodToJsonSchema(CompileQueryRequestSchema),
      },
      {
        name: 'run_raw_data_query',
        description: `Query underlying row-level data (not aggregated).

**Category:** Query Execution

**Dependencies (MUST call in order):**
1. list_explores → get explore name
2. get_explore → get table names and field names

**Same parameters as run_query (uses { table, field } objects).**

**Constraints:**
- At least one dimension OR one metric is required

**Difference from run_query:** Returns individual rows instead of aggregated/grouped results.`,
        inputSchema: zodToJsonSchema(RunUnderlyingDataQueryRequestSchema),
      },
      {
        name: 'run_sql_query',
        description: `Execute raw SQL directly against the data warehouse.

**Category:** Direct SQL

**Dependency:** Requires projectUuid only (no explore/field dependencies)

**Warning:** Runs arbitrary SQL. Use with caution.

**Parameters:**
- sql: The SQL query string to execute

**Use case:** When you need full SQL control or the explore model doesn't support your query.`,
        inputSchema: zodToJsonSchema(RunSqlQueryRequestSchema),
      },
      {
        name: 'calculate_metrics_total',
        description: `Calculate grand totals for metrics across all matching rows.

**Category:** Query Execution

**Dependencies (MUST call in order):**
1. list_explores → get explore name
2. get_explore → get table names and field names

**Same parameters as run_query (uses { table, field } objects).**

**Constraints:**
- At least one dimension OR one metric is required

**Use case:** Get summary totals for metrics.`,
        inputSchema: zodToJsonSchema(CalculateTotalRequestSchema),
      },
      // ===== METRICS EXPLORER =====
      // All Metrics Explorer tools depend on: list_metrics (for explore/metric names)
      {
        name: 'run_metric_timeseries',
        description: `Query a metric over time (time-series analysis).

**Category:** Metrics Explorer

**Dependency (MUST call first):**
- list_metrics → get "name" (metric) and "tableName" (explore) fields

**Parameters:**
- explore: From list_metrics.tableName
- metric: From list_metrics.name
- startDate: Start date (YYYY-MM-DD format)
- endDate: End date (YYYY-MM-DD format)
- comparison: Optional. Set to "previous_period" to compare with previous period. OMIT this parameter for no comparison (do NOT set to "none").
- segmentDimension: Optional, field ID in "{table}_{field_name}" format from get_explore (only when comparison is omitted)
- timeDimensionOverride: Optional, usually not needed (API uses default time dimension). If needed, call get_explore first to get exact field names:
  - table: table name from get_explore
  - field: EXACT field name from get_explore response - NEVER guess
  - interval: DAY, WEEK, MONTH, or YEAR

**Important differences from run_query:**
- Uses Metrics Explorer API, NOT the query API
- metric parameter is just the name, NOT "{table}_{field_name}" format
- explore parameter is the tableName from list_metrics

**Workflow:**
1. list_metrics → get metric name and tableName
2. run_metric_timeseries with values from step 1`,
        inputSchema: zodToJsonSchema(RunMetricExplorerQueryRequestSchema),
      },
      {
        name: 'get_metric_total',
        description: `Get the total value for a metric over a time period, with optional period comparison.

**Category:** Metrics Explorer

**Dependency (MUST call first):**
- list_metrics → get "name" (metric) and "tableName" (explore) fields

**Parameters:**
- explore: From list_metrics.tableName
- metric: From list_metrics.name
- startDate: Start date (YYYY-MM-DD format)
- endDate: End date (YYYY-MM-DD format)
- timeFrame: Time aggregation
- granularity: Time grain
- comparisonType: Optional, "none" or "previous_period"

**Workflow:**
1. list_metrics → get metric name and tableName
2. get_metric_total with values from step 1`,
        inputSchema: zodToJsonSchema(RunMetricTotalRequestSchema),
      },
      {
        name: 'get_metrics_tree',
        description: `Get hierarchical tree showing metric relationships.

**Category:** Metrics Explorer

**Dependency (MUST call first):**
- list_metrics → get "catalogSearchUuid" field for each metric

**Parameters:**
- metricUuids: Array of UUIDs from list_metrics.catalogSearchUuid

**Workflow:**
1. list_metrics → get catalogSearchUuid values
2. get_metrics_tree with UUIDs from step 1

**Use case:** Understand metric dependencies and relationships.`,
        inputSchema: zodToJsonSchema(GetMetricsTreeRequestSchema),
      },
      // ===== SAVED CHART OPERATIONS =====
      // Chart workflow: list_charts → run_saved_chart / get_chart_history → get_chart_version
      {
        name: 'run_saved_chart',
        description: `Execute a saved chart and return its query results.

**Category:** Chart Execution

**Dependency (MUST call first):**
- list_charts → get chartUuid (the "uuid" field in response)

**Parameters:**
- chartUuid: From list_charts response (UUID format)
- invalidateCache: Optional, set true to bypass cache

**Workflow:**
1. list_charts → find chart, get uuid field
2. run_saved_chart(chartUuid="<uuid>")`,
        inputSchema: zodToJsonSchema(RunSavedChartRequestSchema),
      },
      {
        name: 'get_chart_history',
        description: `Get version history of a saved chart (last 30 days).

**Category:** Chart History

**Dependency (MUST call first):**
- list_charts → get chartUuid

**Enables:**
- get_chart_version (provides versionUuid)

**Parameters:**
- chartUuid: From list_charts response

**Response includes:** Array of versions with versionUuid for each.

**Workflow:**
1. list_charts → get chartUuid
2. get_chart_history(chartUuid) → get versionUuid
3. get_chart_version(chartUuid, versionUuid) → get version details`,
        inputSchema: zodToJsonSchema(GetChartHistoryRequestSchema),
      },
      {
        name: 'get_chart_version',
        description: `Get details of a specific chart version.

**Category:** Chart History

**Dependencies (MUST call in order):**
1. list_charts → get chartUuid
2. get_chart_history → get versionUuid

**Parameters:**
- chartUuid: From list_charts response
- versionUuid: From get_chart_history response

**Workflow:**
1. list_charts → get chartUuid
2. get_chart_history(chartUuid) → get versionUuid
3. get_chart_version(chartUuid, versionUuid)`,
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

const validateQueryFields = (
  dimensions: FieldReference[],
  metrics: FieldReference[]
): void => {
  if (dimensions.length === 0 && metrics.length === 0) {
    throw new Error(
      'At least one dimension or metric is required. Both dimensions and metrics arrays cannot be empty.'
    );
  }
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
          const { data, error } = await logApiRequest(
            'GET',
            '/api/v1/org/projects',
            {},
            () => lightdashClient.GET('/api/v1/org/projects', {})
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
          const { data, error } = await logApiRequest(
            'GET',
            `/api/v1/projects/${projectUuid}`,
            { projectUuid },
            () =>
              lightdashClient.GET('/api/v1/projects/{projectUuid}', {
                params: {
                  path: {
                    projectUuid,
                  },
                },
              })
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
          const { data, error } = await logApiRequest(
            'GET',
            `/api/v1/projects/${projectUuid}/spaces`,
            { projectUuid },
            () =>
              lightdashClient.GET('/api/v1/projects/{projectUuid}/spaces', {
                params: {
                  path: {
                    projectUuid,
                  },
                },
              })
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
          const { data, error } = await logApiRequest(
            'GET',
            `/api/v1/projects/${projectUuid}/charts`,
            { projectUuid },
            () =>
              lightdashClient.GET('/api/v1/projects/{projectUuid}/charts', {
                params: {
                  path: {
                    projectUuid,
                  },
                },
              })
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
          const { data, error } = await logApiRequest(
            'GET',
            `/api/v1/projects/${projectUuid}/dashboards`,
            { projectUuid },
            () =>
              lightdashClient.GET('/api/v1/projects/{projectUuid}/dashboards', {
                params: {
                  path: {
                    projectUuid,
                  },
                },
              })
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
          const { data, error } = await logApiRequest(
            'GET',
            `/api/v1/projects/${projectUuid}/custom-metrics`,
            { projectUuid },
            () =>
              lightdashClient.GET(
                '/api/v1/projects/{projectUuid}/custom-metrics',
                {
                  params: {
                    path: {
                      projectUuid,
                    },
                  },
                }
              )
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
          const { data, error } = await logApiRequest(
            'GET',
            `/api/v1/projects/${projectUuid}/dataCatalog`,
            { projectUuid },
            () =>
              lightdashClient.GET('/api/v1/projects/{projectUuid}/dataCatalog', {
                params: {
                  path: {
                    projectUuid,
                  },
                },
              })
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
          const { data, error } = await logApiRequest(
            'GET',
            `/api/v1/projects/${projectUuid}/dataCatalog/metrics`,
            { projectUuid },
            () =>
              lightdashClient.GET(
                '/api/v1/projects/{projectUuid}/dataCatalog/metrics',
                {
                  params: {
                    path: {
                      projectUuid,
                    },
                  },
                }
              )
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
          const { data, error } = await logApiRequest(
            'GET',
            `/api/v1/projects/${projectUuid}/charts/code`,
            { projectUuid },
            () =>
              lightdashClient.GET('/api/v1/projects/{projectUuid}/charts/code', {
                params: {
                  path: {
                    projectUuid,
                  },
                },
              })
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
          const { data, error } = await logApiRequest(
            'GET',
            `/api/v1/projects/${projectUuid}/dashboards/code`,
            { projectUuid },
            () =>
              lightdashClient.GET(
                '/api/v1/projects/{projectUuid}/dashboards/code',
                {
                  params: {
                    path: {
                      projectUuid,
                    },
                  },
                }
              )
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
          const { data, error } = await logApiRequest(
            'GET',
            `/api/v1/projects/${projectUuid}/dataCatalog/${args.table}/metadata`,
            { projectUuid, table: args.table },
            () =>
              lightdashClient.GET(
                '/api/v1/projects/{projectUuid}/dataCatalog/{table}/metadata',
                {
                  params: {
                    path: {
                      projectUuid,
                      table: args.table,
                    },
                  },
                }
              )
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
          const { data, error } = await logApiRequest(
            'GET',
            `/api/v1/projects/${projectUuid}/dataCatalog/${args.table}/analytics`,
            { projectUuid, table: args.table },
            () =>
              lightdashClient.GET(
                '/api/v1/projects/{projectUuid}/dataCatalog/{table}/analytics',
                {
                  params: {
                    path: {
                      projectUuid,
                      table: args.table,
                    },
                  },
                }
              )
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
          const { data, error } = await logApiRequest(
            'GET',
            '/api/v1/org/attributes',
            {},
            () => lightdashClient.GET('/api/v1/org/attributes', {})
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
          const { data, error } = await logApiRequest(
            'GET',
            `/api/v1/projects/${projectUuid}/explores`,
            { projectUuid },
            () =>
              lightdashClient.GET('/api/v1/projects/{projectUuid}/explores', {
                params: {
                  path: {
                    projectUuid,
                  },
                },
              })
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
          const { data, error } = await logApiRequest(
            'GET',
            `/api/v1/projects/${projectUuid}/explores/${args.exploreId}`,
            { projectUuid, exploreId: args.exploreId },
            () =>
              lightdashClient.GET(
                '/api/v1/projects/{projectUuid}/explores/{exploreId}',
                {
                  params: {
                    path: {
                      projectUuid,
                      exploreId: args.exploreId,
                    },
                  },
                }
              )
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
          validateQueryFields(args.dimensions, args.metrics);

          // Convert field references to field IDs
          const dimensionIds = args.dimensions.map(toFieldId);
          const metricIds = args.metrics.map(toFieldId);
          const sortConfigs = args.sorts?.map((sort) => ({
            fieldId: toFieldId({ table: sort.table, field: sort.field }),
            descending: sort.descending,
          })) ?? [];
          const normalizedFilters = normalizeFilters(args.filters);

          const requestBody = {
            exploreName: args.exploreId,
            dimensions: dimensionIds,
            metrics: metricIds,
            filters: normalizedFilters ?? {
              dimensions: { and: [], id: 'root' },
              metrics: { and: [], id: 'root' },
            },
            sorts: sortConfigs,
            limit: args.limit ?? 500,
            tableCalculations: args.tableCalculations ?? [],
          };

          const { data, error } = await logApiRequest(
            'POST',
            `/api/v1/projects/${projectUuid}/explores/${args.exploreId}/runQuery`,
            { projectUuid, exploreId: args.exploreId, body: requestBody },
            () =>
              lightdashClient.POST(
                '/api/v1/projects/{projectUuid}/explores/{exploreId}/runQuery',
                {
                  params: {
                    path: {
                      projectUuid,
                      exploreId: args.exploreId,
                    },
                  },
                  body: requestBody,
                }
              )
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
          validateQueryFields(args.dimensions, args.metrics);

          // Convert field references to field IDs
          const dimensionIds = args.dimensions.map(toFieldId);
          const metricIds = args.metrics.map(toFieldId);
          const sortConfigs = args.sorts?.map((sort) => ({
            fieldId: toFieldId({ table: sort.table, field: sort.field }),
            descending: sort.descending,
          })) ?? [];
          const normalizedFilters = normalizeFilters(args.filters);

          const requestBody = {
            exploreName: args.exploreId,
            dimensions: dimensionIds,
            metrics: metricIds,
            filters: normalizedFilters ?? {
              dimensions: { and: [], id: 'root' },
              metrics: { and: [], id: 'root' },
            },
            sorts: sortConfigs,
            limit: args.limit ?? 500,
            tableCalculations: args.tableCalculations ?? [],
          };

          const { data, error } = await logApiRequest(
            'POST',
            `/api/v1/projects/${projectUuid}/explores/${args.exploreId}/compileQuery`,
            { projectUuid, exploreId: args.exploreId, body: requestBody },
            () =>
              lightdashClient.POST(
                '/api/v1/projects/{projectUuid}/explores/{exploreId}/compileQuery',
                {
                  params: {
                    path: {
                      projectUuid,
                      exploreId: args.exploreId,
                    },
                  },
                  body: requestBody,
                }
              )
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
          validateQueryFields(args.dimensions, args.metrics);

          // Convert field references to field IDs
          const dimensionIds = args.dimensions.map(toFieldId);
          const metricIds = args.metrics.map(toFieldId);
          const sortConfigs = args.sorts?.map((sort) => ({
            fieldId: toFieldId({ table: sort.table, field: sort.field }),
            descending: sort.descending,
          })) ?? [];
          const normalizedFilters = normalizeFilters(args.filters);

          const requestBody = {
            exploreName: args.exploreId,
            dimensions: dimensionIds,
            metrics: metricIds,
            filters: normalizedFilters ?? {
              dimensions: { and: [], id: 'root' },
              metrics: { and: [], id: 'root' },
            },
            sorts: sortConfigs,
            limit: args.limit ?? 500,
            tableCalculations: args.tableCalculations ?? [],
          };

          const { data, error } = await logApiRequest(
            'POST',
            `/api/v1/projects/${projectUuid}/explores/${args.exploreId}/runUnderlyingDataQuery`,
            { projectUuid, exploreId: args.exploreId, body: requestBody },
            () =>
              lightdashClient.POST(
                '/api/v1/projects/{projectUuid}/explores/{exploreId}/runUnderlyingDataQuery',
                {
                  params: {
                    path: {
                      projectUuid,
                      exploreId: args.exploreId,
                    },
                  },
                  body: requestBody,
                }
              )
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
          const { data, error } = await logApiRequest(
            'POST',
            `/api/v1/projects/${projectUuid}/sqlQuery`,
            { projectUuid, sql: args.sql.substring(0, 500) + (args.sql.length > 500 ? '...' : '') },
            () =>
              lightdashClient.POST('/api/v1/projects/{projectUuid}/sqlQuery', {
                params: {
                  path: {
                    projectUuid,
                  },
                },
                body: {
                  sql: args.sql,
                },
              })
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
          validateQueryFields(args.dimensions, args.metrics);

          // Convert field references to field IDs
          const dimensionIds = args.dimensions.map(toFieldId);
          const metricIds = args.metrics.map(toFieldId);
          const sortConfigs = args.sorts?.map((sort) => ({
            fieldId: toFieldId({ table: sort.table, field: sort.field }),
            descending: sort.descending,
          })) ?? [];
          const normalizedFilters = normalizeFilters(args.filters);

          const requestBody = {
            explore: args.exploreId,
            metricQuery: {
              exploreName: args.exploreId,
              dimensions: dimensionIds,
              metrics: metricIds,
              filters: normalizedFilters ?? {
                dimensions: { and: [], id: 'root' },
                metrics: { and: [], id: 'root' },
              },
              sorts: sortConfigs,
              limit: args.limit ?? 500,
              tableCalculations: args.tableCalculations ?? [],
            },
          };

          const { data, error } = await logApiRequest(
            'POST',
            `/api/v1/projects/${projectUuid}/calculate-total`,
            { projectUuid, exploreId: args.exploreId, body: requestBody },
            () =>
              lightdashClient.POST('/api/v1/projects/{projectUuid}/calculate-total', {
                params: {
                  path: {
                    projectUuid,
                  },
                },
                body: requestBody,
              })
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

          // Build query object based on provided parameters
          // The API expects different query shapes based on comparison type (anyOf union):
          // 1. { comparison: 'none', segmentDimension: string | null } - for segmentation
          // 2. { comparison: 'previous_period' } - for period comparison
          // 3. { comparison: 'different_metric', metric: {...} } - for metric comparison (not supported in this tool)
          let query: Record<string, unknown>;
          if (args.comparison === 'previous_period') {
            // Previous period comparison - no segmentDimension allowed
            query = {
              comparison: 'previous_period',
            };
          } else {
            // No comparison - use segmentation query type
            query = {
              comparison: 'none',
              segmentDimension: args.segmentDimension ?? null,
            };
          }

          const { data, error } = await logApiRequest(
            'POST',
            `/api/v1/projects/${projectUuid}/metricsExplorer/${args.explore}/${args.metric}/runMetricExplorerQuery`,
            {
              projectUuid,
              explore: args.explore,
              metric: args.metric,
              startDate: args.startDate,
              endDate: args.endDate,
              query,
            },
            () =>
              lightdashClient.POST(
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
                    query,
                    timeDimensionOverride: args.timeDimensionOverride,
                  },
                }
              )
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
          const { data, error } = await logApiRequest(
            'POST',
            `/api/v1/projects/${projectUuid}/metricsExplorer/${args.explore}/${args.metric}/runMetricTotal`,
            {
              projectUuid,
              explore: args.explore,
              metric: args.metric,
              startDate: args.startDate,
              endDate: args.endDate,
              timeFrame: args.timeFrame,
              granularity: args.granularity,
              comparisonType: args.comparisonType,
            },
            () =>
              lightdashClient.POST(
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
                      granularity: args.granularity,
                    },
                  },
                  body: args.comparisonType
                    ? { comparisonType: args.comparisonType }
                    : undefined,
                }
              )
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
          const { data, error } = await logApiRequest(
            'GET',
            `/api/v1/projects/${projectUuid}/dataCatalog/metrics/tree`,
            { projectUuid, metricUuids: args.metricUuids },
            () =>
              lightdashClient.GET(
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
              )
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
          const { data, error } = await logApiRequest(
            'POST',
            `/api/v1/saved/${args.chartUuid}/results`,
            { chartUuid: args.chartUuid, invalidateCache: args.invalidateCache ?? false },
            () =>
              lightdashClient.POST('/api/v1/saved/{chartUuid}/results', {
                params: {
                  path: {
                    chartUuid: args.chartUuid,
                  },
                },
                body: {
                  invalidateCache: args.invalidateCache ?? false,
                },
              })
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
          const { data, error } = await logApiRequest(
            'GET',
            `/api/v1/saved/${args.chartUuid}/history`,
            { chartUuid: args.chartUuid },
            () =>
              lightdashClient.GET('/api/v1/saved/{chartUuid}/history', {
                params: {
                  path: {
                    chartUuid: args.chartUuid,
                  },
                },
              })
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
          const { data, error } = await logApiRequest(
            'GET',
            `/api/v1/saved/${args.chartUuid}/version/${args.versionUuid}`,
            { chartUuid: args.chartUuid, versionUuid: args.versionUuid },
            () =>
              lightdashClient.GET(
                '/api/v1/saved/{chartUuid}/version/{versionUuid}',
                {
                  params: {
                    path: {
                      chartUuid: args.chartUuid,
                      versionUuid: args.versionUuid,
                    },
                  },
                }
              )
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
      // 改行を含むログを1つのエントリとして Cloud Logging に出力
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      const logMessage = `Error handling request: ${errorMessage}\nRequest params:\n${JSON.stringify(request.params, null, 2)}`;

      const metadata = { severity: 'ERROR' };
      const entry = log.entry(metadata, logMessage);
      log.write(entry).catch((err) => {
        // Cloud Logging への書き込みに失敗した場合はフォールバック
        console.error('Failed to write to Cloud Logging:', err);
        console.error(logMessage);
      });

      throw new Error(errorMessage);
    }
  }
);
