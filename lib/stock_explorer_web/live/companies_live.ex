defmodule StockExplorerWeb.CompaniesLive do
  use StockExplorerWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    {:ok,
     socket
     |> assign(:after_keyset, nil)
     |> assign(:end_of_timeline?, false)
     |> stream(:companies, [])
     |> load_companies()}
  end

  @impl true
  def handle_event("load-more", _, socket) do
    if socket.assigns.end_of_timeline? do
      {:noreply, socket}
    else
      {:noreply, load_companies(socket)}
    end
  end

  defp load_companies(socket) do
    page_opts = [limit: 25]

    page_opts =
      if socket.assigns.after_keyset,
        do: Keyword.put(page_opts, :after, socket.assigns.after_keyset),
        else: page_opts

    case StockExplorer.Resources.list_companies(page: page_opts, load: :exchange) do
      {:ok, %{results: companies, more?: more?}} ->
        after_keyset =
          if companies != [] do
            companies
            |> List.last()
            |> Map.get(:__metadata__)
            |> Map.get(:keyset)
          else
            nil
          end

        socket
        |> stream(:companies, companies)
        |> assign(:after_keyset, after_keyset)
        |> assign(:end_of_timeline?, not more?)

      {:error, _} ->
        socket
        |> put_flash(:error, "Failed to load companies")
    end
  end

  @impl true
  def render(assigns) do
    ~H"""
    <Layouts.app flash={@flash}>
      <div class="max-w-6xl mx-auto px-4 py-8">
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">Companies</h1>
          <p class="text-lg text-gray-600">Browse all listed companies</p>
        </div>

        <div class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <!-- Fixed Header -->
          <div class="bg-gray-50 border-b border-gray-200">
            <div class="grid grid-cols-12 gap-4 px-6 py-3">
              <div class="col-span-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ticker
              </div>
              <div class="col-span-5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company Name
              </div>
              <div class="col-span-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Exchange
              </div>
              <div class="col-span-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                CIK
              </div>
            </div>
          </div>

          <div
            id="companies-container"
            class="h-96 overflow-y-auto bg-white"
          >
            <div
              id="companies"
              phx-update="stream"
              phx-viewport-bottom={!@end_of_timeline? && "load-more"}
              class="divide-y divide-gray-200"
            >
              <div
                :for={{id, company} <- @streams.companies}
                id={id}
                class="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
              >
                <div class="col-span-2 flex items-center">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {company.ticker}
                  </span>
                </div>
                <div class="col-span-5 flex items-center">
                  <div class="text-sm font-medium text-gray-900 truncate">
                    {company.name}
                  </div>
                </div>
                <div class="col-span-2 flex items-center">
                  <div class="text-sm text-gray-600">
                    {company.exchange && company.exchange.name}
                  </div>
                </div>
                <div class="col-span-3 flex items-center">
                  <div class="text-sm font-mono text-gray-600">
                    {company.cik}
                  </div>
                </div>
              </div>
            </div>
            
    <!-- End of Results inside scrollable area -->
            <div :if={@end_of_timeline?} class="text-center py-8">
              <p class="text-gray-500 text-sm">You've reached the end of the list</p>
            </div>
          </div>
        </div>
      </div>
    </Layouts.app>
    """
  end
end
