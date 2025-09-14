import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, type Workflow } from "@/lib/api";
import WorkflowCard from "./WorkflowCard";

export default function WorkflowGrid() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState<Workflow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const data = await api.getWorkflows();
        setWorkflows(data);
      } catch (error) {
        console.error("Failed to fetch workflows:", error);
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
      <div className="mb-8 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-full sm:w-40">
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
            <SelectTrigger className="w-full sm:w-40">
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

      {/* Workflows Grid */}
      {filteredWorkflows.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow, index) => (
            <WorkflowCard key={workflow.id} workflow={workflow} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
