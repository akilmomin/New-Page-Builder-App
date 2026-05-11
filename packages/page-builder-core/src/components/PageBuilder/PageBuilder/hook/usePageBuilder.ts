import { useCallback, useReducer, useRef } from "react";
import type { PageNode } from "../../../../models/pageBuilder";
import {
  addSectionToNode,
  addSectionAfterIndex,
  addComponentToNode,
  deleteNodeById,
  cloneNodeById,
} from "../../../../utils/treeOps";

// ─── Actions ──────────────────────────────────────────────────────────────────

type TreeAction =
  | { type: "ADD_SECTION_TO";    targetId: string; columns: readonly number[] }
  | { type: "ADD_SECTION_AFTER"; parentId: string; afterIndex: number; columns: readonly number[] }
  | { type: "ADD_COMPONENT";     targetId: string; componentName: string; componentProps?: Record<string, unknown> }
  | { type: "DELETE";            nodeId: string }
  | { type: "CLONE";             nodeId: string }
  | { type: "SET_NODES";         nodes: readonly PageNode[] };

type UiAction =
  | { type: "SET_ACTIVE_SECTION";   id: string | null }
  | { type: "SET_ACTIVE_COMPONENT"; id: string | null }
  | { type: "SET_POPUP";            id: string | null }
  | { type: "SET_SHOW_SECTION";     show: boolean }
  | { type: "TOGGLE_EDIT_MODE" };

type Action = TreeAction | UiAction;

// ─── State ────────────────────────────────────────────────────────────────────

interface State {
  readonly nodes:             readonly PageNode[];
  readonly isEditMode:        boolean;
  readonly activeSectionId:   string | null;
  readonly activeComponentId: string | null;
  readonly popUpId:           string | null;
  readonly showSection:       boolean;
}

const makeInitial = (defaultValue?: readonly PageNode[]): State => ({
  nodes:             defaultValue ?? [],
  isEditMode:        true,
  activeSectionId:   null,
  activeComponentId: null,
  popUpId:           null,
  showSection:       true,
});

// ─── Reducer ─────────────────────────────────────────────────────────────────

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_SECTION_TO":
      return { ...state, nodes: addSectionToNode(state.nodes, action.targetId, action.columns), popUpId: null };

    case "ADD_SECTION_AFTER":
      return { ...state, nodes: addSectionAfterIndex(state.nodes, action.parentId, action.afterIndex, action.columns), popUpId: null };

    case "ADD_COMPONENT":
      return { ...state, nodes: addComponentToNode(state.nodes, action.targetId, action.componentName, action.componentProps), popUpId: null };

    case "DELETE":
      return {
        ...state,
        nodes: deleteNodeById(state.nodes, action.nodeId),
        activeComponentId: state.activeComponentId === action.nodeId ? null : state.activeComponentId,
        activeSectionId:   state.activeSectionId   === action.nodeId ? null : state.activeSectionId,
      };

    case "CLONE":
      return { ...state, nodes: cloneNodeById(state.nodes)(action.nodeId) };

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
      return { ...state, isEditMode: !state.isEditMode, activeSectionId: null, activeComponentId: null, popUpId: null };

    default:
      return state;
  }
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface Options {
  value?:             readonly PageNode[];
  onChange?:          (nodes: readonly PageNode[]) => void;
  defaultValue?:      readonly PageNode[];
  editMode?:          boolean;
  onEditModeChange?:  (isEdit: boolean) => void;
}

export const usePageBuilder = ({
  value,
  onChange,
  defaultValue,
  editMode: controlledEditMode,
  onEditModeChange,
}: Options = {}) => {
  const isControlled = value !== undefined;
  const [state, dispatch] = useReducer(reducer, makeInitial(defaultValue));

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const nodes = isControlled ? value : state.nodes;

  const dispatchTree = useCallback(
    (action: TreeAction) => {
      if (isControlled) {
        const nextState = reducer({ ...state, nodes: value ?? [] }, action);
        onChangeRef.current?.(nextState.nodes);
      } else {
        dispatch(action);
      }
    },
    [isControlled, state, value]
  );

  const addSection = useCallback(
    (targetId: string, columns: readonly number[]) =>
      dispatchTree({ type: "ADD_SECTION_TO", targetId, columns }),
    [dispatchTree]
  );

  const addSectionAfter = useCallback(
    (parentId: string, afterIndex: number, columns: readonly number[]) =>
      dispatchTree({ type: "ADD_SECTION_AFTER", parentId, afterIndex, columns }),
    [dispatchTree]
  );

  const addComponent = useCallback(
    (targetId: string, componentName: string, componentProps?: Record<string, unknown>) =>
      dispatchTree({ type: "ADD_COMPONENT", targetId, componentName, componentProps }),
    [dispatchTree]
  );

  const deleteNode = useCallback(
    (nodeId: string) => dispatchTree({ type: "DELETE", nodeId }),
    [dispatchTree]
  );

  const cloneNode = useCallback(
    (nodeId: string) => dispatchTree({ type: "CLONE", nodeId }),
    [dispatchTree]
  );

  const setNodes = useCallback(
    (nodes: readonly PageNode[]) => {
      if (isControlled) {
        onChangeRef.current?.(nodes);
      } else {
        dispatch({ type: "SET_NODES", nodes });
      }
    },
    [isControlled]
  );

  const setActiveSection  = useCallback((id: string | null) => dispatch({ type: "SET_ACTIVE_SECTION",   id }), []);
  const setActiveComponent = useCallback((id: string | null) => dispatch({ type: "SET_ACTIVE_COMPONENT", id }), []);
  const setPopUp           = useCallback((id: string | null) => dispatch({ type: "SET_POPUP",            id }), []);
  const setShowSection     = useCallback((show: boolean)     => dispatch({ type: "SET_SHOW_SECTION",     show }), []);

  const toggleEditMode = useCallback(() => {
    if (controlledEditMode !== undefined) {
      onEditModeChange?.(!controlledEditMode);
    } else {
      dispatch({ type: "TOGGLE_EDIT_MODE" });
    }
  }, [controlledEditMode, onEditModeChange]);

  const resetLayout = useCallback(() => setNodes([]), [setNodes]);

  const isEditMode = controlledEditMode !== undefined ? controlledEditMode : state.isEditMode;

  return {
    nodes,
    isEditMode,
    activeSectionId:   state.activeSectionId,
    activeComponentId: state.activeComponentId,
    popUpId:           state.popUpId,
    showSection:       state.showSection,
    addSection,
    addSectionAfter,
    addComponent,
    deleteNode,
    cloneNode,
    setNodes,
    resetLayout,
    setActiveSection,
    setActiveComponent,
    setPopUp,
    setShowSection,
    toggleEditMode,
  };
};
