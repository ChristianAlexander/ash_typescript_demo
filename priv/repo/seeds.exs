# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     StockExplorer.Repo.insert!(%StockExplorer.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

source_data_file_path =
  Path.join(:code.priv_dir(:stock_explorer), "reference_data/company_tickers_exchange.json")

source_data =
  File.read!(source_data_file_path)
  |> :json.decode()

companies =
  source_data["data"]
  |> Stream.map(fn
    [cik, name, ticker, :null] -> [cik, name, ticker, "Unknown"]
    data -> data
  end)

companies
|> Enum.map(fn [cik, name, ticker, exchange] ->
  %{cik: cik, name: name, ticker: ticker, exchange: %{name: exchange}}
end)
|> StockExplorer.Resources.create_company()
