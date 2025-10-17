# StockExplorer

A demonstration of [ash_typescript](https://hexdocs.pm/ash_typescript/readme.html), a library that generates TypeScript RPC clients for Ash/Phoenix backends. This project showcases how to build rich frontend experiences without the complexities of traditional API design by leveraging Ash's resource definitions to automatically generate type-safe client code.

Check out the related YouTube video for a walkthrough:

[![Watch the video](https://img.youtube.com/vi/t-hori2Io14/maxresdefault.jpg)](https://youtu.be/t-hori2Io14)

## Features

- **Type-safe RPC calls**: Automatically generated TypeScript client with full type safety
- **Zero API design overhead**: RPC actions are defined directly in your Ash domain
- **Phoenix LiveView integration**: Seamless backend/frontend data flow
- **Resource-driven development**: Domain logic drives both backend and frontend interfaces

## Getting Started

To start your Phoenix server:

* Install JavaScript dependencies: `npm i --prefix assets`
* Run `mix setup` to install and setup dependencies
* Generate the TypeScript RPC client: `mix ash.codegen --dev`
* Start Phoenix endpoint with `mix phx.server` or inside IEx with `iex -S mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

## ash_typescript Integration

The project demonstrates ash_typescript through the domain module configuration:

```elixir
defmodule StockExplorer.Resources do
  use Ash.Domain,
    extensions: [AshTypescript.Rpc]

  typescript_rpc do
    resource StockExplorer.Resources.Company do
      rpc_action :list_companies, :read
    end
  end

  resources do
    resource StockExplorer.Resources.Company do
      define :create_company, action: :create
      define :list_companies, action: :read
    end

    resource StockExplorer.Resources.Exchange do
      define :list_exchanges, action: :read
    end
  end
end
```

### Key Points

- **RPC declarations**: The `typescript_rpc` block defines which actions are exposed as RPC endpoints
- **Type generation**: Running `mix ash_typescript.codegen --output "assets/js/ash_rpc.ts"` generates a fully typed TypeScript client
- **Resource actions**: Standard Ash resource actions become type-safe RPC calls in the frontend

## Development Workflow

1. Define your Ash resources and actions
2. Add RPC declarations to your domain module for actions you want to expose
3. Run `mix ash.codegen --dev` to generate the TypeScript client
4. Use the generated client in your frontend code with full type safety

## Learn More

* **ash_typescript**: https://hexdocs.pm/ash_typescript/readme.html
* **Ash Framework**: https://hexdocs.pm/ash/readme.html
* **Phoenix Framework**: https://www.phoenixframework.org/
* **Phoenix Guides**: https://hexdocs.pm/phoenix/overview.html
