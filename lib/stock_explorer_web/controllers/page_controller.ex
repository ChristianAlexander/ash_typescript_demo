defmodule StockExplorerWeb.PageController do
  use StockExplorerWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end
end
