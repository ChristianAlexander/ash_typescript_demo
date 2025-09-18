defmodule StockExplorerWeb.PageController do
  use StockExplorerWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end

  def react(conn, _params) do
    render(conn, :react)
  end
end
