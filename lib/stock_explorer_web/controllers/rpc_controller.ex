defmodule StockExplorerWeb.RpcController do
  use StockExplorerWeb, :controller

  def run(conn, params) do
    result = AshTypescript.Rpc.run_action(:stock_explorer, conn, params)
    json(conn, result)
  end

  def validate(conn, params) do
    result = AshTypescript.Rpc.validate_action(:stock_explorer, conn, params)
    json(conn, result)
  end
end
