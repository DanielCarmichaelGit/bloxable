// Mock API for Bloxable.io - Workflow Automation Marketplace
// This simulates Supabase Edge Functions calls

import { apiCache } from "./apiCache";

export interface Workflow {
  id: string;
  title: string;
  description: string;
  price: number;
  tags: string[];
  seller: {
    id: string;
    name: string;
    avatar?: string;
  };
  triggerType: "webhook" | "schedule" | "manual" | "event";
  configRequirements: ConfigRequirement[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  imageUrl?: string;
  setupTime?: string;
}

export interface ConfigRequirement {
  id: string;
  name: string;
  type:
    | "text"
    | "email"
    | "url"
    | "number"
    | "select"
    | "checkbox"
    | "textarea";
  label: string;
  description?: string;
  required: boolean;
  options?: string[]; // For select type
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  workflows: string[];
  createdAt: string;
}

// Mock data
const mockWorkflows: Workflow[] = [
  {
    id: "wf-001",
    title: "Customer Inquiry to CRM",
    description:
      "Perfect for small businesses - automatically add new customer inquiries from your website to your CRM system.",
    price: 19.99,
    tags: ["small-business", "crm", "customer-service", "automation"],
    seller: {
      id: "seller-001",
      name: "AutoFlow Solutions",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
    },
    triggerType: "webhook",
    configRequirements: [
      {
        id: "slack-webhook",
        name: "slackWebhookUrl",
        type: "url",
        label: "Slack Webhook URL",
        description: "The webhook URL from your Slack app",
        required: true,
        placeholder: "https://hooks.slack.com/services/...",
      },
      {
        id: "notion-token",
        name: "notionToken",
        type: "text",
        label: "Notion Integration Token",
        description: "Your Notion integration token",
        required: true,
        placeholder: "secret_...",
      },
      {
        id: "notion-database",
        name: "notionDatabaseId",
        type: "text",
        label: "Notion Database ID",
        required: true,
        placeholder: "12345678-1234-1234-1234-123456789012",
      },
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    isActive: true,
    imageUrl:
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop",
    setupTime: "30min",
  },
  {
    id: "wf-002",
    title: "Appointment Booking Automation",
    description:
      "Ideal for local service businesses - automatically schedule appointments and send confirmation emails to customers.",
    price: 24.99,
    tags: ["appointments", "local-business", "booking", "customer-service"],
    seller: {
      id: "seller-002",
      name: "Workflow Wizards",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
    },
    triggerType: "webhook",
    configRequirements: [
      {
        id: "email-address",
        name: "emailAddress",
        type: "email",
        label: "Email Address",
        description: "The email address to monitor",
        required: true,
        placeholder: "workflow@yourcompany.com",
      },
      {
        id: "trello-key",
        name: "trelloApiKey",
        type: "text",
        label: "Trello API Key",
        required: true,
        placeholder: "your-api-key",
      },
      {
        id: "trello-token",
        name: "trelloToken",
        type: "text",
        label: "Trello Token",
        required: true,
        placeholder: "your-token",
      },
      {
        id: "board-id",
        name: "boardId",
        type: "text",
        label: "Trello Board ID",
        required: true,
        placeholder: "board-id-here",
      },
    ],
    createdAt: "2024-01-10T14:30:00Z",
    updatedAt: "2024-01-10T14:30:00Z",
    isActive: true,
    imageUrl:
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop",
    setupTime: "1hr",
  },
  {
    id: "wf-003",
    title: "Inventory Alert System",
    description:
      "Perfect for small retail businesses - automatically track inventory levels and send alerts when stock is low.",
    price: 34.99,
    tags: ["inventory", "retail", "alerts", "small-business"],
    seller: {
      id: "seller-001",
      name: "AutoFlow Solutions",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
    },
    triggerType: "schedule",
    configRequirements: [
      {
        id: "schedule-time",
        name: "scheduleTime",
        type: "select",
        label: "Report Time",
        description: "When to generate the daily report",
        required: true,
        options: ["06:00", "09:00", "12:00", "18:00", "21:00"],
      },
      {
        id: "email-recipients",
        name: "emailRecipients",
        type: "text",
        label: "Email Recipients",
        description: "Comma-separated list of email addresses",
        required: true,
        placeholder: "team@company.com, manager@company.com",
      },
      {
        id: "data-sources",
        name: "dataSources",
        type: "select",
        label: "Data Sources",
        description: "Select which data sources to include",
        required: true,
        options: ["Sales", "Marketing", "Support", "Analytics"],
      },
    ],
    createdAt: "2024-01-05T09:15:00Z",
    updatedAt: "2024-01-05T09:15:00Z",
    isActive: true,
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
    setupTime: "2hr",
  },
  {
    id: "wf-004",
    title: "Local Business Review Monitor",
    description:
      "Great for local businesses - automatically monitor and respond to Google and Yelp reviews to maintain your online reputation.",
    price: 29.99,
    tags: ["reviews", "local-business", "reputation", "monitoring"],
    seller: {
      id: "seller-003",
      name: "Social Automators",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face",
    },
    triggerType: "manual",
    configRequirements: [
      {
        id: "platforms",
        name: "platforms",
        type: "select",
        label: "Social Media Platforms",
        description: "Select platforms to post to",
        required: true,
        options: ["Twitter", "LinkedIn", "Facebook", "Instagram"],
      },
      {
        id: "content-type",
        name: "contentType",
        type: "select",
        label: "Content Type",
        required: true,
        options: ["Text", "Image", "Video", "Link"],
      },
      {
        id: "posting-frequency",
        name: "postingFrequency",
        type: "select",
        label: "Posting Frequency",
        required: true,
        options: ["Daily", "Weekly", "Bi-weekly", "Monthly"],
      },
    ],
    createdAt: "2024-01-12T16:45:00Z",
    updatedAt: "2024-01-12T16:45:00Z",
    isActive: true,
    imageUrl:
      "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=200&fit=crop",
    setupTime: "45min",
  },
];

const mockSellers: Seller[] = [
  {
    id: "seller-001",
    name: "SmallBiz Automators",
    email: "contact@smallbizauto.com",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
    bio: "We create simple, affordable automation workflows specifically for small businesses and local services.",
    workflows: ["wf-001", "wf-003"],
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "seller-002",
    name: "Local Workflow Co",
    email: "hello@localworkflow.com",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
    bio: "Making automation accessible for local businesses and personal projects.",
    workflows: ["wf-002"],
    createdAt: "2024-01-05T00:00:00Z",
  },
  {
    id: "seller-003",
    name: "Personal Automators",
    email: "team@personalauto.com",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face",
    bio: "Helping individuals and small teams automate their daily tasks and workflows.",
    workflows: ["wf-004"],
    createdAt: "2024-01-08T00:00:00Z",
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// API functions
export const api = {
  // Get all workflows
  async getWorkflows(): Promise<Workflow[]> {
    return apiCache.get(
      "workflows_public",
      async () => {
        await delay(300);
        return mockWorkflows.filter((workflow) => workflow.isActive);
      },
      5 * 60 * 1000 // 5 minutes cache
    );
  },

  // Get workflow by ID
  async getWorkflow(id: string): Promise<Workflow | null> {
    await delay(200);
    return mockWorkflows.find((workflow) => workflow.id === id) || null;
  },

  // Get workflows by seller
  async getWorkflowsBySeller(sellerId: string): Promise<Workflow[]> {
    await delay(250);
    return mockWorkflows.filter((workflow) => workflow.seller.id === sellerId);
  },

  // Get all sellers
  async getSellers(): Promise<Seller[]> {
    await delay(200);
    return mockSellers;
  },

  // Get seller by ID
  async getSeller(id: string): Promise<Seller | null> {
    await delay(150);
    return mockSellers.find((seller) => seller.id === id) || null;
  },

  // Create new workflow (for seller dashboard)
  async createWorkflow(
    workflow: Omit<Workflow, "id" | "createdAt" | "updatedAt">
  ): Promise<Workflow> {
    await delay(500);
    const newWorkflow: Workflow = {
      ...workflow,
      id: `wf-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockWorkflows.push(newWorkflow);
    return newWorkflow;
  },

  // Update workflow
  async updateWorkflow(
    id: string,
    updates: Partial<Workflow>
  ): Promise<Workflow | null> {
    await delay(400);
    const index = mockWorkflows.findIndex((workflow) => workflow.id === id);
    if (index === -1) return null;

    mockWorkflows[index] = {
      ...mockWorkflows[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return mockWorkflows[index];
  },

  // Delete workflow
  async deleteWorkflow(id: string): Promise<boolean> {
    await delay(300);
    const index = mockWorkflows.findIndex((workflow) => workflow.id === id);
    if (index === -1) return false;

    mockWorkflows[index].isActive = false;
    return true;
  },

  // Purchase workflow (mock)
  async purchaseWorkflow(
    _workflowId: string,
    _config: Record<string, any>
  ): Promise<{ success: boolean; orderId?: string }> {
    await delay(1000);
    // Simulate purchase process
    return {
      success: true,
      orderId: `order-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 11)}`,
    };
  },
};
