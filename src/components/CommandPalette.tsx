"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Workflow,
  FileText,
  Settings,
  Shield,
  Plus,
  Upload,
  Search,
  CircleDollarSign,
  Tag,
} from "lucide-react";

interface SearchResult {
  transactions: Array<{ id: string; description: string; amount: number; date: string }>;
  accounts: Array<{ id: string; name: string; type: string }>;
  categories: Array<{ id: string; name: string }>;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  // Expose open function to window for testing
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).openCommandPalette = () => setOpen(true);
      (window as any).closeCommandPalette = () => setOpen(false);
    }
    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).openCommandPalette;
        delete (window as any).closeCommandPalette;
      }
    };
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/dashboard");
        if (response.ok) {
          setIsAuthenticated(true);
          const data = await response.json();
          // Check if user is admin (we can infer this from successful admin API call)
          const adminCheck = await fetch("/api/admin/stats");
          setIsAdmin(adminCheck.ok);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Listen for cmd+k / ctrl+k
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Debounced search
  useEffect(() => {
    if (search.length < 2) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(search)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSelect = useCallback(
    (callback: () => void) => {
      setOpen(false);
      callback();
    },
    []
  );

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="overflow-hidden p-0 max-w-2xl"
        data-testid="command-palette-dialog"
      >
        <VisuallyHidden>
          <DialogTitle>Command Palette</DialogTitle>
          <DialogDescription>
            Navigate to pages, search transactions, accounts, and categories, or perform quick actions.
          </DialogDescription>
        </VisuallyHidden>
        <Command
          shouldFilter={false}
          data-testid="command-palette"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
        >
          <CommandInput
            placeholder="Type a command or search..."
            value={search}
            onValueChange={setSearch}
            data-testid="command-palette-input"
          />
          <CommandList>
        <CommandEmpty>
          {search.length >= 2
            ? "No results found. Try a different search term."
            : "No results found. Start typing to search or navigate."}
        </CommandEmpty>

        {/* Navigation - only show when not searching */}
        {search.length < 2 && (
          <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => handleSelect(() => router.push("/dashboard"))}
          >
            <LayoutDashboard />
            <span>Dashboard</span>
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => router.push("/accounts"))}
          >
            <Wallet />
            <span>Accounts</span>
            <CommandShortcut>⌘A</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => router.push("/transactions"))}
          >
            <Receipt />
            <span>Transactions</span>
            <CommandShortcut>⌘T</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => router.push("/workflows"))}
          >
            <Workflow />
            <span>Workflows</span>
            <CommandShortcut>⌘W</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => router.push("/reports"))}
          >
            <FileText />
            <span>Reports</span>
            <CommandShortcut>⌘R</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => router.push("/settings"))}
          >
            <Settings />
            <span>Settings</span>
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
          {isAdmin && (
            <CommandItem
              onSelect={() => handleSelect(() => router.push("/admin"))}
            >
              <Shield />
              <span>Admin</span>
            </CommandItem>
          )}
          </CommandGroup>
        )}

        {/* Quick Actions - only show when not searching */}
        {search.length < 2 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() =>
              handleSelect(() => router.push("/transactions?action=new"))
            }
          >
            <Plus />
            <span>New Transaction</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleSelect(() => router.push("/accounts?action=new"))
            }
          >
            <CircleDollarSign />
            <span>New Account</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleSelect(() => router.push("/transactions?action=import"))
            }
          >
            <Upload />
            <span>Import Transactions</span>
            <CommandShortcut>⌘I</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleSelect(() => router.push("/workflows?action=new"))
            }
          >
            <Workflow />
            <span>Create Workflow</span>
          </CommandItem>
            </CommandGroup>
          </>
        )}

        {/* Search Results */}
        {search.length >= 2 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Search">
              <CommandItem
                value="search-result-item-transactions"
                onSelect={() =>
                  handleSelect(() =>
                    router.push(`/transactions?search=${encodeURIComponent(search)}`)
                  )
                }
              >
                <Search />
                <span>Search for transactions matching &quot;{search}&quot;</span>
                <CommandShortcut>↵</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {/* Dynamic Search Results - Transactions */}
        {searchResults?.transactions && searchResults.transactions.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Transactions">
              {searchResults.transactions.map((transaction) => (
                <CommandItem
                  key={transaction.id}
                  value={`search-result-item-transaction-${transaction.id}`}
                  onSelect={() =>
                    handleSelect(() =>
                      router.push(
                        `/transactions?highlight=${transaction.id}`
                      )
                    )
                  }
                >
                  <Receipt />
                  <span className="flex-1">{transaction.description}</span>
                  <span className="text-xs text-muted-foreground">
                    ${Math.abs(transaction.amount).toFixed(2)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Dynamic Search Results - Accounts */}
        {searchResults?.accounts && searchResults.accounts.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Accounts">
              {searchResults.accounts.map((account) => (
                <CommandItem
                  key={account.id}
                  value={`search-result-item-account-${account.id}`}
                  onSelect={() =>
                    handleSelect(() =>
                      router.push(`/accounts?highlight=${account.id}`)
                    )
                  }
                >
                  <Wallet />
                  <span className="flex-1">{account.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {account.type}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Dynamic Search Results - Categories */}
        {searchResults?.categories && searchResults.categories.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Categories">
              {searchResults.categories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={`search-result-item-category-${category.id}`}
                  onSelect={() =>
                    handleSelect(() =>
                      router.push(
                        `/transactions?category=${category.id}`
                      )
                    )
                  }
                >
                  <Tag />
                  <span>{category.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
