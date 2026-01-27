import { z } from 'zod';

const defaultProjectUuid = process.env.LIGHTDASH_PROJECT_UUID;

// Field reference schema - used for dimensions and metrics
const FieldReferenceSchema = z.object({
  table: z.string().min(1).describe('The table name from get_explore'),
  field: z.string().min(1).describe('The field name from get_explore'),
});

export type FieldReference = z.infer<typeof FieldReferenceSchema>;

// Sort reference schema - uses table/field instead of fieldId
const SortReferenceSchema = z.object({
  table: z.string().min(1).describe('The table name from get_explore'),
  field: z.string().min(1).describe('The field name from get_explore'),
  descending: z.boolean().describe('True for descending order, false for ascending'),
});

// Helper function to convert FieldReference to field ID string
export const toFieldId = (ref: FieldReference): string => {
  return `${ref.table}_${ref.field.replaceAll('.', '__')}`;
};

const ConditionalOperatorSchema = z.enum([
  'isNull',
  'notNull',
  'equals',
  'notEquals',
  'startsWith',
  'endsWith',
  'include',
  'doesNotInclude',
  'lessThan',
  'lessThanOrEqual',
  'greaterThan',
  'greaterThanOrEqual',
  'inThePast',
  'notInThePast',
  'inTheNext',
  'inTheCurrent',
  'notInTheCurrent',
  'inBetween',
  'notInBetween',
]);

type ConditionalOperator = z.infer<typeof ConditionalOperatorSchema>;

type FilterTargetInput =
  | { fieldId: string }
  | { table: string; field: string };

type FilterRuleInput = {
  id: string;
  operator: ConditionalOperator;
  target: FilterTargetInput;
  values?: unknown[];
  settings?: unknown;
  disabled?: boolean;
  required?: boolean;
};

type FilterGroupInput =
  | {
      id: string;
      and: FilterGroupItemInput[];
    }
  | {
      id: string;
      or: FilterGroupItemInput[];
    };

type FilterGroupItemInput = FilterGroupInput | FilterRuleInput;

export type FiltersInput = {
  dimensions?: FilterGroupInput;
  metrics?: FilterGroupInput;
  tableCalculations?: FilterGroupInput;
};

const FilterTargetSchema: z.ZodType<FilterTargetInput> = z.union([
  z.object({ fieldId: z.string().min(1) }).passthrough(),
  z
    .object({ table: z.string().min(1), field: z.string().min(1) })
    .passthrough(),
]);

const FilterRuleSchema: z.ZodType<FilterRuleInput> = z
  .object({
    id: z.string().min(1),
    operator: ConditionalOperatorSchema,
    target: FilterTargetSchema,
    values: z.array(z.any()).optional(),
    settings: z.any().optional(),
    disabled: z.boolean().optional(),
    required: z.boolean().optional(),
  })
  .passthrough();

const FilterGroupSchema: z.ZodType<FilterGroupInput> = z.lazy(() =>
  z.union([
    z
      .object({
        id: z.string().min(1),
        and: z.array(z.union([FilterRuleSchema, FilterGroupSchema])),
      })
      .passthrough(),
    z
      .object({
        id: z.string().min(1),
        or: z.array(z.union([FilterRuleSchema, FilterGroupSchema])),
      })
      .passthrough(),
  ])
);

export const FiltersSchema: z.ZodType<FiltersInput> = z.object({
  dimensions: FilterGroupSchema.optional(),
  metrics: FilterGroupSchema.optional(),
  tableCalculations: FilterGroupSchema.optional(),
});

const normalizeFilterTarget = (
  target: FilterTargetInput
): { fieldId: string } => {
  if ('fieldId' in target) {
    return { fieldId: target.fieldId };
  }
  return { fieldId: toFieldId({ table: target.table, field: target.field }) };
};

const normalizeFilterRule = (rule: FilterRuleInput): FilterRuleInput => ({
  ...rule,
  target: normalizeFilterTarget(rule.target),
});

const normalizeFilterGroup = (group: FilterGroupInput): FilterGroupInput => {
  if ('and' in group) {
    return { ...group, and: group.and.map(normalizeFilterGroupItem) };
  }
  return { ...group, or: group.or.map(normalizeFilterGroupItem) };
};

const normalizeFilterGroupItem = (
  item: FilterGroupItemInput
): FilterGroupInput | FilterRuleInput => {
  if ('and' in item || 'or' in item) {
    return normalizeFilterGroup(item);
  }
  return normalizeFilterRule(item);
};

export const normalizeFilters = (
  filters?: FiltersInput
): FiltersInput | undefined => {
  if (!filters) {
    return undefined;
  }

  const normalized: FiltersInput = { ...filters };
  if (filters.dimensions) {
    normalized.dimensions = normalizeFilterGroup(filters.dimensions);
  }
  if (filters.metrics) {
    normalized.metrics = normalizeFilterGroup(filters.metrics);
  }
  if (filters.tableCalculations) {
    normalized.tableCalculations = normalizeFilterGroup(
      filters.tableCalculations
    );
  }

  return normalized;
};

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
    .array(FieldReferenceSchema)
    .describe(
      'Array of dimension field references. Each object must have "table" and "field" from get_explore response.'
    ),
  metrics: z
    .array(FieldReferenceSchema)
    .describe(
      'Array of metric field references. Each object must have "table" and "field" from get_explore response.'
    ),
  filters: FiltersSchema.optional().describe(
    'Optional filters to apply to the query'
  ),
  sorts: z
    .array(SortReferenceSchema)
    .optional()
    .describe('Optional sort configuration. Each object must have "table", "field", and "descending".'),
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
    .array(FieldReferenceSchema)
    .describe(
      'Array of dimension field references. Each object must have "table" and "field" from get_explore response.'
    ),
  metrics: z
    .array(FieldReferenceSchema)
    .describe(
      'Array of metric field references. Each object must have "table" and "field" from get_explore response.'
    ),
  filters: FiltersSchema.optional().describe(
    'Optional filters to apply to the query'
  ),
  sorts: z
    .array(SortReferenceSchema)
    .optional()
    .describe('Optional sort configuration. Each object must have "table", "field", and "descending".'),
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
    .array(FieldReferenceSchema)
    .describe(
      'Array of dimension field references. Each object must have "table" and "field" from get_explore response.'
    ),
  metrics: z
    .array(FieldReferenceSchema)
    .describe(
      'Array of metric field references. Each object must have "table" and "field" from get_explore response.'
    ),
  filters: FiltersSchema.optional().describe(
    'Optional filters to apply to the query'
  ),
  sorts: z
    .array(SortReferenceSchema)
    .optional()
    .describe('Optional sort configuration. Each object must have "table", "field", and "descending".'),
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
    .array(FieldReferenceSchema)
    .describe(
      'Array of dimension field references. Each object must have "table" and "field" from get_explore response.'
    ),
  metrics: z
    .array(FieldReferenceSchema)
    .describe(
      'Array of metric field references to calculate totals for. Each object must have "table" and "field" from get_explore response.'
    ),
  filters: FiltersSchema.optional().describe(
    'Optional filters to apply to the query'
  ),
  sorts: z
    .array(SortReferenceSchema)
    .optional()
    .describe('Optional sort configuration. Each object must have "table", "field", and "descending".'),
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
  comparison: z
    .enum(['previous_period'])
    .optional()
    .describe(
      'Optional comparison type. Set to "previous_period" to compare with the previous time period. Omit for no comparison.'
    ),
  segmentDimension: z
    .string()
    .optional()
    .describe(
      'Optional dimension to segment by in the format "{table}_{field_name}". Omit for no segmentation.'
    ),
  timeDimensionOverride: z
    .object({
      table: z.string().describe('The table name containing the time dimension.'),
      field: z
        .string()
        .describe(
          'The EXACT field name from get_explore, without table prefix. Do NOT guess - use actual field names from API.'
        ),
      interval: z.enum(['DAY', 'WEEK', 'MONTH', 'YEAR']),
    })
    .optional()
    .describe(
      'Optional time dimension override. Usually not needed - API uses default time dimension. Only use if you need a different time field, and get the exact field name from get_explore first.'
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
    .enum([
      'RAW',
      'YEAR',
      'QUARTER',
      'MONTH',
      'WEEK',
      'DAY',
      'HOUR',
      'MINUTE',
      'SECOND',
      'MILLISECOND',
    ])
    .describe('Time frame for filtering the data'),
  granularity: z
    .enum([
      'RAW',
      'YEAR',
      'QUARTER',
      'MONTH',
      'WEEK',
      'DAY',
      'HOUR',
      'MINUTE',
      'SECOND',
      'MILLISECOND',
    ])
    .describe('Granularity for aggregation'),
  comparisonType: z
    .enum(['none', 'previous_period'])
    .optional()
    .describe('Optional comparison type. Use "previous_period" to compare with previous period.'),
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
