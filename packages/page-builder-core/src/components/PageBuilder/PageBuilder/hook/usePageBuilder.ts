import { useCallback, useReducer, useRef, useState } from "react";
import type { ILayoutData, PageNode, SerializableLayoutItem } from "../../../../models/pageBuilder";
import {
  addSectionToNode,
  addSectionAfterIndex,
  addComponentToNode,
  deleteNodeById,
  cloneNodeById,
  changeSectionLayout,
  updateComponentPropsById,
} from "../../../../utils/treeOps";
import {
  layoutDataToNodes,
  nodesToLayoutData,
  serializeLayout,
} from "../../../../utils/layoutDataOps";

// ─── Actions ──────────────────────────────────────────────────────────────────

type TreeAction =
  | { type: "ADD_SECTION_TO"; targetId: string; columns: readonly number[] }
  | { type: "ADD_SECTION_AFTER"; parentId: string; afterIndex: number; columns: readonly number[] }
  | {
      type: "ADD_COMPONENT";
      targetId: string;
      componentName: string;
      componentProps?: Record<string, unknown>;
    }
  | { type: "CHANGE_LAYOUT"; sectionId: string; columns: readonly number[] }
  | { type: "DELETE"; nodeId: string }
  | { type: "CLONE"; nodeId: string }
  | { type: "SET_NODES"; nodes: readonly PageNode[] }
  | { type: "UPDATE_COMPONENT_PROPS"; nodeId: string; patch: Record<string, unknown> };

type UiAction =
  | { type: "SET_ACTIVE_SECTION"; id: string | null }
  | { type: "SET_ACTIVE_COMPONENT"; id: string | null }
  | { type: "SET_POPUP"; id: string | null }
  | { type: "SET_SHOW_SECTION"; show: boolean }
  | { type: "TOGGLE_EDIT_MODE" };

type Action = TreeAction | UiAction;

// ─── State ────────────────────────────────────────────────────────────────────

interface State {
  readonly nodes: readonly PageNode[];
  readonly isEditMode: boolean;
  readonly activeSectionId: string | null;
  readonly activeComponentId: string | null;
  readonly popUpId: string | null;
  readonly showSection: boolean;
}

const makeInitial = (defaultValue?: ILayoutData[]): State => ({
  nodes: defaultValue ? layoutDataToNodes(defaultValue) : [],
  isEditMode: true,
  activeSectionId: null,
  activeComponentId: null,
  popUpId: null,
  showSection: true,
});

// ─── Reducer ─────────────────────────────────────────────────────────────────

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_SECTION_TO":
      return {
        ...state,
        nodes: addSectionToNode(state.nodes, action.targetId, action.columns),
        popUpId: null,
      };

    case "ADD_SECTION_AFTER":
      return {
        ...state,
        nodes: addSectionAfterIndex(
          state.nodes,
          action.parentId,
          action.afterIndex,
          action.columns,
        ),
        popUpId: null,
      };

    case "ADD_COMPONENT":
      return {
        ...state,
        nodes: addComponentToNode(
          state.nodes,
          action.targetId,
          action.componentName,
          action.componentProps,
        ),
        popUpId: null,
      };

    case "DELETE":
      return {
        ...state,
        nodes: deleteNodeById(state.nodes, action.nodeId),
        activeComponentId:
          state.activeComponentId === action.nodeId ? null : state.activeComponentId,
        activeSectionId: state.activeSectionId === action.nodeId ? null : state.activeSectionId,
      };

    case "CHANGE_LAYOUT":
      return { ...state, nodes: changeSectionLayout(state.nodes, action.sectionId, action.columns) };

    case "CLONE":
      return { ...state, nodes: cloneNodeById(state.nodes)(action.nodeId) };

    case "UPDATE_COMPONENT_PROPS":
      return { ...state, nodes: updateComponentPropsById(state.nodes, action.nodeId, action.patch) };

    case "SET_NODES":
      return { ...state, nodes: action.nodes };

    case "SET_ACTIVE_SECTION":
      return { ...state, activeSectionId: action.id };

    case "SET_ACTIVE_COMPONENT":
      return { ...state, activeComponentId: action.id };

    case "SET_POPUP":
      return { ...state, popUpId: action.id };

    case "SET_SHOW_SECTION":
      return { ...state, showSection: action.show };

    case "TOGGLE_EDIT_MODE":
      return {
        ...state,
        isEditMode: !state.isEditMode,
        activeSectionId: null,
        activeComponentId: null,
        popUpId: null,
      };

    default:
      return state;
  }
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface Options {
  /** Controlled value as flat ILayoutData[]. */
  value?: ILayoutData[];
  /** Called with serializable ILayoutData[] (renderComponent stripped) on every change. */
  onChange?: (items: SerializableLayoutItem[]) => void;
  /** Initial value for uncontrolled mode. */
  defaultValue?: ILayoutData[];
  editMode?: boolean;
  onEditModeChange?: (isEdit: boolean) => void;
  /** Maximum number of undo steps to retain. Default: 50. */
  maxHistorySize?: number;
}

export const usePageBuilder = ({
  value,
  onChange,
  defaultValue,
  editMode: controlledEditMode,
  onEditModeChange,
  maxHistorySize,
}: Options = {}) => {
  const isControlled = value !== undefined;
  const maxHistory = maxHistorySize ?? 50;

  // Internal state always uses PageNode[] for the builder engine.
  const [state, dispatch] = useReducer(reducer, makeInitial(defaultValue));

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // In controlled mode, derive nodes from the external ILayoutData[].
  const nodes = isControlled ? layoutDataToNodes(value) : state.nodes;

  // ── History tracking ────────────────────────────────────────────────────────
  // Stored in refs to avoid extra re-renders; only canUndo/canRedo are state.
  const initialNodes = defaultValue ? layoutDataToNodes(defaultValue) : [];
  const historyRef = useRef<readonly (readonly PageNode[])[]>([initialNodes]);
  const cursorRef = useRef<number>(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const pushHistory = useCallback(
    (nextNodes: readonly PageNode[]) => {
      // Truncate any redo entries beyond the current cursor, then append
      const base = historyRef.current.slice(0, cursorRef.current + 1);
      historyRef.current = [...base, nextNodes].slice(-maxHistory);
      cursorRef.current = historyRef.current.length - 1;
      setCanUndo(cursorRef.current > 0);
      setCanRedo(false);
    },
    [maxHistory],
  );

  // ── setNodes (shared by undo/redo/reset) ────────────────────────────────────
  const setNodes = useCallback(
    (nextNodes: readonly PageNode[]) => {
      if (isControlled) {
        onChangeRef.current?.(serializeLayout(nodesToLayoutData(nextNodes)));
      } else {
        dispatch({ type: "SET_NODES", nodes: nextNodes });
      }
    },
    [isControlled],
  );

  // ── dispatchTree — all layout mutations go through here ────────────────────
  const dispatchTree = useCallback(
    (action: TreeAction) => {
      const currentNodes = isControlled ? layoutDataToNodes(value ?? []) : state.nodes;
      // Use reducer as a pure function to compute nextNodes synchronously
      const nextNodes = reducer({ ...state, nodes: currentNodes }, action).nodes;

      if (isControlled) {
        onChangeRef.current?.(serializeLayout(nodesToLayoutData(nextNodes)));
      } else {
        dispatch(action);
      }

      pushHistory(nextNodes);
    },
    [isControlled, state, value, pushHistory],
  );

  const addSection = useCallback(
    (targetId: string, columns: readonly number[]) =>
      dispatchTree({ type: "ADD_SECTION_TO", targetId, columns }),
    [dispatchTree],
  );

  const addSectionAfter = useCallback(
    (parentId: string, afterIndex: number, columns: readonly number[]) =>
      dispatchTree({ type: "ADD_SECTION_AFTER", parentId, afterIndex, columns }),
    [dispatchTree],
  );

  const addComponent = useCallback(
    (targetId: string, componentName: string, componentProps?: Record<string, unknown>) =>
      dispatchTree({ type: "ADD_COMPONENT", targetId, componentName, componentProps }),
    [dispatchTree],
  );

  const changeLayout = useCallback(
    (sectionId: string, columns: readonly number[]) =>
      dispatchTree({ type: "CHANGE_LAYOUT", sectionId, columns }),
    [dispatchTree],
  );

  const deleteNode = useCallback(
    (nodeId: string) => dispatchTree({ type: "DELETE", nodeId }),
    [dispatchTree],
  );

  const cloneNode = useCallback(
    (nodeId: string) => dispatchTree({ type: "CLONE", nodeId }),
    [dispatchTree],
  );

  const updateComponentProps = useCallback(
    (nodeId: string, patch: Record<string, unknown>) =>
      dispatchTree({ type: "UPDATE_COMPONENT_PROPS", nodeId, patch }),
    [dispatchTree],
  );

  // ── Undo / Redo ─────────────────────────────────────────────────────────────

  const undo = useCallback(() => {
    if (cursorRef.current <= 0) return;
    cursorRef.current -= 1;
    const prevNodes = historyRef.current[cursorRef.current];
    setNodes(prevNodes);
    setCanUndo(cursorRef.current > 0);
    setCanRedo(true);
  }, [setNodes]);

  const redo = useCallback(() => {
    if (cursorRef.current >= historyRef.current.length - 1) return;
    cursorRef.current += 1;
    const nextNodes = historyRef.current[cursorRef.current];
    setNodes(nextNodes);
    setCanUndo(true);
    setCanRedo(cursorRef.current < historyRef.current.length - 1);
  }, [setNodes]);

  // ── Reset — clears history ──────────────────────────────────────────────────

  const resetLayout = useCallback(() => {
    historyRef.current = [[]];
    cursorRef.current = 0;
    setCanUndo(false);
    setCanRedo(false);
    setNodes([]);
  }, [setNodes]);

  // ── UI state actions ────────────────────────────────────────────────────────

  const setActiveSection = useCallback(
    (id: string | null) => dispatch({ type: "SET_ACTIVE_SECTION", id }),
    [],
  );
  const setActiveComponent = useCallback(
    (id: string | null) => dispatch({ type: "SET_ACTIVE_COMPONENT", id }),
    [],
  );
  const setPopUp = useCallback((id: string | null) => dispatch({ type: "SET_POPUP", id }), []);
  const setShowSection = useCallback(
    (show: boolean) => dispatch({ type: "SET_SHOW_SECTION", show }),
    [],
  );

  const toggleEditMode = useCallback(() => {
    if (controlledEditMode !== undefined) {
      onEditModeChange?.(!controlledEditMode);
    } else {
      dispatch({ type: "TOGGLE_EDIT_MODE" });
    }
  }, [controlledEditMode, onEditModeChange]);

  const isEditMode = controlledEditMode !== undefined ? controlledEditMode : state.isEditMode;

  return {
    nodes,
    isEditMode,
    activeSectionId: state.activeSectionId,
    activeComponentId: state.activeComponentId,
    popUpId: state.popUpId,
    showSection: state.showSection,
    addSection,
    addSectionAfter,
    addComponent,
    changeLayout,
    deleteNode,
    cloneNode,
    updateComponentProps,
    setNodes,
    resetLayout,
    setActiveSection,
    setActiveComponent,
    setPopUp,
    setShowSection,
    toggleEditMode,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
