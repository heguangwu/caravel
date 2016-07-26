import moment from 'moment';
import {
  ADD_QUERY_EDITOR,
  ADD_TABLE, REMOVE_TABLE,
  REMOVE_QUERY_EDITOR,
  START_QUERY,
  STOP_QUERY,
  REMOVE_QUERY,
  QUERY_SUCCESS,
  QUERY_FAILED,
  EXPAND_TABLE,
  COLLAPSE_TABLE,
  QUERY_EDITOR_SETDB,
  QUERY_EDITOR_SET_TITLE,
  QUERY_EDITOR_SET_AUTORUN,
  SET_WORKSPACE_DB,
  ADD_WORKSPACE_QUERY,
  REMOVE_WORKSPACE_QUERY,
  SET_ACTIVE_QUERY_EDITOR,
} from './actions';
import shortid from 'shortid';

var qe = {
  id: shortid.generate(),
  title: "Query 1",
  sql: "SELECT *\nFROM\nWHERE",
  latestQueryId: null,
  autorun: false,
  dbId: null,
};

const initialState = {
  queryEditors: [qe],
  queries: [],
  tables: [],
  workspaceQueries: [],
  tabHistory: [qe.id],
  workspaceDatabase: null,
};

function alterInArr(state, arrKey, obj, alterations, idKey = 'id') {
  // Finds an item in an array in the state and replaces it with a
  // new object with an altered property
  var newArr = [];
  state[arrKey].forEach((arrItem) => {
    if (obj[idKey] === arrItem[idKey]) {
      var newObj = Object.assign({}, arrItem, alterations);
      newArr.push(newObj);
    } else {
      newArr.push(arrItem);
    }
  });
  var newState = {};
  newState[arrKey] = newArr;
  return Object.assign({}, state, newState);
}

function removeFromArr(state, arrKey, obj, idKey = 'id') {
  var newArr = [];
  state[arrKey].forEach((arrItem) => {
    if (!(obj[idKey] === arrItem[idKey])) {
      newArr.push(arrItem);
    }
  });
  var newState = {};
  newState[arrKey] = newArr;
  return Object.assign({}, state, newState);
}

function addToArr(state, arrKey, obj) {
  var newState = {};
  newState[arrKey] = [...state[arrKey], Object.assign({}, obj)];
  return Object.assign({}, state, newState);
}

function sqlAnvilReducer(state = initialState, action) {
  var alts, tabHistory, qeIds;
  switch (action.type) {

    case ADD_QUERY_EDITOR:
      tabHistory = state.tabHistory.slice();
      tabHistory.push(action.queryEditor.id);
      state = Object.assign({}, state, { tabHistory });
      return addToArr(state, 'queryEditors', action.queryEditor);

    case REMOVE_QUERY_EDITOR:
      var newState = removeFromArr(state, 'queryEditors', action.queryEditor);
      // List of remaining queryEditor ids
      qeIds = newState.queryEditors.map((qe) => { return qe.id; });
      var th = state.tabHistory.slice();
      th = th.filter((id) => { return qeIds.includes(id); });
      newState = Object.assign({}, newState, { tabHistory: th });
      return newState;

    case REMOVE_QUERY:
      console.log(action.query);
      return removeFromArr(state, 'queries', action.query);

    case ADD_TABLE:
      return addToArr(state, 'tables', action.table);

    case EXPAND_TABLE:
      return alterInArr(state, 'tables', action.table, { expanded: true });

    case COLLAPSE_TABLE:
      return alterInArr(state, 'tables', action.table, { expanded: false });

    case REMOVE_TABLE:
      return removeFromArr(state, 'tables', action.table);

    case START_QUERY:
      state = addToArr(state, 'queries', action.query);
      return alterInArr(state, 'queryEditors', { id: action.query.sqlEditorId }, { latestQueryId: action.query.id });

    case STOP_QUERY:
      return alterInArr(state, 'queries', action.query, { state: 'stopped' });

    case QUERY_SUCCESS:
      alts = {
        state: 'success',
        results: action.results,
        rows: action.results.data.length,
        endDttm: moment(),
      };
      return alterInArr(state, 'queries', action.query, alts);

    case QUERY_FAILED:
      alts = { state: 'failed', msg: action.msg, endDttm: moment() };
      return alterInArr(state, 'queries', action.query, alts);

    case QUERY_EDITOR_SETDB:
      return alterInArr(state, 'queryEditors', action.queryEditor, { dbId: action.dbId });

    case QUERY_EDITOR_SET_TITLE:
      return alterInArr(state, 'queryEditors', action.queryEditor, { title: action.title });

    case QUERY_EDITOR_SET_AUTORUN:
      return alterInArr(state, 'queryEditors', action.queryEditor, { autorun: action.autorun });

    case SET_WORKSPACE_DB:
      // Auto selecting database for queryEditors that don't have one yet
      var oneChanged = false;
      var queryEditors = state.queryEditors.map((qe) => {
        if (qe.dbId === null) {
          oneChanged = true;
          return Object.assign({}, qe, { dbId: action.db.id });
        } else {
          return qe;
        }
      });
      if (oneChanged) {
        state = Object.assign({}, state, { queryEditors });
      }
      return Object.assign({}, state, { workspaceDatabase: action.db });

    case ADD_WORKSPACE_QUERY:
      return addToArr(state, 'workspaceQueries', action.query);

    case REMOVE_WORKSPACE_QUERY:
      return removeFromArr(state, 'workspaceQueries', action.query);

    case SET_ACTIVE_QUERY_EDITOR:
      qeIds = state.queryEditors.map((qe) => { return qe.id; });
      if (qeIds.includes(action.queryEditor.id)) {
        tabHistory = state.tabHistory.slice();
        tabHistory.push(action.queryEditor.id);
        return Object.assign({}, state, { tabHistory });
      }
      return state;

    default:
      return state;
  }
}

export default sqlAnvilReducer;
