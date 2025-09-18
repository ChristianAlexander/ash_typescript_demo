import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { CompaniesTable } from "./companies-table";

const queryClient = new QueryClient();

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <header className="navbar px-4 sm:px-6 lg:px-8"></header>
      <main className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-4">{children}</div>
      </main>
    </>
  );
};

const root = createRoot(document.getElementById("app")!);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppLayout>
        <CompaniesTable />
      </AppLayout>
    </QueryClientProvider>
  </React.StrictMode>,
);
