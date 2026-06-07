"use client";

import * as React from "react";
import { toast } from "sonner";

import { loadSubscribers } from "@/app/automobili/newsletter-prijave/actions";
import { AddSubscriberForm } from "@/components/newsletter/AddSubscriberForm";
import { SubscriberRowCard } from "@/components/newsletter/SubscriberRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  isSearchActive,
  SEARCH_DEBOUNCE_MS,
  type SubscriberRow,
} from "@/lib/subscribers";

export function NewsletterPrijavePageContent({
  initialSubscribers,
  initialHasMore,
}: {
  initialSubscribers: SubscriberRow[];
  initialHasMore: boolean;
}) {
  const [subscribers, setSubscribers] =
    React.useState<SubscriberRow[]>(initialSubscribers);
  const [hasMore, setHasMore] = React.useState(initialHasMore);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const skipInitialSearch = React.useRef(true);

  const loadPage = React.useCallback(
    async (query: string, offset: number, append: boolean) => {
      const result = await loadSubscribers(query, offset);

      if ("error" in result) {
        toast.error("Greška pri učitavanju, pokušajte ponovo.");
        return false;
      }

      setSubscribers((current) =>
        append ? [...current, ...result.subscribers] : result.subscribers
      );
      setHasMore(result.hasMore);
      return true;
    },
    []
  );

  const refreshList = React.useCallback(async () => {
    setIsSearching(true);
    await loadPage(searchQuery, 0, false);
    setIsSearching(false);
  }, [loadPage, searchQuery]);

  React.useEffect(() => {
    if (skipInitialSearch.current) {
      skipInitialSearch.current = false;
      return;
    }

    const trimmed = searchQuery.trim();

    const timer = window.setTimeout(() => {
      void (async () => {
        setIsSearching(true);
        await loadPage(trimmed, 0, false);
        setIsSearching(false);
      })();
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [loadPage, searchQuery]);

  async function handleLoadMore() {
    setIsLoadingMore(true);
    await loadPage(searchQuery.trim(), subscribers.length, true);
    setIsLoadingMore(false);
  }

  function handleDeleted(id: string) {
    setSubscribers((current) => current.filter((row) => row.id !== id));
  }

  const showNoSearchResults =
    isSearchActive(searchQuery) && !isSearching && subscribers.length === 0;

  return (
    <div className="flex w-full flex-col gap-4">
      <AddSubscriberForm onAdded={refreshList} />

      <Input
        type="search"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Pretražite prijavljene mejlove za newsletter"
        aria-label="Pretražite prijavljene mejlove za newsletter"
        className="h-10"
      />

      {isSearching ? (
        <p className="text-center text-sm text-muted-foreground">Pretraga…</p>
      ) : null}

      {showNoSearchResults ? (
        <p className="rounded-xl border bg-card px-5 py-8 text-center text-muted-foreground">
          Nema rezultata pretrage.
        </p>
      ) : (
        subscribers.map((row) => (
          <SubscriberRowCard key={row.id} row={row} onDeleted={handleDeleted} />
        ))
      )}

      {hasMore && !showNoSearchResults ? (
        <div className="flex justify-center">
          <Button onClick={() => void handleLoadMore()} disabled={isLoadingMore}>
            {isLoadingMore ? "Učitavanje…" : "Učitaj još"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
