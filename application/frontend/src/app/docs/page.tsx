"use client";

import { Suspense, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FileText,
  FolderOpen,
  FolderClosed,
  ChevronRight,
  ChevronDown,
  Search,
} from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm"; // GitHub-flavored markdown (tables, strikethrough, task lists)
import remarkFrontmatter from "remark-frontmatter"; // Strips YAML frontmatter (---) from rendered output
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { HelpPopover } from "@/components/help-popover";
import type { DocTreeEntry } from "@/types";

/**
 * Resolve a relative path against a base document path within the docs tree.
 * Returns the resolved path if it stays within docs/, or null if it escapes.
 */
function resolveDocPath(href: string, basePath: string): string | null {
  // Strip anchor fragments and query strings for resolution
  const cleanHref = href.split("#")[0].split("?")[0];
  if (!cleanHref) return null;

  // Get the directory of the current document
  const baseDir = basePath.includes("/")
    ? basePath.substring(0, basePath.lastIndexOf("/"))
    : "";

  // Combine base directory with relative href
  const parts = baseDir ? [...baseDir.split("/"), ...cleanHref.split("/")] : cleanHref.split("/");

  // Resolve . and .. segments
  const resolved: string[] = [];
  for (const part of parts) {
    if (part === "." || part === "") continue;
    if (part === "..") {
      if (resolved.length === 0) return null; // Escapes docs/ root
      resolved.pop();
    } else {
      resolved.push(part);
    }
  }

  return resolved.join("/");
}

/**
 * TreeNode renders a single entry in the docs sidebar tree.
 * Directories toggle expand/collapse, files navigate to their content.
 */
function TreeNode({
  entry,
  depth,
  activePath,
  onSelect,
  expanded,
  onToggle,
}: {
  entry: DocTreeEntry;
  depth: number;
  activePath: string | null;
  onSelect: (path: string) => void;
  expanded: Set<string>;
  onToggle: (path: string) => void;
}) {
  const isDir = entry.type === "directory";
  const isOpen = expanded.has(entry.path);
  const isActive = activePath === entry.path;
  // Display the extracted title, or humanize the filename as fallback
  const label = entry.title || entry.name.replace(/-/g, " ").replace(/_/g, " ");

  return (
    <div>
      <button
        onClick={() => (isDir ? onToggle(entry.path) : onSelect(entry.path))}
        className={cn(
          "flex items-center gap-1.5 w-full text-left rounded-md px-2 py-1.5 text-sm transition-colors",
          isActive
            ? "bg-accent text-accent-foreground font-medium"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        )}
        // Indent based on nesting depth for visual hierarchy
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {/* Directory: show chevron + folder icon; File: show file icon */}
        {isDir ? (
          isOpen ? (
            <>
              <ChevronDown className="h-3 w-3 shrink-0" />
              <FolderOpen className="h-4 w-4 shrink-0 text-yellow-500" />
            </>
          ) : (
            <>
              <ChevronRight className="h-3 w-3 shrink-0" />
              <FolderClosed className="h-4 w-4 shrink-0 text-yellow-500" />
            </>
          )
        ) : (
          <>
            {/* Spacer to align file icons with directory labels */}
            <span className="w-3 shrink-0" />
            <FileText className="h-4 w-4 shrink-0 text-blue-400" />
          </>
        )}
        <span className="truncate">{label}</span>
      </button>
      {/* Recursively render children when directory is expanded */}
      {isDir && isOpen && entry.children && (
        <div>
          {entry.children.map((child) => (
            <TreeNode
              key={child.path}
              entry={child}
              depth={depth + 1}
              activePath={activePath}
              onSelect={onSelect}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Recursively filter tree entries by search query.
 * Directories are kept if any descendant matches; files match on title or path.
 */
function filterTree(
  entries: DocTreeEntry[],
  query: string
): DocTreeEntry[] {
  if (!query.trim()) return entries;
  const q = query.toLowerCase();

  return entries
    .map((entry) => {
      if (entry.type === "directory") {
        // Keep directory if any child matches the search
        const filteredChildren = filterTree(entry.children || [], q);
        if (filteredChildren.length > 0) {
          return { ...entry, children: filteredChildren };
        }
        return null;
      }
      // Match files against title and path
      const title = (entry.title || entry.name).toLowerCase();
      if (title.includes(q) || entry.path.toLowerCase().includes(q)) {
        return entry;
      }
      return null;
    })
    .filter(Boolean) as DocTreeEntry[];
}

/**
 * Collect all directory paths from a tree, used to auto-expand
 * all folders when a search query is active.
 */
function collectDirPaths(entries: DocTreeEntry[]): string[] {
  const paths: string[] = [];
  for (const e of entries) {
    if (e.type === "directory") {
      paths.push(e.path);
      if (e.children) paths.push(...collectDirPaths(e.children));
    }
  }
  return paths;
}

/**
 * DocsPage is a two-panel documentation browser:
 * - Left panel: searchable, collapsible tree navigator
 * - Right panel: rendered markdown content
 * Selected doc path is stored in the URL query param (?path=...) for shareability.
 */
function DocsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activePath = searchParams.get("path") || "README.md"; // Default to root README

  const [search, setSearch] = useState("");
  // Pre-expand top-level directories so the tree is immediately useful
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(["architecture", "reference", "guides", "operating-model", "decisions", "planning"])
  );

  // Fetch the docs directory tree for the sidebar
  const { data: tree, isLoading: treeLoading } = useQuery({
    queryKey: ["docs-tree"],
    queryFn: api.getDocsTree,
  });

  // Fetch the selected document content (only when a path is active)
  const { data: doc, isLoading: docLoading } = useQuery({
    queryKey: ["doc-content", activePath],
    queryFn: () => api.getDocContent(activePath!),
    enabled: !!activePath,
  });

  // Toggle directory expand/collapse in the tree
  const onToggle = useCallback(
    (path: string) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(path)) next.delete(path);
        else next.add(path);
        return next;
      });
    },
    []
  );

  // Navigate to a doc by updating the URL query parameter
  const onSelect = useCallback(
    (path: string) => {
      router.push(`/docs?path=${encodeURIComponent(path)}`);
    },
    [router]
  );

  // Apply search filter to the tree
  const filteredTree = tree ? filterTree(tree, search) : [];

  // When searching, auto-expand all directories that contain matching results
  const effectiveExpanded =
    search.trim() && filteredTree.length > 0
      ? new Set(collectDirPaths(filteredTree))
      : expanded;

  return (
    // Full-height layout with negative margin to fill the parent padding
    <div className="flex h-[calc(100vh-48px)] -m-6">
      {/* Left panel: tree sidebar with search */}
      <div className="w-72 border-r border-border flex flex-col shrink-0 bg-card">
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-sm font-semibold">Documentation</h2>
            <HelpPopover title="Documentation browser">
              Browse all project documentation organized by topic. Folders
              group related docs together. Use the search bar to find
              specific topics across all files. Click a document to view
              its rendered content.
            </HelpPopover>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search docs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>
        {/* Scrollable tree area */}
        <div className="flex-1 overflow-auto p-2">
          {treeLoading ? (
            <p className="text-sm text-muted-foreground p-2">Loading...</p>
          ) : filteredTree.length === 0 ? (
            <p className="text-sm text-muted-foreground p-2">No docs found</p>
          ) : (
            filteredTree.map((entry) => (
              <TreeNode
                key={entry.path}
                entry={entry}
                depth={0}
                activePath={activePath}
                onSelect={onSelect}
                expanded={effectiveExpanded}
                onToggle={onToggle}
              />
            ))
          )}
        </div>
      </div>

      {/* Right panel: markdown content area */}
      <div className="flex-1 overflow-auto">
        {docLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading document...</p>
          </div>
        ) : doc ? (
          // Render markdown with Tailwind prose typography for dark mode
          <article className="max-w-4xl mx-auto p-8 prose prose-invert prose-sm prose-headings:scroll-mt-4 prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-code:text-orange-300 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-border prose-table:text-sm prose-th:text-left prose-img:rounded-lg">
            <Markdown
              remarkPlugins={[remarkFrontmatter, remarkGfm]}
              components={{
                a: ({ href, children, ...props }) => {
                  // External links open in a new tab
                  if (!href || href.startsWith("http://") || href.startsWith("https://")) {
                    return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
                  }
                  // Resolve relative markdown links within the docs tree
                  const resolved = resolveDocPath(href, activePath);
                  if (resolved) {
                    return (
                      <a
                        href={`/docs?path=${encodeURIComponent(resolved)}`}
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(`/docs?path=${encodeURIComponent(resolved)}`);
                        }}
                        {...props}
                      >
                        {children}
                      </a>
                    );
                  }
                  // Links that escape docs/ (e.g., ../../domain/) open normally
                  return <a href={href} {...props}>{children}</a>;
                },
              }}
            >
              {doc.content}
            </Markdown>
          </article>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Document not found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading...</p></div>}>
      <DocsPageContent />
    </Suspense>
  );
}
