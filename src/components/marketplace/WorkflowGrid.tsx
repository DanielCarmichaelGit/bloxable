import { useState, useEffect } from "react";
import { Search, Filter, SortAsc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SkeletonWorkflowCard } from "@/components/ui/skeleton";
import { api, type Workflow } from "@/lib/api";
import WorkflowCard from "./WorkflowCard";

export default function WorkflowGrid() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState<Workflow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setLoading(true);
        const data = await api.getWorkflows();
        setWorkflows(data);
      } catch (error) {
        console.error("Failed to fetch workflows:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  useEffect(() => {
    let filtered = workflows;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (workflow) =>
          workflow.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          workflow.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          workflow.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Filter by tag
    if (selectedTag !== "all") {
      filtered = filtered.filter((workflow) =>
        workflow.tags.includes(selectedTag)
      );
    }

    // Sort workflows
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

    setFilteredWorkflows(filtered);
  }, [workflows, searchTerm, selectedTag, sortBy]);

  const allTags = Array.from(
    new Set(workflows.flatMap((workflow) => workflow.tags))
  );

  const renderWorkflowGrid = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, index) => (
            <SkeletonWorkflowCard key={`skeleton-${index}`} />
          ))}
        </div>
      );
    }

    if (filteredWorkflows.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No workflows found</h3>
            <p>
              Try adjusting your search terms or filters to find what you're
              looking for.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredWorkflows.map((workflow, index) => (
          <WorkflowCard key={workflow.id} workflow={workflow} index={index} />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Browse Workflows
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          Discover automation workflows designed for small teams, local
          businesses, and personal projects. Each workflow is tested and ready
          to deploy.
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            size="icon"
            className="md:hidden h-11 w-11"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            aria-label="Toggle filters"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Desktop Filters */}
        <div className="hidden md:flex items-center justify-between gap-4">
          <div className="flex gap-4">
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile Filters */}
        {showMobileFilters && (
          <div className="md:hidden space-y-3 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <SortAsc className="h-4 w-4" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="mobile-tag-filter"
                  className="text-xs font-medium text-muted-foreground mb-1 block"
                >
                  Filter by tag
                </label>
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger id="mobile-tag-filter" className="w-full">
                    <SelectValue placeholder="Filter by tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {allTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label
                  htmlFor="mobile-sort-filter"
                  className="text-xs font-medium text-muted-foreground mb-1 block"
                >
                  Sort by
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="mobile-sort-filter" className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Workflows Grid */}
      {renderWorkflowGrid()}
    </div>
  );
}
