import { z } from 'zod';

export const ListProjectsRequestSchema = z.object({});

export const GetProjectRequestSchema = z.object({
  projectUuid: z
    .string()
    .uuid()
    .describe(
      'The UUID of the project. You can obtain it from the project list.'
    ),
});

export const ListSpacesRequestSchema = z.object({
  projectUuid: z
    .string()
    .uuid()
    .describe(
      'The UUID of the project. You can obtain it from the project list.'
    ),
});

export const ListChartsRequestSchema = z.object({
  projectUuid: z
    .string()
    .uuid()
    .describe(
      'The UUID of the project. You can obtain it from the project list.'
    ),
});

export const ListDashboardsRequestSchema = z.object({
  projectUuid: z
    .string()
    .uuid()
    .describe(
      'The UUID of the project. You can obtain it from the project list.'
    ),
});

export const GetCustomMetricsRequestSchema = z.object({
  projectUuid: z
    .string()
    .uuid()
    .describe(
      'The UUID of the project. You can obtain it from the project list.'
    ),
});

export const GetCatalogRequestSchema = z.object({
  projectUuid: z
    .string()
    .uuid()
    .describe(
      'The UUID of the project. You can obtain it from the project list.'
    ),
});

export const GetMetricsCatalogRequestSchema = z.object({
  projectUuid: z
    .string()
    .uuid()
    .describe(
      'The UUID of the project. You can obtain it from the project list.'
    ),
});

export const GetChartsAsCodeRequestSchema = z.object({
  projectUuid: z
    .string()
    .uuid()
    .describe(
      'The UUID of the project. You can obtain it from the project list.'
    ),
});

export const GetDashboardsAsCodeRequestSchema = z.object({
  projectUuid: z
    .string()
    .uuid()
    .describe(
      'The UUID of the project. You can obtain it from the project list.'
    ),
});

export const GetMetadataRequestSchema = z.object({
  projectUuid: z
    .string()
    .uuid()
    .describe(
      'The UUID of the project. You can obtain it from the project list.'
    ),
  table: z.string().min(1, 'Table name cannot be empty'),
});

export const GetAnalyticsRequestSchema = z.object({
  projectUuid: z
    .string()
    .uuid()
    .describe(
      'The UUID of the project. You can obtain it from the project list.'
    ),
  table: z.string(),
});

export const GetUserAttributesRequestSchema = z.object({});

export const ListExploresRequestSchema = z.object({
  projectUuid: z
    .string()
    .uuid()
    .describe(
      'The UUID of the project. You can obtain it from the project list.'
    ),
});

export const GetExploreRequestSchema = z.object({
  projectUuid: z
    .string()
    .uuid()
    .describe(
      'The UUID of the project. You can obtain it from the project list.'
    ),
  exploreId: z
    .string()
    .min(1)
    .describe(
      'The ID of the explore (table name). You can obtain it from the explores list.'
    ),
});

export const RunQueryRequestSchema = z.object({
  projectUuid: z
    .string()
    .uuid()
    .describe(
      'The UUID of the project. You can obtain it from the project list.'
    ),
  exploreId: z
    .string()
    .min(1)
    .describe(
      'The ID of the explore (table name). You can obtain it from the explores list.'
    ),
  dimensions: z
    .array(z.string())
    .describe(
      'Array of dimension field IDs to include in the query (e.g., ["orders_status", "customers_country"])'
    ),
  metrics: z
    .array(z.string())
    .describe(
      'Array of metric field IDs to include in the query (e.g., ["orders_total_revenue", "orders_count"])'
    ),
  filters: z
    .object({
      dimensions: z.any().optional(),
      metrics: z.any().optional(),
    })
    .optional()
    .describe('Optional filters to apply to the query'),
  sorts: z
    .array(
      z.object({
        fieldId: z.string(),
        descending: z.boolean(),
      })
    )
    .optional()
    .describe('Optional sort configuration'),
  limit: z
    .number()
    .int()
    .positive()
    .max(5000)
    .optional()
    .default(500)
    .describe('Maximum number of rows to return (default: 500, max: 5000)'),
  tableCalculations: z
    .array(
      z.object({
        name: z.string(),
        displayName: z.string(),
        sql: z.string(),
      })
    )
    .optional()
    .default([])
    .describe('Optional table calculations'),
});

export const CompileQueryRequestSchema = z.object({
  projectUuid: z
    .string()
    .uuid()
    .describe(
      'The UUID of the project. You can obtain it from the project list.'
    ),
  exploreId: z
    .string()
    .min(1)
    .describe(
      'The ID of the explore (table name). You can obtain it from the explores list.'
    ),
  dimensions: z
    .array(z.string())
    .describe(
      'Array of dimension field IDs to include in the query (e.g., ["orders_status", "customers_country"])'
    ),
  metrics: z
    .array(z.string())
    .describe(
      'Array of metric field IDs to include in the query (e.g., ["orders_total_revenue", "orders_count"])'
    ),
  filters: z
    .object({
      dimensions: z.any().optional(),
      metrics: z.any().optional(),
    })
    .optional()
    .describe('Optional filters to apply to the query'),
  sorts: z
    .array(
      z.object({
        fieldId: z.string(),
        descending: z.boolean(),
      })
    )
    .optional()
    .describe('Optional sort configuration'),
  limit: z
    .number()
    .int()
    .positive()
    .max(5000)
    .optional()
    .default(500)
    .describe('Maximum number of rows to return (default: 500, max: 5000)'),
  tableCalculations: z
    .array(
      z.object({
        name: z.string(),
        displayName: z.string(),
        sql: z.string(),
      })
    )
    .optional()
    .default([])
    .describe('Optional table calculations'),
});

export const RunUnderlyingDataQueryRequestSchema = z.object({
  projectUuid: z
    .string()
    .uuid()
    .describe(
      'The UUID of the project. You can obtain it from the project list.'
    ),
  exploreId: z
    .string()
    .min(1)
    .describe(
      'The ID of the explore (table name). You can obtain it from the explores list.'
    ),
  dimensions: z
    .array(z.string())
    .describe('Array of dimension field IDs to include in the query'),
  metrics: z
    .array(z.string())
    .describe('Array of metric field IDs to include in the query'),
  filters: z
    .object({
      dimensions: z.any().optional(),
      metrics: z.any().optional(),
    })
    .optional()
    .describe('Optional filters to apply to the query'),
  sorts: z
    .array(
      z.object({
        fieldId: z.string(),
        descending: z.boolean(),
      })
    )
    .optional()
    .describe('Optional sort configuration'),
  limit: z
    .number()
    .int()
    .positive()
    .max(5000)
    .optional()
    .default(500)
    .describe('Maximum number of rows to return (default: 500, max: 5000)'),
  tableCalculations: z
    .array(
      z.object({
        name: z.string(),
        displayName: z.string(),
        sql: z.string(),
      })
    )
    .optional()
    .default([])
    .describe('Optional table calculations'),
});

export const RunSqlQueryRequestSchema = z.object({
  projectUuid: z
    .string()
    .uuid()
    .describe(
      'The UUID of the project. You can obtain it from the project list.'
    ),
  sql: z
    .string()
    .min(1)
    .describe('The raw SQL query to execute against the data warehouse'),
});

export const CalculateTotalRequestSchema = z.object({
  projectUuid: z
    .string()
    .uuid()
    .describe(
      'The UUID of the project. You can obtain it from the project list.'
    ),
  exploreId: z
    .string()
    .min(1)
    .describe(
      'The ID of the explore (table name). You can obtain it from the explores list.'
    ),
  dimensions: z
    .array(z.string())
    .describe('Array of dimension field IDs to include in the query'),
  metrics: z
    .array(z.string())
    .describe('Array of metric field IDs to calculate totals for'),
  filters: z
    .object({
      dimensions: z.any().optional(),
      metrics: z.any().optional(),
    })
    .optional()
    .describe('Optional filters to apply to the query'),
  sorts: z
    .array(
      z.object({
        fieldId: z.string(),
        descending: z.boolean(),
      })
    )
    .optional()
    .describe('Optional sort configuration'),
  limit: z
    .number()
    .int()
    .positive()
    .max(5000)
    .optional()
    .default(500)
    .describe('Maximum number of rows (default: 500, max: 5000)'),
  tableCalculations: z
    .array(
      z.object({
        name: z.string(),
        displayName: z.string(),
        sql: z.string(),
      })
    )
    .optional()
    .default([])
    .describe('Optional table calculations'),
});

export const RunMetricExplorerQueryRequestSchema = z.object({
  projectUuid: z
    .string()
    .uuid()
    .describe(
      'The UUID of the project. You can obtain it from the project list.'
    ),
  explore: z.string().min(1).describe('The explore name containing the metric'),
  metric: z.string().min(1).describe('The metric name to query'),
  startDate: z
    .string()
    .describe('Start date for the query in YYYY-MM-DD format'),
  endDate: z.string().describe('End date for the query in YYYY-MM-DD format'),
  query: z
    .object({
      comparison: z.enum(['none', 'previous_period']).optional(),
      segmentDimension: z.string().optional(),
    })
    .optional()
    .default({ comparison: 'none' })
    .describe('Query configuration for metrics explorer'),
  timeDimensionOverride: z
    .object({
      field: z.string(),
      interval: z.enum(['DAY', 'WEEK', 'MONTH', 'YEAR']),
    })
    .optional()
    .describe('Optional time dimension override'),
});

export const RunMetricTotalRequestSchema = z.object({
  projectUuid: z
    .string()
    .uuid()
    .describe(
      'The UUID of the project. You can obtain it from the project list.'
    ),
  explore: z.string().min(1).describe('The explore name containing the metric'),
  metric: z.string().min(1).describe('The metric name to get total for'),
  startDate: z
    .string()
    .describe('Start date for the query in YYYY-MM-DD format'),
  endDate: z.string().describe('End date for the query in YYYY-MM-DD format'),
  timeFrame: z
    .enum(['DAY', 'WEEK', 'MONTH', 'YEAR'])
    .describe('Time frame for the total calculation'),
  comparisonType: z
    .enum(['none', 'previous_period'])
    .optional()
    .describe('Optional comparison type'),
});

export const GetMetricsTreeRequestSchema = z.object({
  projectUuid: z
    .string()
    .uuid()
    .describe(
      'The UUID of the project. You can obtain it from the project list.'
    ),
  metricUuids: z
    .array(z.string().uuid())
    .min(1)
    .describe('Array of metric UUIDs to get the tree structure for'),
});

export const RunSavedChartRequestSchema = z.object({
  chartUuid: z
    .string()
    .uuid()
    .describe(
      'The UUID of the saved chart. You can obtain it from the charts list.'
    ),
  invalidateCache: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to invalidate the cache and run a fresh query'),
});

export const GetChartHistoryRequestSchema = z.object({
  chartUuid: z
    .string()
    .uuid()
    .describe(
      'The UUID of the saved chart. You can obtain it from the charts list.'
    ),
});

export const GetChartVersionRequestSchema = z.object({
  chartUuid: z
    .string()
    .uuid()
    .describe(
      'The UUID of the saved chart. You can obtain it from the charts list.'
    ),
  versionUuid: z.string().uuid().describe('The UUID of the chart version'),
});
