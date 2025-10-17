defmodule StockExplorer.Resources do
  use Ash.Domain,
    extensions: [AshTypescript.Rpc]

  typescript_rpc do
    resource StockExplorer.Resources.Company do
      rpc_action :list_companies, :read
    end

    resource StockExplorer.Resources.Exchange
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
