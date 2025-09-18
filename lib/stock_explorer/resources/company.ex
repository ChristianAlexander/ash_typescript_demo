defmodule StockExplorer.Resources.Company do
  use Ash.Resource,
    domain: StockExplorer.Resources,
    data_layer: AshSqlite.DataLayer

  sqlite do
    table "companies"
    repo StockExplorer.Repo

    custom_indexes do
      index :ticker
    end
  end

  actions do
    read :read do
      prepare build(sort: :ticker)

      pagination do
        required? true
        keyset? true
        max_page_size 50
      end
    end

    create :create do
      argument :exchange, :map
      accept [:cik, :name, :ticker]
      change manage_relationship(:exchange, type: :create)
    end
  end

  attributes do
    uuid_v7_primary_key :id

    attribute :cik, :integer do
      description "An SEC Central Index Key identifier for the company"
      allow_nil? false
    end

    attribute :name, :string do
      description "The name of the company"
      allow_nil? false
    end

    attribute :ticker, :string do
      description "The ticker symbol for the company"
      allow_nil? false
    end
  end

  relationships do
    belongs_to :exchange, StockExplorer.Resources.Exchange
  end
end
