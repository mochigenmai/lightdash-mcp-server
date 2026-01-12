import { z } from 'zod';

const defaultProjectUuid = process.env.LIGHTDASH_PROJECT_UUID;

const projectUuidSchema = z
  .string()
  .uuid()
  .optional()
  .default(defaultProjectUuid ?? '')
  .describe(
    'The UUID of the project. Optional if LIGHTDASH_PROJECT_UUID env is set.'
  );

export const ListProjectsRequestSchema = z.object({});

export const GetProjectRequestSchema = z.object({
  projectUuid: projectUuidSchema,
});

export const ListSpacesRequestSchema = z.object({
  projectUuid: projectUuidSchema,
});

export const ListChartsRequestSchema = z.object({
  projectUuid: projectUuidSchema,
});

export const ListDashboardsRequestSchema = z.object({
  projectUuid: projectUuidSchema,
});

export const GetCustomMetricsRequestSchema = z.object({
  projectUuid: projectUuidSchema,
});

export const GetCatalogRequestSchema = z.object({
  projectUuid: projectUuidSchema,
});

export const GetMetricsCatalogRequestSchema = z.object({
  projectUuid: projectUuidSchema,
});

export const GetChartsAsCodeRequestSchema = z.object({
  projectUuid: projectUuidSchema,
});

export const GetDashboardsAsCodeRequestSchema = z.object({
  projectUuid: projectUuidSchema,
});

export const GetMetadataRequestSchema = z.object({
  projectUuid: projectUuidSchema,
  table: z.string().min(1, 'Table name cannot be empty'),
});

export const GetAnalyticsRequestSchema = z.object({
  projectUuid: projectUuidSchema,
  table: z.string(),
});

export const GetUserAttributesRequestSchema = z.object({});

export const ListExploresRequestSchema = z.object({
  projectUuid: projectUuidSchema,
});

export const GetExploreRequestSchema = z.object({
  projectUuid: projectUuidSchema,
  exploreId: z
    .string()
    .min(1)
    .describe(
      'The explore name. Get available explores from list_explores.'
    ),
});

export const RunQueryRequestSchema = z.object({
  projectUuid: projectUuidSchema,
  exploreId: z
    .string()
    .min(1)
    .describe(
      'The explore name. Get available explores from list_explores.'
    ),
  dimensions: z
    .array(z.string())
    .describe(
      'Array of dimension field IDs in the format "{table}_{field_name}". Get available dimensions from get_explore.'
    ),
  metrics: z
    .array(z.string())
    .describe(
      'Array of metric field IDs in the format "{table}_{field_name}". Get available metrics from get_explore.'
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
        fieldId: z
          .string()
          .describe(
            'The field ID to sort by in the format "{table}_{field_name}"'
          ),
        descending: z.boolean().describe('True for descending order, false for ascending'),
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
  projectUuid: projectUuidSchema,
  exploreId: z
    .string()
    .min(1)
    .describe(
      'The explore name. Get available explores from list_explores.'
    ),
  dimensions: z
    .array(z.string())
    .describe(
      'Array of dimension field IDs in the format "{table}_{field_name}". Get available dimensions from get_explore.'
    ),
  metrics: z
    .array(z.string())
    .describe(
      'Array of metric field IDs in the format "{table}_{field_name}". Get available metrics from get_explore.'
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
        fieldId: z
          .string()
          .describe(
            'The field ID to sort by in the format "{table}_{field_name}"'
          ),
        descending: z.boolean().describe('True for descending order, false for ascending'),
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
  projectUuid: projectUuidSchema,
  exploreId: z
    .string()
    .min(1)
    .describe(
      'The explore name. Get available explores from list_explores.'
    ),
  dimensions: z
    .array(z.string())
    .describe(
      'Array of dimension field IDs in the format "{table}_{field_name}". Get available dimensions from get_explore.'
    ),
  metrics: z
    .array(z.string())
    .describe(
      'Array of metric field IDs in the format "{table}_{field_name}". Get available metrics from get_explore.'
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
        fieldId: z
          .string()
          .describe(
            'The field ID to sort by in the format "{table}_{field_name}"'
          ),
        descending: z.boolean().describe('True for descending order, false for ascending'),
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
  projectUuid: projectUuidSchema,
  sql: z
    .string()
    .min(1)
    .describe('The raw SQL query to execute against the data warehouse'),
});

export const CalculateTotalRequestSchema = z.object({
  projectUuid: projectUuidSchema,
  exploreId: z
    .string()
    .min(1)
    .describe(
      'The explore name. Get available explores from list_explores.'
    ),
  dimensions: z
    .array(z.string())
    .describe(
      'Array of dimension field IDs in the format "{table}_{field_name}". Get available dimensions from get_explore.'
    ),
  metrics: z
    .array(z.string())
    .describe(
      'Array of metric field IDs in the format "{table}_{field_name}" to calculate totals for. Get available metrics from get_explore.'
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
        fieldId: z
          .string()
          .describe(
            'The field ID to sort by in the format "{table}_{field_name}"'
          ),
        descending: z.boolean().describe('True for descending order, false for ascending'),
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
  projectUuid: projectUuidSchema,
  explore: z
    .string()
    .min(1)
    .describe(
      'The explore name. Get available explores from list_explores or list_metrics.'
    ),
  metric: z.string().min(1).describe('The metric name to query'),
  startDate: z
    .string()
    .describe('Start date for the query in YYYY-MM-DD format'),
  endDate: z.string().describe('End date for the query in YYYY-MM-DD format'),
  query: z
    .object({
      comparison: z.enum(['none', 'previous_period']).optional(),
      segmentDimension: z
        .string()
        .optional()
        .describe(
          'Optional dimension to segment by in the format "{table}_{field_name}". Use null for no segmentation.'
        ),
    })
    .optional()
    .default({ comparison: 'none' })
    .describe('Query configuration for metrics explorer'),
  timeDimensionOverride: z
    .object({
      field: z
        .string()
        .describe(
          'The full field name including table prefix, in the format "{table}_{field_name}".'
        ),
      interval: z.enum(['DAY', 'WEEK', 'MONTH', 'YEAR']),
    })
    .optional()
    .describe(
      'Optional time dimension override. Use this to change the time granularity (DAY, WEEK, MONTH, YEAR) or the date field used for aggregation.'
    ),
});

export const RunMetricTotalRequestSchema = z.object({
  projectUuid: projectUuidSchema,
  explore: z
    .string()
    .min(1)
    .describe(
      'The explore name. Get available explores from list_explores or list_metrics.'
    ),
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
  projectUuid: projectUuidSchema,
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
