"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, Suspense, memo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Trash2, Edit, Plus, GitBranch, Play } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
  type Connection,
  NodeTypes,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";

// Import custom node components
import { InputNode } from "@/components/workflow/InputNode";
import { AICategoryNode } from "@/components/workflow/AICategoryNode";
import { RulesCategoryNode } from "@/components/workflow/RulesCategoryNode";
import { OutputNode } from "@/components/workflow/OutputNode";

const nodeTypes: NodeTypes = {
  inputNode: InputNode,
  aiCategory: AICategoryNode,
  rulesCategory: RulesCategoryNode,
  outputNode: OutputNode,
};

interface Category {
  id: string;
  name: string;
  color: string;
  parentId?: string;
  subcategories?: Category[];
  _count?: {
    rules: number;
  };
}

interface CategoryRule {
  id: string;
  categoryId: string;
  category?: Category;
  name: string;
  matchField: string;
  matchPattern: string;
  minAmount?: number;
  maxAmount?: number;
  priority: number;
  isActive: boolean;
}

interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Dagre layout function for horizontal flow
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "LR", ranksep: 150, nodesep: 100 }); // LR = Left to Right

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 250, height: 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      selected: false,
      position: {
        x: nodeWithPosition.x - 125,
        y: nodeWithPosition.y - 50,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Flow Canvas Component with fitView capability
const FlowCanvas = memo(function FlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onSelectionChange,
  nodeTypes,
  shouldFitView,
}: {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: any;
  onSelectionChange: any;
  nodeTypes: NodeTypes;
  shouldFitView?: boolean;
}) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    // Only fit view when explicitly requested (e.g., on new connections, not on drag)
    if (shouldFitView) {
      const timer = setTimeout(() => {
        fitView({ padding: 0.2, duration: 200 });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [shouldFitView, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onSelectionChange={onSelectionChange}
      nodeTypes={nodeTypes}
      aria-label="Workflow canvas with nodes and connections"
      role="application"
      aria-roledescription="Interactive workflow diagram"
      data-testid="workflow-canvas"
      minZoom={0.1}
      maxZoom={4}
      defaultViewport={{ x: 0, y: 0, zoom: 1 }}
    >
      <Controls aria-label="Workflow canvas controls" />
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
    </ReactFlow>
  );
});

function CategoriesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [rules, setRules] = useState<CategoryRule[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [ruleOpen, setRuleOpen] = useState(false);
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");

  const currentTab = searchParams.get("tab") || "categories";
  const workflowIdParam = searchParams.get("workflowId");

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    color: "#3b82f6",
    parentId: "__none__",
  });

  const [ruleForm, setRuleForm] = useState({
    categoryId: "",
    name: "",
    matchField: "description",
    matchPattern: "",
    minAmount: "",
    maxAmount: "",
    priority: "0",
    isActive: true,
  });

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [editingWorkflowName, setEditingWorkflowName] = useState(false);
  const [tempWorkflowName, setTempWorkflowName] = useState("");
  const [deleteWorkflowDialogOpen, setDeleteWorkflowDialogOpen] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null);
  const [deleteNodeDialogOpen, setDeleteNodeDialogOpen] = useState(false);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [deleteRuleDialogOpen, setDeleteRuleDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);
  const [shouldFitView, setShouldFitView] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchRules();
    fetchWorkflows();
  }, []);

  useEffect(() => {
    if (currentWorkflow) {
      const layouted = getLayoutedElements(currentWorkflow.nodes, currentWorkflow.edges);
      setNodes(layouted.nodes);
      setEdges(layouted.edges);
      setSelectedNode(null); // Clear any selected node when switching workflows
      setSelectedEdge(null); // Clear any selected edge when switching workflows
      setShouldFitView(true); // Trigger fit view when switching workflows
    }
  }, [currentWorkflow]);

  // Reset shouldFitView after it's been triggered
  useEffect(() => {
    if (shouldFitView) {
      const timer = setTimeout(() => setShouldFitView(false), 100);
      return () => clearTimeout(timer);
    }
  }, [shouldFitView]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || data);
      }
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const fetchRules = async () => {
    try {
      const response = await fetch("/api/categories/rules");
      if (response.ok) {
        const data = await response.json();
        setRules(data);
      }
    } catch (error) {
      toast.error("Failed to load rules");
    }
  };

  const fetchWorkflows = async () => {
    try {
      const response = await fetch("/api/workflows");
      if (response.ok) {
        const data = await response.json();
        const workflowList = data.workflows || [];
        setWorkflows(workflowList);

        // Prioritize workflow from URL query param
        if (workflowIdParam) {
          const workflowFromParam = workflowList.find((w: Workflow) => w.id === workflowIdParam);
          if (workflowFromParam) {
            setCurrentWorkflow(workflowFromParam);
            return;
          }
        }

        // Otherwise, set the active workflow or the first one as current
        const activeWorkflow = workflowList.find((w: Workflow) => w.isActive);
        if (activeWorkflow) {
          setCurrentWorkflow(activeWorkflow);
        } else if (workflowList.length > 0) {
          setCurrentWorkflow(workflowList[0]);
        }
      }
    } catch (error) {
      toast.error("Failed to load workflows");
    }
  };

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workflowName,
          description: workflowDescription,
          nodes: [
            {
              id: "input-1",
              type: "inputNode",
              data: { label: "Transaction Input" },
              position: { x: 50, y: 200 },
            },
          ],
          edges: [],
          isActive: workflows.length === 0, // First workflow is active by default
        }),
      });

      if (response.ok) {
        const newWorkflow = await response.json();
        toast.success("Workflow created successfully");
        setWorkflowDialogOpen(false);
        setWorkflowName("");
        setWorkflowDescription("");

        // Switch to the new workflow automatically
        setCurrentWorkflow(newWorkflow);

        // Update URL with the new workflow ID
        const tabParam = searchParams.get("tab") || "flow";
        router.push(`/workflows?tab=${tabParam}&workflowId=${newWorkflow.id}`);

        fetchWorkflows();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create workflow");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleUpdateWorkflow = async () => {
    if (!currentWorkflow) return;

    toast.loading("Saving workflow...", { id: "save-workflow" });

    try {
      const response = await fetch(`/api/workflows/${currentWorkflow.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: currentWorkflow.name,
          description: currentWorkflow.description,
          nodes,
          edges,
          isActive: currentWorkflow.isActive,
        }),
      });

      if (response.ok) {
        toast.success("Workflow saved successfully", { id: "save-workflow" });
        fetchWorkflows();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save workflow", { id: "save-workflow" });
      }
    } catch (error) {
      toast.error("An error occurred", { id: "save-workflow" });
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    toast.loading("Deleting workflow...", { id: "delete-workflow" });

    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Workflow deleted successfully", { id: "delete-workflow" });
        setDeleteWorkflowDialogOpen(false);
        setWorkflowToDelete(null);
        fetchWorkflows();
      } else {
        toast.error("Failed to delete workflow", { id: "delete-workflow" });
      }
    } catch (error) {
      toast.error("An error occurred", { id: "delete-workflow" });
    }
  };

  const confirmDeleteWorkflow = (id: string) => {
    setWorkflowToDelete(id);
    setDeleteWorkflowDialogOpen(true);
  };

  const handleSetActiveWorkflow = async (id: string) => {
    try {
      const workflow = workflows.find((w) => w.id === id);
      if (!workflow) return;

      const response = await fetch(`/api/workflows/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...workflow,
          isActive: true,
        }),
      });

      if (response.ok) {
        toast.success("Active workflow updated");
        fetchWorkflows();
      } else {
        toast.error("Failed to update active workflow");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const addNode = (type: string) => {
    if (!currentWorkflow) {
      toast.error("Please create or select a workflow first");
      return;
    }

    // Generate consistent IDs for testing
    let nodeId = "";
    let nodeLabel = "";

    if (type === "aiCategory") {
      const existingAI = nodes.filter(n => n.type === "aiCategory").length;
      nodeId = `categorization-ai-${existingAI + 1}`;
      nodeLabel = "AI Categorization";
    } else if (type === "rulesCategory") {
      const existingRules = nodes.filter(n => n.type === "rulesCategory").length;
      nodeId = `categorization-rules-${existingRules + 1}`;
      nodeLabel = "Rules Categorization";
    } else if (type === "outputNode") {
      const existingOutput = nodes.filter(n => n.type === "outputNode").length;
      nodeId = `output-${existingOutput + 1}`;
      nodeLabel = "Output";
    } else {
      nodeId = `node-${Date.now()}`;
      nodeLabel = "Node";
    }

    // Calculate position: to the right of existing nodes, at mid-height
    let xPos = 300; // Default x position for first node
    let yPos = 200; // Default y position

    if (nodes.length > 0) {
      // Find the rightmost node
      const rightmostNode = nodes.reduce((max, node) =>
        node.position.x > max.position.x ? node : max, nodes[0]
      );

      // Place new node 300px to the right of the rightmost node
      xPos = rightmostNode.position.x + 300;

      // Calculate mid-height of all nodes
      const yPositions = nodes.map(n => n.position.y);
      const minY = Math.min(...yPositions);
      const maxY = Math.max(...yPositions);
      yPos = (minY + maxY) / 2;
    }

    const newNode: Node = {
      id: nodeId,
      type,
      data: {
        label: nodeLabel,
        config: {} // Initialize with empty config
      },
      position: { x: xPos, y: yPos },
      selected: false,
    };

    setNodes([...nodes, newNode]);
    setShouldFitView(true); // Trigger fit view when adding new node
    toast.success(`${nodeLabel} node added`);
  };

  const handleDeleteNode = () => {
    if (!selectedNode) return;

    // Remove the node and any connected edges
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) =>
      eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
    );
    setSelectedNode(null);
    setDeleteNodeDialogOpen(false);
    toast.success("Node deleted successfully");
  };

  const handleDeleteEdge = () => {
    if (!selectedEdge) return;

    setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
    setSelectedEdge(null);
    toast.success("Connection deleted successfully");
  };

  const confirmDeleteNode = () => {
    setDeleteNodeDialogOpen(true);
  };

  const handleTabChange = (value: string) => {
    const workflowId = searchParams.get("workflowId");
    const url = workflowId
      ? `/workflows?tab=${value}&workflowId=${workflowId}`
      : `/workflows?tab=${value}`;
    router.push(url);
  };

  const buildFlowDiagram = () => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Start node
    newNodes.push({
      id: "start",
      type: "input",
      data: { label: "New Transaction" },
      position: { x: 250, y: 25 },
      selected: false,
    });

    // Rule nodes
    const activeRules = rules.filter((r) => r.isActive).sort((a, b) => b.priority - a.priority);
    activeRules.forEach((rule, index) => {
      const yPos = 150 + index * 120;
      newNodes.push({
        id: `rule-${rule.id}`,
        data: {
          label: (
            <div className="text-xs">
              <div className="font-bold">{rule.name}</div>
              <div className="text-muted-foreground">
                {rule.matchField}: {rule.matchPattern}
              </div>
            </div>
          ),
        },
        position: { x: 100, y: yPos },
        selected: false,
      });

      // Category nodes
      const category = categories.find((c) => c.id === rule.categoryId);
      if (category) {
        const categoryNodeId = `category-${category.id}-${rule.id}`;
        newNodes.push({
          id: categoryNodeId,
          type: "output",
          data: {
            label: (
              <div className="text-xs">
                <div
                  className="w-3 h-3 rounded-full inline-block mr-1"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </div>
            ),
          },
          position: { x: 400, y: yPos },
          selected: false,
        });

        // Edge from rule to category
        newEdges.push({
          id: `edge-${rule.id}-${categoryNodeId}`,
          source: `rule-${rule.id}`,
          target: categoryNodeId,
          animated: true,
        });
      }

      // Edge from start to first rule
      if (index === 0) {
        newEdges.push({
          id: `edge-start-${rule.id}`,
          source: "start",
          target: `rule-${rule.id}`,
        });
      }

      // Edge from previous rule to next rule (fallthrough)
      if (index > 0) {
        newEdges.push({
          id: `edge-${activeRules[index - 1].id}-${rule.id}`,
          source: `rule-${activeRules[index - 1].id}`,
          target: `rule-${rule.id}`,
          label: "no match",
          type: "step",
        });
      }
    });

    // AI fallback node
    if (activeRules.length > 0) {
      newNodes.push({
        id: "ai-fallback",
        data: { label: "AI Categorization" },
        position: { x: 100, y: 150 + activeRules.length * 120 },
        selected: false,
      });

      newEdges.push({
        id: `edge-last-ai`,
        source: `rule-${activeRules[activeRules.length - 1].id}`,
        target: "ai-fallback",
        label: "no match",
        type: "step",
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({
        ...params,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        style: {
          strokeWidth: 2,
        },
      }, eds));
      setShouldFitView(true); // Trigger fit view on new connection
      toast.success("Connection added");
    },
    [setEdges]
  );

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: { nodes: Node[]; edges: Edge[] }) => {
      if (selectedNodes.length === 1) {
        setSelectedNode(selectedNodes[0]);
        setSelectedEdge(null);
      } else if (selectedEdges.length === 1) {
        setSelectedEdge(selectedEdges[0]);
        setSelectedNode(null);
      } else {
        setSelectedNode(null);
        setSelectedEdge(null);
      }
    },
    []
  );

  const updateNodeConfig = (nodeId: string, config: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, config } }
          : node
      )
    );

    // Update selectedNode immediately if it's the one being configured
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({
        ...selectedNode,
        data: { ...selectedNode.data, config }
      });
    }
  };

  const handleEditWorkflowName = () => {
    if (currentWorkflow) {
      setTempWorkflowName(currentWorkflow.name);
      setEditingWorkflowName(true);
    }
  };

  const handleSaveWorkflowName = async () => {
    if (!currentWorkflow || !tempWorkflowName.trim()) return;

    try {
      const response = await fetch(`/api/workflows/${currentWorkflow.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentWorkflow,
          name: tempWorkflowName.trim(),
          nodes,
          edges,
        }),
      });

      if (response.ok) {
        toast.success("Workflow name updated");
        setEditingWorkflowName(false);
        fetchWorkflows();
      } else {
        toast.error("Failed to update workflow name");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleCancelEditWorkflowName = () => {
    setEditingWorkflowName(false);
    setTempWorkflowName("");
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCategoryId ? `/api/categories/${editingCategoryId}` : "/api/categories";
      const method = editingCategoryId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...categoryForm,
          parentId: categoryForm.parentId === "__none__" ? undefined : categoryForm.parentId || undefined,
        }),
      });

      if (response.ok) {
        toast.success(editingCategoryId ? "Category updated successfully" : "Category created successfully");
        setCategoryOpen(false);
        setEditingCategoryId(null);
        setCategoryForm({ name: "", color: "#3b82f6", parentId: "__none__" });
        fetchCategories();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save category");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingRuleId ? `/api/categories/rules/${editingRuleId}` : "/api/categories/rules";
      const method = editingRuleId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...ruleForm,
          minAmount: ruleForm.minAmount ? parseFloat(ruleForm.minAmount) : undefined,
          maxAmount: ruleForm.maxAmount ? parseFloat(ruleForm.maxAmount) : undefined,
          priority: parseInt(ruleForm.priority),
        }),
      });

      if (response.ok) {
        toast.success(editingRuleId ? "Rule updated successfully" : "Rule created successfully");
        setRuleOpen(false);
        setEditingRuleId(null);
        setRuleForm({
          categoryId: "",
          name: "",
          matchField: "description",
          matchPattern: "",
          minAmount: "",
          maxAmount: "",
          priority: "0",
          isActive: true,
        });
        fetchRules();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save rule");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setCategoryForm({
      name: category.name,
      color: category.color,
      parentId: category.parentId || "",
    });
    setCategoryOpen(true);
  };

  const handleEditRule = (rule: CategoryRule) => {
    setEditingRuleId(rule.id);
    setRuleForm({
      categoryId: rule.categoryId,
      name: rule.name,
      matchField: rule.matchField,
      matchPattern: rule.matchPattern,
      minAmount: rule.minAmount?.toString() || "",
      maxAmount: rule.maxAmount?.toString() || "",
      priority: rule.priority.toString(),
      isActive: rule.isActive,
    });
    setRuleOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (response.ok) {
        toast.success("Category deleted successfully");
        setDeleteCategoryDialogOpen(false);
        setCategoryToDelete(null);
        fetchCategories();
      } else {
        toast.error("Failed to delete category");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const confirmDeleteCategory = (id: string) => {
    setCategoryToDelete(id);
    setDeleteCategoryDialogOpen(true);
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const response = await fetch(`/api/categories/rules/${id}`, { method: "DELETE" });
      if (response.ok) {
        toast.success("Rule deleted successfully");
        setDeleteRuleDialogOpen(false);
        setRuleToDelete(null);
        fetchRules();
      } else {
        toast.error("Failed to delete rule");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const confirmDeleteRule = (id: string) => {
    setRuleToDelete(id);
    setDeleteRuleDialogOpen(true);
  };

  const flattenCategories = (cats: Category[]): Category[] => {
    return cats.reduce((acc: Category[], cat) => {
      acc.push(cat);
      if (cat.subcategories) {
        acc.push(...flattenCategories(cat.subcategories));
      }
      return acc;
    }, []);
  };

  const renderCategoryTree = (cats: Category[], level = 0) => {
    return cats.map((category) => (
      <div key={category.id} style={{ marginLeft: level * 20 }}>
        <Card className="mb-2">
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: category.color }} />
                <div>
                  <CardTitle className="text-base">{category.name}</CardTitle>
                  {category._count && (
                    <CardDescription className="text-xs">
                      {category._count.rules} rule(s)
                    </CardDescription>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => confirmDeleteCategory(category.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
        {category.subcategories && category.subcategories.length > 0 && (
          <div>{renderCategoryTree(category.subcategories, level + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky-header">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost">← Back to Dashboard</Button>
          </Link>
          <h1 className="text-2xl font-bold">Workflows</h1>
          <div />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="flow">Workflow Builder</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Transaction Categories</h2>
                <p className="text-muted-foreground">Organize your transactions with custom categories</p>
              </div>
              <Dialog open={categoryOpen} onOpenChange={setCategoryOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleCategorySubmit}>
                    <DialogHeader>
                      <DialogTitle>{editingCategoryId ? "Edit Category" : "Add Category"}</DialogTitle>
                      <DialogDescription>
                        Create a category to organize your transactions
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="category-name">Category Name</Label>
                        <Input
                          id="category-name"
                          placeholder="Food & Dining"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category-color">Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="category-color"
                            type="color"
                            value={categoryForm.color}
                            onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                            className="w-20 h-10"
                          />
                          <Input
                            type="text"
                            value={categoryForm.color}
                            onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                            placeholder="#3b82f6"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parent-category">Parent Category (Optional)</Label>
                        <Select
                          value={categoryForm.parentId}
                          onValueChange={(value) => setCategoryForm({ ...categoryForm, parentId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="None (Top Level)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">None (Top Level)</SelectItem>
                            {flattenCategories(categories).map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setCategoryOpen(false);
                          setEditingCategoryId(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">{editingCategoryId ? "Update" : "Create"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No categories yet. Create your first category!</p>
                <Button onClick={() => setCategoryOpen(true)}>Add Your First Category</Button>
              </Card>
            ) : (
              <div>{renderCategoryTree(categories)}</div>
            )}
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Workflow Rules</h2>
                <p className="text-muted-foreground">Define rules for automated transaction categorization</p>
              </div>
              <Dialog open={ruleOpen} onOpenChange={setRuleOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <GitBranch className="mr-2 h-4 w-4" />
                    Add Rule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleRuleSubmit}>
                    <DialogHeader>
                      <DialogTitle>{editingRuleId ? "Edit Rule" : "Add Categorization Rule"}</DialogTitle>
                      <DialogDescription>
                        Create a rule to automatically categorize matching transactions
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="rule-name">Rule Name</Label>
                        <Input
                          id="rule-name"
                          placeholder="Grocery Stores"
                          value={ruleForm.name}
                          onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rule-category">Target Category</Label>
                        <Select
                          value={ruleForm.categoryId}
                          onValueChange={(value) => setRuleForm({ ...ruleForm, categoryId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {flattenCategories(categories).map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: cat.color }}
                                  />
                                  {cat.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="match-field">Match Field</Label>
                        <Select
                          value={ruleForm.matchField}
                          onValueChange={(value) => setRuleForm({ ...ruleForm, matchField: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="description">Description</SelectItem>
                            <SelectItem value="amount">Amount</SelectItem>
                            <SelectItem value="date">Date Pattern</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="match-pattern">Match Pattern</Label>
                        <Input
                          id="match-pattern"
                          placeholder="e.g., walmart, costco, whole foods"
                          value={ruleForm.matchPattern}
                          onChange={(e) => setRuleForm({ ...ruleForm, matchPattern: e.target.value })}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Use commas to separate multiple patterns (case-insensitive)
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="min-amount">Min Amount (Optional)</Label>
                          <Input
                            id="min-amount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={ruleForm.minAmount}
                            onChange={(e) => setRuleForm({ ...ruleForm, minAmount: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="max-amount">Max Amount (Optional)</Label>
                          <Input
                            id="max-amount"
                            type="number"
                            step="0.01"
                            placeholder="999999.99"
                            value={ruleForm.maxAmount}
                            onChange={(e) => setRuleForm({ ...ruleForm, maxAmount: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority (Higher = Checked First)</Label>
                        <Input
                          id="priority"
                          type="number"
                          value={ruleForm.priority}
                          onChange={(e) => setRuleForm({ ...ruleForm, priority: e.target.value })}
                          required
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="is-active"
                          checked={ruleForm.isActive}
                          onCheckedChange={(checked) =>
                            setRuleForm({ ...ruleForm, isActive: checked as boolean })
                          }
                        />
                        <Label htmlFor="is-active">Rule is active</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setRuleOpen(false);
                          setEditingRuleId(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">{editingRuleId ? "Update" : "Create"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {rules.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No rules yet. Create your first auto-categorization rule!</p>
                <Button onClick={() => setRuleOpen(true)}>Add Your First Rule</Button>
              </Card>
            ) : (
              <div className="space-y-2">
                {rules
                  .sort((a, b) => b.priority - a.priority)
                  .map((rule) => (
                    <Card key={rule.id} className={rule.isActive ? "" : "opacity-50"}>
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {rule.category && (
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: rule.category.color }}
                              />
                            )}
                            <div>
                              <CardTitle className="text-base">{rule.name}</CardTitle>
                              <CardDescription className="text-xs">
                                {rule.matchField}: {rule.matchPattern}
                                {rule.minAmount && ` | Min: ${rule.minAmount}`}
                                {rule.maxAmount && ` | Max: ${rule.maxAmount}`}
                                {" | "}Priority: {rule.priority}
                                {!rule.isActive && " | INACTIVE"}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditRule(rule)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => confirmDeleteRule(rule.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="flow" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Workflow Builder</h2>
                <p className="text-muted-foreground">
                  Build and customize your transaction categorization workflow
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" disabled>
                  <Play className="mr-2 h-4 w-4" />
                  Run Workflow
                </Button>
                <Dialog open={workflowDialogOpen} onOpenChange={setWorkflowDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Workflow
                    </Button>
                  </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleCreateWorkflow}>
                    <DialogHeader>
                      <DialogTitle>Create New Workflow</DialogTitle>
                      <DialogDescription>
                        Create a new workflow to manage transaction categorization
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="workflow-name">Workflow Name</Label>
                        <Input
                          id="workflow-name"
                          placeholder="My Workflow"
                          value={workflowName}
                          onChange={(e) => setWorkflowName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="workflow-description">Description (Optional)</Label>
                        <Input
                          id="workflow-description"
                          placeholder="Describe what this workflow does"
                          value={workflowDescription}
                          onChange={(e) => setWorkflowDescription(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setWorkflowDialogOpen(false);
                          setWorkflowName("");
                          setWorkflowDescription("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Create</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

            {workflows.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No workflows yet. Create your first workflow!
                </p>
                <Button onClick={() => setWorkflowDialogOpen(true)}>Create Your First Workflow</Button>
              </Card>
            ) : (
              <div className="flex gap-4 h-[calc(100vh-280px)]">
                {/* Left Sidebar */}
                <div className="w-72 flex-shrink-0 space-y-4">
                  <Card className="p-4">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="workflow-select" className="text-sm font-semibold">
                            Current Workflow
                          </Label>
                          {currentWorkflow && !editingWorkflowName && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={handleEditWorkflowName}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                        </div>

                        {editingWorkflowName ? (
                          <div className="space-y-2">
                            <Input
                              value={tempWorkflowName}
                              onChange={(e) => setTempWorkflowName(e.target.value)}
                              placeholder="Workflow name"
                              className="h-8 text-sm"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveWorkflowName();
                                if (e.key === "Escape") handleCancelEditWorkflowName();
                              }}
                              autoFocus
                            />
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                className="h-7 text-xs flex-1"
                                onClick={handleSaveWorkflowName}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs flex-1"
                                onClick={handleCancelEditWorkflowName}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Select
                            value={currentWorkflow?.id || ""}
                            onValueChange={(value) => {
                              const workflow = workflows.find((w) => w.id === value);
                              if (workflow) {
                                setCurrentWorkflow(workflow);
                                // Update URL with the selected workflow ID
                                const tabParam = searchParams.get("tab") || "flow";
                                router.push(`/workflows?tab=${tabParam}&workflowId=${value}`);
                              }
                            }}
                          >
                            <SelectTrigger id="workflow-select">
                              <SelectValue placeholder="Select a workflow" />
                            </SelectTrigger>
                            <SelectContent>
                              {workflows.map((workflow) => (
                                <SelectItem key={workflow.id} value={workflow.id}>
                                  {workflow.name} {workflow.isActive && "(Active)"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      {currentWorkflow && (
                        <div className="space-y-2">
                          <Button
                            className="w-full"
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetActiveWorkflow(currentWorkflow.id)}
                            disabled={currentWorkflow.isActive}
                          >
                            {currentWorkflow.isActive ? "Active Workflow" : "Set as Active"}
                          </Button>
                          <Button
                            className="w-full"
                            variant="outline"
                            size="sm"
                            onClick={handleUpdateWorkflow}
                          >
                            Save Workflow
                          </Button>
                          <Button
                            className="w-full"
                            variant="outline"
                            size="sm"
                            onClick={() => confirmDeleteWorkflow(currentWorkflow.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Workflow
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>

                  {currentWorkflow && !selectedNode && !selectedEdge && (
                    <Card className="p-4">
                      <div className="space-y-3">
                        <div className="text-sm font-semibold mb-2">Add Nodes</div>
                        <Button
                          className="w-full"
                          variant="secondary"
                          size="sm"
                          onClick={() => addNode("aiCategory")}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          AI Categorization
                        </Button>
                        <Button
                          className="w-full"
                          variant="secondary"
                          size="sm"
                          onClick={() => addNode("rulesCategory")}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Rules Categorization
                        </Button>
                        <Button
                          className="w-full"
                          variant="secondary"
                          size="sm"
                          onClick={() => addNode("outputNode")}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Output Action
                        </Button>
                      </div>
                    </Card>
                  )}

                  {selectedEdge && (
                    <Card className="p-4">
                      <div className="space-y-3">
                        <div className="text-sm font-semibold mb-2">Selected Connection</div>
                        <div className="text-xs text-muted-foreground mb-4">
                          Connection between nodes
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setSelectedEdge(null)}
                          >
                            Close
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={handleDeleteEdge}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}

                  {selectedNode && (
                    <Card className="p-4">
                      <div className="space-y-3">
                        <div className="text-sm font-semibold mb-2">Configure Node</div>
                        <div className="text-xs text-muted-foreground mb-4">
                          {selectedNode.data.label as string}
                        </div>

                        {selectedNode.type === "aiCategory" && (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor="ai-model" className="text-xs">AI Model</Label>
                              <Select
                                value={(selectedNode.data.config as any)?.model || "gpt-5"}
                                onValueChange={(value) =>
                                  updateNodeConfig(selectedNode.id, {
                                    ...(selectedNode.data.config as any),
                                    model: value,
                                  })
                                }
                              >
                                <SelectTrigger id="ai-model" className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                  <SelectGroup>
                                    <SelectLabel>OpenAI</SelectLabel>
                                    <SelectItem value="gpt-5">GPT-5</SelectItem>
                                    <SelectItem value="gpt-5-mini">GPT-5 Mini</SelectItem>
                                    <SelectItem value="gpt-5-nano">GPT-5 Nano</SelectItem>
                                    <SelectItem value="gpt-5-codex">GPT-5 Codex</SelectItem>
                                    <SelectItem value="gpt-5-chat-latest">GPT-5 Chat Latest</SelectItem>
                                  </SelectGroup>

                                  <SelectGroup>
                                    <SelectLabel>Anthropic</SelectLabel>
                                    <SelectItem value="claude-opus-4-1">Claude Opus 4.1</SelectItem>
                                    <SelectItem value="claude-opus-4-0">Claude Opus 4.0</SelectItem>
                                    <SelectItem value="claude-sonnet-4-0">Claude Sonnet 4.0</SelectItem>
                                    <SelectItem value="claude-3-7-sonnet-latest">Claude 3.7 Sonnet</SelectItem>
                                    <SelectItem value="claude-3-5-haiku-latest">Claude 3.5 Haiku</SelectItem>
                                  </SelectGroup>

                                  <SelectGroup>
                                    <SelectLabel>Google</SelectLabel>
                                    <SelectItem value="gemini-2.0-flash-exp">Gemini 2.0 Flash</SelectItem>
                                    <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                                    <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                                  </SelectGroup>

                                  <SelectGroup>
                                    <SelectLabel>xAI</SelectLabel>
                                    <SelectItem value="grok-4">Grok 4</SelectItem>
                                    <SelectItem value="grok-3">Grok 3</SelectItem>
                                    <SelectItem value="grok-3-mini">Grok 3 Mini</SelectItem>
                                  </SelectGroup>

                                  <SelectGroup>
                                    <SelectLabel>Mistral</SelectLabel>
                                    <SelectItem value="mistral-large-latest">Mistral Large</SelectItem>
                                    <SelectItem value="mistral-medium-latest">Mistral Medium</SelectItem>
                                    <SelectItem value="mistral-small-latest">Mistral Small</SelectItem>
                                  </SelectGroup>

                                  <SelectGroup>
                                    <SelectLabel>DeepSeek</SelectLabel>
                                    <SelectItem value="deepseek-chat">DeepSeek Chat</SelectItem>
                                    <SelectItem value="deepseek-reasoner">DeepSeek Reasoner</SelectItem>
                                  </SelectGroup>

                                  <SelectGroup>
                                    <SelectLabel>Meta (via Groq)</SelectLabel>
                                    <SelectItem value="llama-3.3-70b-versatile">Llama 3.3 70B</SelectItem>
                                    <SelectItem value="llama-3.1-8b-instant">Llama 3.1 8B</SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="ai-prompt" className="text-xs">Categorization Prompt</Label>
                              <Textarea
                                id="ai-prompt"
                                placeholder="Analyze the transaction description and amount to determine the appropriate category. Consider merchant names, transaction patterns, and spending context."
                                className="text-xs min-h-[100px]"
                                value={(selectedNode.data.config as any)?.prompt || ""}
                                onChange={(e) =>
                                  updateNodeConfig(selectedNode.id, {
                                    ...(selectedNode.data.config as any),
                                    prompt: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs">Structured Output Schema</Label>
                              <div className="text-xs text-muted-foreground mb-2">
                                Select available categories for AI to assign
                              </div>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {flattenCategories(categories).map((category) => (
                                  <div key={category.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`cat-${category.id}`}
                                      checked={
                                        (selectedNode.data.config as any)?.categories?.some(
                                          (c: any) => c.id === category.id
                                        ) || false
                                      }
                                      onCheckedChange={(checked) => {
                                        const currentCategories = (selectedNode.data.config as any)?.categories || [];
                                        const newCategories = checked
                                          ? [...currentCategories, { id: category.id, name: category.name, color: category.color }]
                                          : currentCategories.filter((c: any) => c.id !== category.id);
                                        updateNodeConfig(selectedNode.id, {
                                          ...(selectedNode.data.config as any),
                                          categories: newCategories,
                                        });
                                      }}
                                    />
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: category.color }}
                                      />
                                      <Label
                                        htmlFor={`cat-${category.id}`}
                                        className="text-xs font-normal cursor-pointer"
                                      >
                                        {category.name}
                                      </Label>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedNode.type === "rulesCategory" && (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label className="text-xs">Select Rules</Label>
                              <div className="space-y-2 max-h-64 overflow-y-auto">
                                {rules.map((rule) => (
                                  <div key={rule.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`rule-${rule.id}`}
                                      checked={
                                        (selectedNode.data.config as any)?.rules?.some(
                                          (r: any) => r.id === rule.id
                                        ) || false
                                      }
                                      onCheckedChange={(checked) => {
                                        const currentRules = (selectedNode.data.config as any)?.rules || [];
                                        const newRules = checked
                                          ? [...currentRules, { id: rule.id, name: rule.name }]
                                          : currentRules.filter((r: any) => r.id !== rule.id);
                                        updateNodeConfig(selectedNode.id, {
                                          ...(selectedNode.data.config as any),
                                          rules: newRules,
                                        });
                                      }}
                                    />
                                    <Label
                                      htmlFor={`rule-${rule.id}`}
                                      className="text-xs font-normal cursor-pointer"
                                    >
                                      {rule.name}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedNode.type === "outputNode" && (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor="output-type" className="text-xs">Output Type</Label>
                              <Select
                                value={(selectedNode.data.config as any)?.outputType || selectedNode.data.outputType || "webhook"}
                                onValueChange={(value) =>
                                  updateNodeConfig(selectedNode.id, {
                                    ...(selectedNode.data.config as any),
                                    outputType: value,
                                  })
                                }
                              >
                                <SelectTrigger id="output-type" className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="webhook">Webhook</SelectItem>
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="slack">Slack</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {(selectedNode.data.config as any)?.outputType === "webhook" && (
                              <div className="space-y-2">
                                <Label htmlFor="webhook-url" className="text-xs">Webhook URL</Label>
                                <Input
                                  id="webhook-url"
                                  placeholder="https://api.example.com/webhook"
                                  className="h-8 text-xs"
                                  value={(selectedNode.data.config as any)?.webhookUrl || ""}
                                  onChange={(e) =>
                                    updateNodeConfig(selectedNode.id, {
                                      ...(selectedNode.data.config as any),
                                      webhookUrl: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            )}

                            {(selectedNode.data.config as any)?.outputType === "email" && (
                              <div className="space-y-2">
                                <Label htmlFor="email-to" className="text-xs">Email Recipients</Label>
                                <Input
                                  id="email-to"
                                  placeholder="user@example.com"
                                  className="h-8 text-xs"
                                  value={(selectedNode.data.config as any)?.emailTo || ""}
                                  onChange={(e) =>
                                    updateNodeConfig(selectedNode.id, {
                                      ...(selectedNode.data.config as any),
                                      emailTo: e.target.value,
                                    })
                                  }
                                />
                                <Label htmlFor="email-subject" className="text-xs mt-2">Subject Template</Label>
                                <Input
                                  id="email-subject"
                                  placeholder="New Transaction: {category}"
                                  className="h-8 text-xs"
                                  value={(selectedNode.data.config as any)?.emailSubject || ""}
                                  onChange={(e) =>
                                    updateNodeConfig(selectedNode.id, {
                                      ...(selectedNode.data.config as any),
                                      emailSubject: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            )}

                            {(selectedNode.data.config as any)?.outputType === "slack" && (
                              <div className="space-y-2">
                                <Label htmlFor="slack-webhook" className="text-xs">Slack Webhook URL</Label>
                                <Input
                                  id="slack-webhook"
                                  placeholder="https://hooks.slack.com/services/..."
                                  className="h-8 text-xs"
                                  value={(selectedNode.data.config as any)?.slackWebhook || ""}
                                  onChange={(e) =>
                                    updateNodeConfig(selectedNode.id, {
                                      ...(selectedNode.data.config as any),
                                      slackWebhook: e.target.value,
                                    })
                                  }
                                />
                                <Label htmlFor="slack-channel" className="text-xs mt-2">Channel</Label>
                                <Input
                                  id="slack-channel"
                                  placeholder="#transactions"
                                  className="h-8 text-xs"
                                  value={(selectedNode.data.config as any)?.slackChannel || ""}
                                  onChange={(e) =>
                                    updateNodeConfig(selectedNode.id, {
                                      ...(selectedNode.data.config as any),
                                      slackChannel: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            )}

                            <div className="space-y-2">
                              <Label htmlFor="output-template" className="text-xs">Output Template</Label>
                              <Textarea
                                id="output-template"
                                placeholder="Transaction: {description}&#10;Amount: {amount}&#10;Category: {category}"
                                className="text-xs min-h-[80px]"
                                value={(selectedNode.data.config as any)?.template || ""}
                                onChange={(e) =>
                                  updateNodeConfig(selectedNode.id, {
                                    ...(selectedNode.data.config as any),
                                    template: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setSelectedNode(null)}
                          >
                            Close
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={confirmDeleteNode}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>

                {/* Main Canvas Area */}
                <div className="flex-1">
                  {currentWorkflow ? (
                    <Card className="p-0 overflow-hidden h-full">
                      <ReactFlowProvider>
                        <FlowCanvas
                          nodes={nodes}
                          edges={edges}
                          onNodesChange={onNodesChange}
                          onEdgesChange={onEdgesChange}
                          onConnect={onConnect}
                          onSelectionChange={onSelectionChange}
                          nodeTypes={nodeTypes}
                          shouldFitView={shouldFitView}
                        />
                      </ReactFlowProvider>
                    </Card>
                  ) : (
                    <Card className="p-12 text-center h-full flex items-center justify-center">
                      <div>
                        <p className="text-muted-foreground mb-4">
                          Select a workflow to start building
                        </p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={deleteWorkflowDialogOpen}
        onOpenChange={setDeleteWorkflowDialogOpen}
        onConfirm={() => workflowToDelete && handleDeleteWorkflow(workflowToDelete)}
        title="Delete Workflow"
        description="Are you sure you want to delete this workflow? This action cannot be undone."
        confirmText="Delete"
      />

      <ConfirmDialog
        open={deleteNodeDialogOpen}
        onOpenChange={setDeleteNodeDialogOpen}
        onConfirm={handleDeleteNode}
        title="Delete Node"
        description="Are you sure you want to delete this node? All connections to this node will also be removed."
        confirmText="Delete"
      />

      <ConfirmDialog
        open={deleteCategoryDialogOpen}
        onOpenChange={setDeleteCategoryDialogOpen}
        onConfirm={() => categoryToDelete && handleDeleteCategory(categoryToDelete)}
        title="Delete Category"
        description="Are you sure you want to delete this category? This will also delete all associated rules. This action cannot be undone."
        confirmText="Delete"
      />

      <ConfirmDialog
        open={deleteRuleDialogOpen}
        onOpenChange={setDeleteRuleDialogOpen}
        onConfirm={() => ruleToDelete && handleDeleteRule(ruleToDelete)}
        title="Delete Rule"
        description="Are you sure you want to delete this rule? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <CategoriesPageContent />
    </Suspense>
  );
}
