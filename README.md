# lightdash-mcp-server
[![smithery badge](https://smithery.ai/badge/@syucream/lightdash-mcp-server)](https://smithery.ai/server/@syucream/lightdash-mcp-server)
[![npm version](https://badge.fury.io/js/lightdash-mcp-server.svg)](https://badge.fury.io/js/lightdash-mcp-server)

A [MCP(Model Context Protocol)](https://www.anthropic.com/news/model-context-protocol) server that accesses to [Lightdash](https://www.lightdash.com/).

This server provides MCP-compatible access to Lightdash's API, allowing AI assistants to interact with your Lightdash data through a standardized interface.

<a href="https://glama.ai/mcp/servers/e1gbb6sflq">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/e1gbb6sflq/badge" alt="Lightdash Server MCP server" />
</a>

## Features

Available tools:

### Project & Organization
- `list_projects` - List all projects in the Lightdash organization
- `get_project` - Get details of a specific project
- `list_spaces` - List all spaces in a project
- `list_user_attributes` - List organization user attributes

### Charts & Dashboards
- `list_charts` - List all charts in a project
- `list_dashboards` - List all dashboards in a project
- `get_charts_as_code` - Get charts as code for a project
- `get_dashboards_as_code` - Get dashboards as code for a project
- `run_saved_chart` - Execute a saved chart and return its query results
- `get_chart_history` - Get the version history of a saved chart
- `get_chart_version` - Get details of a specific version of a saved chart

### Data Catalog & Metrics
- `get_catalog` - Get catalog for a project
- `list_custom_metrics` - List custom metrics for a project
- `list_metrics` - List all metrics in a project from the metrics catalog
- `get_table_metadata` - Get metadata for a specific table in the data catalog
- `get_table_analytics` - Get analytics for a specific table in the data catalog
- `get_metrics_tree` - Get the hierarchical tree structure of metrics relationships

### Explores & Queries
- `list_explores` - List all explores (tables) available in a project
- `get_explore` - Get detailed information about a specific explore
- `run_query` - Execute a query against an explore with specified dimensions and metrics
- `compile_query` - Compile a query to SQL without executing it
- `run_raw_data_query` - Run a query to get the underlying row-level data
- `run_sql_query` - Execute a raw SQL query against the data warehouse
- `calculate_metrics_total` - Calculate the total values for metrics in a query

### Metrics Explorer
- `run_metric_timeseries` - Run a time-series query for a specific metric
- `get_metric_total` - Get the total value for a metric over a time period

## Quick Start

### Installation

#### Installing via Smithery

To install Lightdash MCP Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@syucream/lightdash-mcp-server):

```bash
npx -y @smithery/cli install lightdash-mcp-server --client claude
```

#### Manual Installation
```bash
npm install lightdash-mcp-server
```

### Configuration

- `LIGHTDASH_API_KEY`: Your Lightdash PAT
- `LIGHTDASH_URL`: The API base URL

### Usage

The lightdash-mcp-server supports two transport modes: **Stdio** (default) and **HTTP**.

#### Stdio Transport (Default)

1. Start the MCP server:

```bash
npx lightdash-mcp-server
```

2. Edit your MCP configuration json:
```json
...
    "lightdash": {
      "command": "npx",
      "args": [
        "-y",
        "lightdash-mcp-server"
      ],
      "env": {
        "LIGHTDASH_API_KEY": "<your PAT>",
        "LIGHTDASH_URL": "https://<your base url>"
      }
    },
...
```

#### HTTP Transport (Streamable HTTP)

1. Start the MCP server in HTTP mode:

```bash
npx lightdash-mcp-server -port 8080
```

This starts the server using StreamableHTTPServerTransport, making it accessible via HTTP at `http://localhost:8080/mcp`.

2. Configure your MCP client to connect via HTTP:

**For Claude Desktop and other MCP clients:**

Edit your MCP configuration json to use the `url` field instead of `command` and `args`:

```json
...
    "lightdash": {
      "url": "http://localhost:8080/mcp"
    },
...
```

**For programmatic access:**

Use the streamable HTTP client transport:
```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const client = new Client({
  name: 'my-client',
  version: '1.0.0'
}, {
  capabilities: {}
});

const transport = new StreamableHTTPClientTransport(
  new URL('http://localhost:8080/mcp')
);

await client.connect(transport);
```

**Note:** When using HTTP mode, ensure the environment variables `LIGHTDASH_API_KEY` and `LIGHTDASH_URL` are set in the environment where the server is running, as they cannot be passed through MCP client configuration.

See `examples/list_spaces_http.ts` for a complete example of connecting to the HTTP server programmatically.

## Development

### Available Scripts

- `npm run dev` - Start the server in development mode with hot reloading (stdio transport)
- `npm run dev:http` - Start the server in development mode with HTTP transport on port 8080
- `npm run build` - Build the project for production
- `npm run start` - Start the production server
- `npm run lint` - Run linting checks (ESLint and Prettier)
- `npm run fix` - Automatically fix linting issues
- `npm run examples` - Run the example scripts

### Contributing

1. Fork the repository
2. Create your feature branch
3. Run tests and linting: `npm run lint`
4. Commit your changes
5. Push to the branch
6. Create a Pull Request
