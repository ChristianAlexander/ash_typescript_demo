defmodule StockExplorer.Repo do
  use AshSqlite.Repo,
    otp_app: :stock_explorer
end
