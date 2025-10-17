defmodule StockExplorer.Resources.Exchange do
  use Ash.Resource,
    domain: StockExplorer.Resources,
    data_layer: AshSqlite.DataLayer,
    extensions: [AshTypescript.Resource]

  typescript do
    type_name "Exchange"
  end

  sqlite do
    table "exchanges"
    repo StockExplorer.Repo
  end

  actions do
    defaults [:read]

    create :create do
      primary? true
      accept [:name]
      upsert? true
      upsert_identity :unique_name
    end
  end

  attributes do
    uuid_v7_primary_key :id

    attribute :name, :string do
      description "The name of the exchange"
      allow_nil? false
      public? true
    end
  end

  relationships do
    has_many :companies, StockExplorer.Resources.Company
  end

  identities do
    identity :unique_name, [:name]
  end
end
